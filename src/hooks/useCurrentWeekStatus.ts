import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentWeek } from '@/contexts/CurrentWeekContext';

interface CurrentWeekStatus {
  hohWinner: string | null;
  povWinner: string | null;
  nominees: string[];
  loading: boolean;
}

export const useCurrentWeekStatus = (): CurrentWeekStatus => {
  const [status, setStatus] = useState<CurrentWeekStatus>({
    hohWinner: null,
    povWinner: null,
    nominees: [],
    loading: true,
  });
  const { currentWeek } = useCurrentWeek();

  useEffect(() => {
    if (!currentWeek) return;

    const loadCurrentWeekStatus = async () => {
      try {
        // Try to get current week status, but fall back gracefully if no data exists
        const { data, error } = await supabase
          .from('weekly_results')
          .select('hoh_winner, pov_winner, nominees')
          .eq('week_number', currentWeek)
          .maybeSingle();

        // If no error and data exists, use it; otherwise use defaults
        setStatus({
          hohWinner: data?.hoh_winner || null,
          povWinner: data?.pov_winner || null,
          nominees: data?.nominees || [],
          loading: false,
        });
      } catch (error) {
        console.error('Error loading current week status:', error);
        setStatus({
          hohWinner: null,
          povWinner: null,
          nominees: [],
          loading: false,
        });
      }
    };

    loadCurrentWeekStatus();
  }, [currentWeek]);

  return status;
};