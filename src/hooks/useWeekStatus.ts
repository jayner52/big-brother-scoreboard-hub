import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type WeekStatus = 'completed' | 'current' | 'future';

export const useWeekStatus = (weekNumber: number) => {
  const [weekStatus, setWeekStatus] = useState<WeekStatus>('future');
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const determineWeekStatus = async () => {
    try {
      // Get all weekly results to determine the current week dynamically
      const { data: weeklyResults } = await supabase
        .from('weekly_results')
        .select('week_number, is_draft')
        .order('week_number', { ascending: true });

      // Calculate current week as highest completed week + 1
      const completedWeeks = weeklyResults?.filter(result => result.is_draft === false) || [];
      const highestCompletedWeek = completedWeeks.length > 0 
        ? Math.max(...completedWeeks.map(w => w.week_number)) 
        : 0;
      
      const calculatedCurrentWeek = highestCompletedWeek + 1;
      setCurrentWeek(calculatedCurrentWeek);

      // Log for debugging
      console.log(`Week Status Debug: Completed weeks: [${completedWeeks.map(w => w.week_number).join(', ')}], Calculated current week: ${calculatedCurrentWeek}, Checking week: ${weekNumber}`);

      // Determine status for the requested week
      const weekResult = weeklyResults?.find(result => result.week_number === weekNumber);
      
      if (weekResult && weekResult.is_draft === false) {
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
    refreshStatus: determineWeekStatus
  };
};