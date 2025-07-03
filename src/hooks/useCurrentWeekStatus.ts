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
        const { data, error } = await supabase
          .from('weekly_results')
          .select('hoh_winner, pov_winner, nominees')
          .eq('week_number', currentWeek)
          .single();

        if (error) throw error;

        setStatus({
          hohWinner: data?.hoh_winner || null,
          povWinner: data?.pov_winner || null,
          nominees: data?.nominees || [],
          loading: false,
        });
      } catch (error) {
        console.error('Error loading current week status:', error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    loadCurrentWeekStatus();
  }, [currentWeek]);

  return status;
};