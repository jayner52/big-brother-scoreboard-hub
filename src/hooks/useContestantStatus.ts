import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';

export interface ContestantStatus {
  name: string;
  current_hoh: boolean;
  current_pov_winner: boolean;
  currently_nominated: boolean;
  is_evicted: boolean;
}

export const useContestantStatus = () => {
  const { activePool } = usePool();
  const [contestantStatus, setContestantStatus] = useState<Record<string, ContestantStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activePool?.id) {
      loadContestantStatus();
    }
  }, [activePool?.id]);

  const loadContestantStatus = async () => {
    if (!activePool?.id) return;
    
    try {
      // Get all contestants with their current status (pool-specific)
      const { data: contestants } = await supabase
        .from('contestants')
        .select('name, current_hoh, current_pov_winner, currently_nominated')
        .eq('pool_id', activePool.id)
        .eq('is_active', true);

      // Get evicted contestants (pool-specific)
      const { data: evictionData } = await supabase
        .from('weekly_events')
        .select(`
          contestants!inner(name),
          event_type
        `)
        .eq('pool_id', activePool.id)
        .eq('event_type', 'evicted');

      const evictedNames = evictionData?.map(event => (event.contestants as any).name) || [];

      // Create status map
      const statusMap: Record<string, ContestantStatus> = {};
      
      contestants?.forEach(contestant => {
        statusMap[contestant.name] = {
          name: contestant.name,
          current_hoh: contestant.current_hoh || false,
          current_pov_winner: contestant.current_pov_winner || false,
          currently_nominated: contestant.currently_nominated || false,
          is_evicted: evictedNames.includes(contestant.name)
        };
      });

      setContestantStatus(statusMap);
    } catch (error) {
      console.error('Error loading contestant status:', error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    contestantStatus, 
    loading, 
    refreshStatus: loadContestantStatus 
  };
};