import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEvictedContestants = () => {
  const [evictedContestants, setEvictedContestants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvictedContestants();
  }, []);

  const loadEvictedContestants = async () => {
    try {
      // Get all evicted contestants from weekly_events
      const { data: evictionData } = await supabase
        .from('weekly_events')
        .select(`
          contestants!inner(name),
          event_type
        `)
        .eq('event_type', 'evicted');

      const evicted = evictionData?.map(event => (event.contestants as any).name) || [];
      setEvictedContestants(evicted);
    } catch (error) {
      console.error('Error loading evicted contestants:', error);
    } finally {
      setLoading(false);
    }
  };

  return { evictedContestants, loading, refreshEvicted: loadEvictedContestants };
};