import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type WeekStatus = 'completed' | 'current' | 'future';

export const useWeekStatus = (weekNumber: number) => {
  const [weekStatus, setWeekStatus] = useState<WeekStatus>('future');
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const determineWeekStatus = async () => {
    try {
      // Get all weekly results to determine status
      const { data: weeklyResults } = await supabase
        .from('weekly_results')
        .select('week_number, is_draft')
        .order('week_number', { ascending: true });

      if (!weeklyResults) {
        setWeekStatus('current');
        setCurrentWeek(1);
        setLoading(false);
        return;
      }

      // Find the current week (lowest week number where is_draft is true)
      const currentWeekResult = weeklyResults.find(result => result.is_draft === true);
      const currentWeekNumber = currentWeekResult?.week_number || 1;
      
      setCurrentWeek(currentWeekNumber);

      // Determine status for the requested week
      const weekResult = weeklyResults.find(result => result.week_number === weekNumber);
      
      if (weekResult && weekResult.is_draft === false) {
        setWeekStatus('completed');
      } else if (weekNumber === currentWeekNumber) {
        setWeekStatus('current');
      } else if (weekNumber < currentWeekNumber) {
        setWeekStatus('completed');
      } else {
        setWeekStatus('future');
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