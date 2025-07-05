import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';

export const useEvictedContestants = () => {
  const { activePool } = usePool();
  const [evictedContestants, setEvictedContestants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activePool?.id) {
      loadEvictedContestants();
    }
  }, [activePool?.id]);

  const loadEvictedContestants = async () => {
    if (!activePool?.id) return;
    
    try {
      // Get all evicted contestants from weekly_events (pool-specific)
      const { data: evictionData } = await supabase
        .from('weekly_events')
        .select(`
          contestants!inner(name),
          event_type
        `)
        .eq('pool_id', activePool.id)
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