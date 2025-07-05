import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EvictionInfo {
  week: number;
  contestant_name: string;
}

export const useEvictionWeeks = () => {
  const [evictionWeeks, setEvictionWeeks] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvictionWeeks();
  }, []);

  const loadEvictionWeeks = async () => {
    try {
      const { data: evictionData } = await supabase
        .from('weekly_events')
        .select(`
          week_number,
          contestants!inner(name)
        `)
        .eq('event_type', 'evicted');

      const evictionMap: Record<string, number> = {};
      evictionData?.forEach(event => {
        const contestantName = (event.contestants as any).name;
        evictionMap[contestantName] = event.week_number;
      });

      setEvictionWeeks(evictionMap);
    } catch (error) {
      console.error('Error loading eviction weeks:', error);
    } finally {
      setLoading(false);
    }
  };

  return { evictionWeeks, loading, refreshEvictionWeeks: loadEvictionWeeks };
};