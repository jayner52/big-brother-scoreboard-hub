import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry } from '@/types/pool';

export const usePointsCalculation = () => {
  const [recalculating, setRecalculating] = useState(false);

  const calculateTeamPoints = async (entry: PoolEntry) => {
    try {
      // Get weekly points for all team members
      const { data: weeklyEvents, error: weeklyError } = await supabase
        .from('weekly_events')
        .select('points_awarded, contestant_id, contestants!inner(name)')
        .in('contestants.name', [entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5]);

      if (weeklyError) throw weeklyError;

      const weeklyPoints = weeklyEvents?.reduce((sum, event) => sum + (event.points_awarded || 0), 0) || 0;

      // Get bonus points from answered questions
      const { data: bonusQuestions, error: bonusError } = await supabase
        .from('bonus_questions')
        .select('*')
        .eq('answer_revealed', true);

      if (bonusError) throw bonusError;

      let bonusPoints = 0;
      bonusQuestions?.forEach(question => {
        const userAnswer = entry.bonus_answers?.[question.id];
        if (userAnswer === question.correct_answer) {
          bonusPoints += question.points_value;
        }
      });

      const totalPoints = weeklyPoints + bonusPoints;

      return {
        weekly_points: weeklyPoints,
        bonus_points: bonusPoints,
        total_points: totalPoints
      };
    } catch (error) {
      console.error('Error calculating points for team:', entry.team_name, error);
      return {
        weekly_points: entry.weekly_points || 0,
        bonus_points: entry.bonus_points || 0,
        total_points: entry.total_points || 0
      };
    }
  };

  const recalculateAllPoints = async () => {
    setRecalculating(true);
    try {
      const { data: poolEntries, error } = await supabase
        .from('pool_entries')
        .select('*');

      if (error) throw error;

      const updates = await Promise.all(
        poolEntries.map(async (entry) => {
          const mappedEntry = {
            ...entry,
            bonus_answers: entry.bonus_answers as Record<string, any>,
            created_at: new Date(entry.created_at),
            updated_at: new Date(entry.updated_at)
          };
          const calculatedPoints = await calculateTeamPoints(mappedEntry);
          return {
            id: entry.id,
            ...calculatedPoints
          };
        })
      );

      // Update all entries in batch
      for (const update of updates) {
        await supabase
          .from('pool_entries')
          .update({
            weekly_points: update.weekly_points,
            bonus_points: update.bonus_points,
            total_points: update.total_points
          })
          .eq('id', update.id);
      }

      console.log('Points recalculation completed');
    } catch (error) {
      console.error('Error recalculating points:', error);
    } finally {
      setRecalculating(false);
    }
  };

  return {
    calculateTeamPoints,
    recalculateAllPoints,
    recalculating
  };
};