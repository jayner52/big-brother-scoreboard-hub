
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';
import { usePool } from '@/contexts/PoolContext';

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

      // Get all contestants first
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', activePool.id)
        .order('name');

      if (!contestantsData) {
        setLoading(false);
        return;
      }

      // Get contestants who were evicted up to this week (cumulative)
      const { data: evictedUpToWeek } = await supabase
        .rpc('get_contestants_evicted_up_to_week', {
          target_pool_id: activePool.id,
          target_week_number: weekNumber
        });

      // Get contestants who are active in this specific week
      const { data: activeThisWeek } = await supabase
        .rpc('get_contestants_active_in_week', {
          target_pool_id: activePool.id,
          target_week_number: weekNumber
        });

      console.log('📊 Week', weekNumber, 'evicted up to week:', evictedUpToWeek?.map(e => e.contestant_name));
      console.log('📊 Week', weekNumber, 'active:', activeThisWeek?.filter(a => a.is_active_this_week).map(a => a.contestant_name));

      // Map contestants with week-aware status
      const contestants = contestantsData.map(c => ({
        id: c.id,
        name: c.name,
        isActive: activeThisWeek?.find(a => a.contestant_id === c.id)?.is_active_this_week ?? true,
        group_id: c.group_id,
        sort_order: c.sort_order,
        bio: c.bio,
        photo_url: c.photo_url
      }));

      // Get names of contestants evicted up to this week
      const evictedNames = evictedUpToWeek?.map(e => e.contestant_name) || [];
      
      // Filter active contestants for this week
      const activeContestantsList = contestants.filter(c => c.isActive);

      setAllContestants(contestants);
      setEvictedContestants(evictedNames);
      setActiveContestants(activeContestantsList);

      console.log('✅ Week-aware data loaded:', {
        allContestants: contestants.length,
        evictedUpToWeek: evictedNames.length,
        activeThisWeek: activeContestantsList.length
      });
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
