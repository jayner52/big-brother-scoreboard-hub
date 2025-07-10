
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';

export const useActiveContestants = (poolId?: string) => {
  const [allContestants, setAllContestants] = useState<ContestantWithBio[]>([]);
  const [evictedContestants, setEvictedContestants] = useState<string[]>([]);
  const [activeContestants, setActiveContestants] = useState<ContestantWithBio[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContestantData = async () => {
    if (!poolId) return;
    
    try {
      console.log('📊 Loading contestant data for pool:', poolId);
      
      // Synchronize eviction status for official contestants only (manual contestants are protected)
      await supabase.rpc('update_contestant_eviction_status', {
        target_pool_id: poolId
      });

      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', poolId)
        .order('name');

      const contestants = contestantsData?.map(c => ({
        id: c.id,
        name: c.name,
        isActive: c.is_active, // CRITICAL: Use database is_active field as single source of truth
        group_id: c.group_id,
        sort_order: c.sort_order,
        bio: c.bio,
        photo_url: c.photo_url
      })) || [];

      console.log('📊 Contestant data loaded with synchronized status:', {
        total: contestants.length,
        active: contestants.filter(c => c.isActive).length,
        inactive: contestants.filter(c => !c.isActive).length,
        evicted_names: contestants.filter(c => !c.isActive).map(c => c.name)
      });

      // Separate active and evicted contestants based on synchronized is_active field
      const activeList = contestants.filter(c => c.isActive);
      const evictedNames = contestants.filter(c => !c.isActive).map(c => c.name);

      setAllContestants(contestants);
      setEvictedContestants(evictedNames);
      setActiveContestants(activeList);
    } catch (error) {
      console.error('Error loading contestant data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (poolId) {
      loadContestantData();
    }
  }, [poolId]);

  // Set up real-time listener for contestant status changes
  useEffect(() => {
    if (!poolId) return;

    const channel = supabase
      .channel('contestant-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contestants',
          filter: `pool_id=eq.${poolId}`
        },
        (payload) => {
          console.log('🔄 Contestant status change detected:', payload);
          loadContestantData(); // Reload data when status changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poolId]);

  return {
    allContestants,
    activeContestants,
    evictedContestants,
    loading,
    refreshData: loadContestantData
  };
};
