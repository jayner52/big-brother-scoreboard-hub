import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Contestant } from '@/types/pool';

export const LegacyWeeklyResults: React.FC = () => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);

  const [weeklyData, setWeeklyData] = useState({
    week: 1,
    hohWinner: '',
    povWinner: '',
    evicted: '',
    specialWinners: [] as string[],
  });

  useEffect(() => {
    loadContestants();
  }, []);

  const loadContestants = async () => {
    try {
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

    } catch (error) {
      console.error('Error loading contestants:', error);
      toast({
        title: "Error",
        description: "Failed to load contestants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWeeklyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Insert weekly results
      const { error: weeklyError } = await supabase
        .from('weekly_results')
        .insert({
          week_number: weeklyData.week,
          hoh_winner: weeklyData.hohWinner || null,
          pov_winner: weeklyData.povWinner || null,
          evicted_contestant: weeklyData.evicted || null,
        });

      if (weeklyError) throw weeklyError;

      // Update contestant status if someone was evicted
      if (weeklyData.evicted) {
        const { error: contestantError } = await supabase
          .from('contestants')
          .update({ is_active: false })
          .eq('name', weeklyData.evicted);

        if (contestantError) throw contestantError;
      }

      // Recalculate all team scores
      await recalculateScores();

      toast({
        title: "Success!",
        description: `Week ${weeklyData.week} results updated and scores recalculated`,
      });

      // Reset form
      setWeeklyData({
        week: weeklyData.week + 1,
        hohWinner: '',
        povWinner: '',
        evicted: '',
        specialWinners: [],
      });

    } catch (error) {
      console.error('Error updating weekly results:', error);
      toast({
        title: "Error",
        description: "Failed to update weekly results",
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
    return <div className="text-center py-8">Loading legacy scoring panel...</div>;
  }

  const activeContestants = contestants.filter(c => c.isActive);

  return (
    <form onSubmit={handleWeeklyUpdate} className="space-y-4">
      <div>
        <Label htmlFor="week" className="font-semibold">Week Number</Label>
        <Input
          id="week"
          type="number"
          min="1"
          value={weeklyData.week}
          onChange={(e) => setWeeklyData(prev => ({ ...prev, week: parseInt(e.target.value) || 1 }))}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="font-semibold">Head of Household Winner</Label>
        <Select value={weeklyData.hohWinner} onValueChange={(value) => setWeeklyData(prev => ({ ...prev, hohWinner: value }))}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select HOH winner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-winner">No winner this week</SelectItem>
            {activeContestants.map(contestant => (
              <SelectItem key={contestant.id} value={contestant.name}>
                {contestant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="font-semibold">Power of Veto Winner</Label>
        <Select value={weeklyData.povWinner} onValueChange={(value) => setWeeklyData(prev => ({ ...prev, povWinner: value }))}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select POV winner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-winner">No winner this week</SelectItem>
            {activeContestants.map(contestant => (
              <SelectItem key={contestant.id} value={contestant.name}>
                {contestant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="font-semibold">Evicted Contestant</Label>
        <Select value={weeklyData.evicted} onValueChange={(value) => setWeeklyData(prev => ({ ...prev, evicted: value }))}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select evicted contestant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-eviction">No eviction this week</SelectItem>
            {activeContestants.map(contestant => (
              <SelectItem key={contestant.id} value={contestant.name}>
                {contestant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white">
        Update Week & Recalculate Scores
      </Button>
    </form>
  );
};