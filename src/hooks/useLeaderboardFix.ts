import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePointsCalculation } from './usePointsCalculation';

export const useLeaderboardFix = () => {
  const [isFixing, setIsFixing] = useState(false);
  const { calculateTeamPoints } = usePointsCalculation();

  const fixAllTeamPoints = async () => {
    setIsFixing(true);
    try {
      console.log('Starting comprehensive leaderboard fix...');
      
      // Get all pool entries
      const { data: poolEntries, error } = await supabase
        .from('pool_entries')
        .select('*');

      if (error) throw error;
      
      console.log('Found pool entries:', poolEntries?.length || 0);

      if (!poolEntries || poolEntries.length === 0) {
        console.log('No pool entries found - nothing to fix');
        return;
      }

      // Recalculate points for each team
      for (const entry of poolEntries) {
        try {
          console.log('Fixing points for team:', entry.team_name);
          
          const mappedEntry = {
            ...entry,
            bonus_answers: entry.bonus_answers as Record<string, any>,
            created_at: new Date(entry.created_at),
            updated_at: new Date(entry.updated_at)
          };
          
          const calculatedPoints = await calculateTeamPoints(mappedEntry);
          
          // Update the database with correct points
          const { error: updateError } = await supabase
            .from('pool_entries')
            .update({
              weekly_points: calculatedPoints.weekly_points,
              bonus_points: calculatedPoints.bonus_points,
              total_points: calculatedPoints.total_points
            })
            .eq('id', entry.id);

          if (updateError) {
            console.error('Error updating team:', entry.team_name, updateError);
          } else {
            console.log('Successfully updated team:', entry.team_name, calculatedPoints);
          }
        } catch (teamError) {
          console.error('Error processing team:', entry.team_name, teamError);
        }
      }

      console.log('Leaderboard fix completed successfully');
      return true;
    } catch (error) {
      console.error('Error fixing leaderboard:', error);
      return false;
    } finally {
      setIsFixing(false);
    }
  };

  return {
    fixAllTeamPoints,
    isFixing
  };
};