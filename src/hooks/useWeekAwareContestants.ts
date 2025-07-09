
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';
import { usePool } from '@/contexts/PoolContext';
// REMOVED: evictionDebugger - will be reimplemented from scratch

export const useWeekAwareContestants = (weekNumber: number) => {
  const { activePool } = usePool();
  const [allContestants, setAllContestants] = useState<ContestantWithBio[]>([]);
  const [evictedContestants, setEvictedContestants] = useState<string[]>([]);
  const [activeContestants, setActiveContestants] = useState<ContestantWithBio[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWeekAwareContestantData = async () => {
    if (!activePool?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading week-aware data for pool:', activePool.id, 'week:', weekNumber);

      // REMOVED: All eviction status logic - will be reimplemented from scratch
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', activePool.id)
        .order('name');

      const contestants = contestantsData?.map(c => ({
        id: c.id,
        name: c.name,
        isActive: true, // REMOVED: eviction logic - always show as active
        group_id: c.group_id,
        sort_order: c.sort_order,
        bio: c.bio,
        photo_url: c.photo_url
      })) || [];

      setAllContestants(contestants);
      setEvictedContestants([]); // REMOVED: eviction logic - empty array
      setActiveContestants(contestants); // REMOVED: eviction logic - all contestants are active
    } catch (error) {
      console.error('Error loading week-aware contestant data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeekAwareContestantData();
  }, [weekNumber, activePool?.id]);

  return {
    allContestants,
    activeContestants,
    evictedContestants,
    loading,
    refreshData: loadWeekAwareContestantData
  };
};
