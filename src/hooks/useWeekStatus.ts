import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type WeekStatus = 'completed' | 'current' | 'future' | 'season_complete';

export const useWeekStatus = (weekNumber: number) => {
  const [weekStatus, setWeekStatus] = useState<WeekStatus>('future');
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [isFinalWeek, setIsFinalWeek] = useState(false);

  const determineWeekStatus = async () => {
    try {
      // Get all weekly results to determine the current week dynamically
      const { data: weeklyResults } = await supabase
        .from('weekly_results')
        .select('week_number, is_draft, winner, runner_up, americas_favorite_player')
        .order('week_number', { ascending: true });

      // Calculate current week as highest completed week + 1
      const completedWeeks = weeklyResults?.filter(result => result.is_draft === false) || [];
      const highestCompletedWeek = completedWeeks.length > 0 
        ? Math.max(...completedWeeks.map(w => w.week_number)) 
        : 0;
      
      // Check if highest completed week is Final Week
      const highestWeekData = completedWeeks.find(w => w.week_number === highestCompletedWeek);
      const isSeasonComplete = highestWeekData && 
        (highestWeekData.winner || highestWeekData.runner_up || highestWeekData.americas_favorite_player);
      
      const calculatedCurrentWeek = isSeasonComplete ? highestCompletedWeek : highestCompletedWeek + 1;
      setCurrentWeek(calculatedCurrentWeek);
      setIsFinalWeek(!!isSeasonComplete);

      // Log for debugging
      console.log(`Week Status Debug: Completed weeks: [${completedWeeks.map(w => w.week_number).join(', ')}], Calculated current week: ${calculatedCurrentWeek}, Checking week: ${weekNumber}`);

      // Determine status for the requested week
      const weekResult = weeklyResults?.find(result => result.week_number === weekNumber);
      
      // Check if this specific week is a Final Week
      const isThisWeekFinal = weekResult && 
        (weekResult.winner || weekResult.runner_up || weekResult.americas_favorite_player);
      
      if (isThisWeekFinal) {
        setWeekStatus('season_complete');
        console.log(`Week ${weekNumber} is SEASON COMPLETE (Final Week completed)`);
      } else if (weekResult && weekResult.is_draft === false) {
        setWeekStatus('completed');
        console.log(`Week ${weekNumber} is COMPLETED (found in weekly_results with is_draft=false)`);
      } else if (weekNumber === calculatedCurrentWeek) {
        setWeekStatus('current');
        console.log(`Week ${weekNumber} is CURRENT (matches calculated current week)`);
      } else if (weekNumber < calculatedCurrentWeek) {
        setWeekStatus('completed');
        console.log(`Week ${weekNumber} is COMPLETED (less than current week ${calculatedCurrentWeek})`);
      } else {
        setWeekStatus('future');
        console.log(`Week ${weekNumber} is FUTURE (greater than current week ${calculatedCurrentWeek})`);
      }
    } catch (error) {
      console.error('Error determining week status:', error);
      setWeekStatus('current');
      setCurrentWeek(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    determineWeekStatus();
  }, [weekNumber]);

  return {
    weekStatus,
    currentWeek,
    loading,
    isFinalWeek,
    refreshStatus: determineWeekStatus
  };
};