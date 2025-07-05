import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Contestant, BonusQuestion } from '@/types/pool';

export const useBonusQuestions = () => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [bonusAnswers, setBonusAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load contestants
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .order('name');
      
      const mappedContestants = contestantsData?.map(c => ({
        id: c.id,
        name: c.name,
        isActive: c.is_active,
        group_id: c.group_id,
        sort_order: c.sort_order
      })) || [];
      setContestants(mappedContestants);

      // Load bonus questions
      const { data: questionsData } = await supabase
        .from('bonus_questions')
        .select('*')
        .order('sort_order');
      
      const mappedQuestions = questionsData?.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type as 'player_select' | 'dual_player_select' | 'yes_no' | 'number',
        sort_order: q.sort_order,
        is_active: q.is_active,
        correct_answer: q.correct_answer,
        points_value: q.points_value,
        answer_revealed: q.answer_revealed
      })) || [];
      setBonusQuestions(mappedQuestions);

      // Initialize bonus answers with current values
      const initialAnswers: Record<string, any> = {};
      questionsData?.forEach(q => {
        if (q.correct_answer) {
          try {
            initialAnswers[q.id] = JSON.parse(q.correct_answer);
          } catch {
            initialAnswers[q.id] = q.correct_answer;
          }
        }
      });
      setBonusAnswers(initialAnswers);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load bonus questions data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivePlayerCount = async (players: string[]) => {
    const { data } = await supabase
      .from('contestants')
      .select('name')
      .in('name', players)
      .eq('is_active', true);
    
    return data?.length || 0;
  };

  const recalculateScores = async () => {
    try {
      // Get all pool entries
      const { data: entries } = await supabase
        .from('pool_entries')
        .select('*');

      if (!entries) return;

      // Get all weekly results
      const { data: weeklyResults } = await supabase
        .from('weekly_results')
        .select('*');

      // Get revealed bonus questions
      const { data: revealedQuestions } = await supabase
        .from('bonus_questions')
        .select('*')
        .eq('answer_revealed', true);

      // Calculate scores for each entry
      for (const entry of entries) {
        let weeklyPoints = 0;
        let bonusPoints = 0;

        // Calculate weekly survival points (5 points per active player per week)
        const activePlayers = Array.from({ length: activePool?.picks_per_team || 5 }, (_, i) => {
          const playerKey = `player_${i + 1}` as keyof typeof entry;
          return entry[playerKey] as string;
        }).filter(Boolean);
        const activeCount = await getActivePlayerCount(activePlayers);
        const weekCount = weeklyResults?.length || 0;
        weeklyPoints = activeCount * 5 * weekCount;

        // Calculate competition points
        weeklyResults?.forEach(week => {
          if (activePlayers.includes(week.hoh_winner)) weeklyPoints += 10;
          if (activePlayers.includes(week.pov_winner)) weeklyPoints += 5;
        });

        // Calculate bonus points
        revealedQuestions?.forEach(question => {
          if (question.correct_answer && entry.bonus_answers[question.id]) {
            const correctAnswer = JSON.parse(question.correct_answer);
            const userAnswer = entry.bonus_answers[question.id];
            
            if (question.question_type === 'dual_player_select') {
              if (correctAnswer.player1 === userAnswer.player1 && correctAnswer.player2 === userAnswer.player2) {
                bonusPoints += question.points_value;
              }
            } else if (correctAnswer === userAnswer) {
              bonusPoints += question.points_value;
            }
          }
        });

        // Update entry
        await supabase
          .from('pool_entries')
          .update({
            weekly_points: weeklyPoints,
            bonus_points: bonusPoints,
            total_points: weeklyPoints + bonusPoints,
          })
          .eq('id', entry.id);
      }

    } catch (error) {
      console.error('Error recalculating scores:', error);
    }
  };

  const handleBonusAnswer = async (questionId: string, answer: any, revealed: boolean) => {
    try {
      const { error } = await supabase
        .from('bonus_questions')
        .update({ 
          correct_answer: JSON.stringify(answer),
          answer_revealed: revealed 
        })
        .eq('id', questionId);

      if (error) throw error;

      setBonusAnswers(prev => ({ ...prev, [questionId]: answer }));
      
      // Update the question in state
      setBonusQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, correct_answer: JSON.stringify(answer), answer_revealed: revealed }
          : q
      ));

      if (revealed) {
        await recalculateScores();
      }

      toast({
        title: "Success!",
        description: "Bonus answer updated",
      });

    } catch (error) {
      console.error('Error updating bonus answer:', error);
      toast({
        title: "Error",
        description: "Failed to update bonus answer",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('bonus_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      setBonusQuestions(prev => prev.filter(q => q.id !== questionId));
      setBonusAnswers(prev => {
        const { [questionId]: deleted, ...rest } = prev;
        return rest;
      });

      toast({
        title: "Success!",
        description: "Bonus question deleted",
      });

    } catch (error) {
      console.error('Error deleting bonus question:', error);
      toast({
        title: "Error",
        description: "Failed to delete bonus question",
        variant: "destructive",
      });
    }
  };

  return {
    contestants,
    bonusQuestions,
    bonusAnswers,
    loading,
    handleBonusAnswer,
    handleDeleteQuestion,
    refreshQuestions: loadData
  };
};