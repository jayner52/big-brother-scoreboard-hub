import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActivePool } from '@/hooks/useActivePool';

interface EvictionData {
  contestant_id: string;
  contestant_name: string;
  eviction_type: string;
  eviction_source: string;
  eviction_week: number;
}

export const useEvictionData = () => {
  const [evictionData, setEvictionData] = useState<EvictionData[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number>(7); // Default to current week
  const [loading, setLoading] = useState(true);
  const activePool = useActivePool();

  useEffect(() => {
    if (activePool?.id) {
      loadEvictionData();
      loadCurrentWeek();
    }
  }, [activePool?.id]);

  const loadCurrentWeek = async () => {
    try {
      const { data } = await supabase
        .from('current_game_week')
        .select('week_number')
        .single();
      
      if (data) {
        setCurrentWeek(data.week_number);
      }
    } catch (error) {
      console.error('Error loading current week:', error);
    }
  };

  const loadEvictionData = async () => {
    if (!activePool?.id) return;
    
    try {
      setLoading(true);
      
      // Get evictions up to current week using the database function
      const { data, error } = await supabase.rpc('get_contestants_evicted_up_to_week', {
        target_pool_id: activePool.id,
        target_week_number: currentWeek
      });

      if (error) throw error;
      
      setEvictionData(data || []);
    } catch (error) {
      console.error('Error loading eviction data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a lookup for eviction status by contestant name
  const getEvictionStatus = (contestantName: string) => {
    const eviction = evictionData.find(e => e.contestant_name === contestantName);
    if (eviction) {
      return `Evicted - Week ${eviction.eviction_week}`;
    }
    return 'Active';
  };

  // Check if contestant is evicted
  const isEvicted = (contestantName: string) => {
    return evictionData.some(e => e.contestant_name === contestantName);
  };

  return {
    evictionData,
    currentWeek,
    loading,
    getEvictionStatus,
    isEvicted,
    refreshData: loadEvictionData
  };
};