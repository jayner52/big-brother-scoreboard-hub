import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Contestant, BonusQuestion } from '@/types/pool';

export const BonusQuestionsPanel: React.FC = () => {
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
        const activePlayers = [entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5];
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

  const getActivePlayerCount = async (players: string[]) => {
    const { data } = await supabase
      .from('contestants')
      .select('name')
      .in('name', players)
      .eq('is_active', true);
    
    return data?.length || 0;
  };

  if (loading) {
    return <div className="text-center py-8">Loading bonus questions...</div>;
  }

  return (
    <div className="space-y-6">
      {bonusQuestions.map((question) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="text-lg">{question.question_text}</CardTitle>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{question.points_value} points</Badge>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={question.answer_revealed}
                  onCheckedChange={(checked) => 
                    handleBonusAnswer(question.id, bonusAnswers[question.id] || '', checked)
                  }
                />
                <Label>Revealed</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {question.question_type === 'player_select' && (
                <Select 
                  value={bonusAnswers[question.id] || ''} 
                  onValueChange={(value) => 
                    handleBonusAnswer(question.id, value, question.answer_revealed)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {contestants.map(contestant => (
                      <SelectItem key={contestant.id} value={contestant.name}>
                        {contestant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {question.question_type === 'dual_player_select' && (
                <div className="space-y-2">
                  <Select 
                    value={bonusAnswers[question.id]?.player1 || ''} 
                    onValueChange={(value) => 
                      handleBonusAnswer(question.id, { 
                        ...bonusAnswers[question.id], 
                        player1: value 
                      }, question.answer_revealed)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select first player" />
                    </SelectTrigger>
                    <SelectContent>
                      {contestants.map(contestant => (
                        <SelectItem key={contestant.id} value={contestant.name}>
                          {contestant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={bonusAnswers[question.id]?.player2 || ''} 
                    onValueChange={(value) => 
                      handleBonusAnswer(question.id, { 
                        ...bonusAnswers[question.id], 
                        player2: value 
                      }, question.answer_revealed)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select second player" />
                    </SelectTrigger>
                    <SelectContent>
                      {contestants.map(contestant => (
                        <SelectItem key={contestant.id} value={contestant.name}>
                          {contestant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {question.question_type === 'yes_no' && (
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant={bonusAnswers[question.id] === 'yes' ? 'default' : 'outline'}
                    onClick={() => handleBonusAnswer(question.id, 'yes', question.answer_revealed)}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={bonusAnswers[question.id] === 'no' ? 'default' : 'outline'}
                    onClick={() => handleBonusAnswer(question.id, 'no', question.answer_revealed)}
                  >
                    No
                  </Button>
                </div>
              )}

              {question.question_type === 'number' && (
                <Input
                  type="number"
                  value={bonusAnswers[question.id] || ''}
                  onChange={(e) => 
                    handleBonusAnswer(question.id, parseInt(e.target.value) || 0, question.answer_revealed)
                  }
                  placeholder="Enter correct number"
                />
              )}

              {!['player_select', 'dual_player_select', 'yes_no', 'number'].includes(question.question_type) && (
                <Input
                  type="text"
                  value={bonusAnswers[question.id] || ''}
                  onChange={(e) => 
                    handleBonusAnswer(question.id, e.target.value, question.answer_revealed)
                  }
                  placeholder="Enter correct answer"
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};