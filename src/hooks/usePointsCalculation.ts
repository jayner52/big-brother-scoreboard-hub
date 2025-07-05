import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry } from '@/types/pool';

export const usePointsCalculation = () => {
  const [recalculating, setRecalculating] = useState(false);

  const calculateTeamPoints = async (entry: PoolEntry) => {
    try {
      console.log('Calculating points for team:', entry.team_name);
      
      // Get all contestants for name matching
      const { data: contestants, error: contestantsError } = await supabase
        .from('contestants')
        .select('id, name');

      if (contestantsError) throw contestantsError;

      // Find team member IDs
      const teamPlayers = Array.from({ length: activePool?.picks_per_team || 5 }, (_, i) => {
        const playerKey = `player_${i + 1}` as keyof typeof entry;
        return entry[playerKey] as string;
      }).filter(Boolean);
      console.log('Team players:', teamPlayers);
      
      const teamMemberIds = teamPlayers
        .map(playerName => contestants?.find(c => c.name === playerName)?.id)
        .filter(Boolean);
      
      console.log('Team member IDs found:', teamMemberIds.length, 'out of', teamPlayers.length);

      // Get weekly points for team members using IDs
      const { data: weeklyEvents, error: weeklyError } = await supabase
        .from('weekly_events')
        .select('points_awarded, contestant_id')
        .in('contestant_id', teamMemberIds);

      if (weeklyError) throw weeklyError;

      // Get special events points for team members
      const { data: specialEvents, error: specialError } = await supabase
        .from('special_events')
        .select('points_awarded, contestant_id')
        .in('contestant_id', teamMemberIds);

      if (specialError) throw specialError;

      const weeklyPoints = weeklyEvents?.reduce((sum, event) => sum + (event.points_awarded || 0), 0) || 0;
      const specialPoints = specialEvents?.reduce((sum, event) => sum + (event.points_awarded || 0), 0) || 0;
      
      console.log('Weekly points:', weeklyPoints, 'Special points:', specialPoints);

      // Get bonus points from answered questions
      const { data: bonusQuestions, error: bonusError } = await supabase
        .from('bonus_questions')
        .select('*')
        .eq('answer_revealed', true);

      if (bonusError) throw bonusError;

      let bonusPoints = 0;
      bonusQuestions?.forEach(question => {
        const userAnswer = entry.bonus_answers?.[question.id];
        console.log('Checking bonus question:', question.question_text, 'User answer:', userAnswer, 'Correct:', question.correct_answer);
        
        // Handle different answer types including showmance (dual player)
        if (question.question_type === 'dual_player_select') {
          // For showmance questions, correct_answer is a JSON array of valid combinations
          if (userAnswer && question.correct_answer) {
            let correctAnswers;
            try {
              // Parse the correct answer if it's a string, otherwise use as-is
              correctAnswers = typeof question.correct_answer === 'string' 
                ? JSON.parse(question.correct_answer) 
                : question.correct_answer;
            } catch (e) {
              console.error('Error parsing correct answer for showmance:', e);
              correctAnswers = [];
            }
            
            // Check if user's answer matches any of the correct combinations
            if (Array.isArray(correctAnswers) && typeof userAnswer === 'object' && userAnswer.player1 && userAnswer.player2) {
              const isCorrect = correctAnswers.some(correctPair => 
                (correctPair.player1 === userAnswer.player1 && correctPair.player2 === userAnswer.player2) ||
                (correctPair.player1 === userAnswer.player2 && correctPair.player2 === userAnswer.player1)
              );
              
              console.log('Showmance comparison:', { 
                userAnswer, 
                correctAnswers, 
                isCorrect 
              });
              
              if (isCorrect) {
                bonusPoints += question.points_value;
                console.log('Bonus points awarded for showmance question:', question.points_value);
              }
            }
          }
        } else {
          // Standard answer comparison for other question types
          if (userAnswer === question.correct_answer) {
            bonusPoints += question.points_value;
            console.log('Bonus points awarded:', question.points_value);
          }
        }
      });

      const totalWeeklyPoints = weeklyPoints + specialPoints;
      const totalPoints = totalWeeklyPoints + bonusPoints;
      
      console.log('Final calculation - Weekly:', totalWeeklyPoints, 'Bonus:', bonusPoints, 'Total:', totalPoints);

      return {
        weekly_points: totalWeeklyPoints,
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