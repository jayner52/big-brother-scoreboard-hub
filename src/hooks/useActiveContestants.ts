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
      // REMOVED: All eviction status logic - will be reimplemented from scratch
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', poolId)
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

  return {
    allContestants,
    activeContestants,
    evictedContestants,
    loading,
    refreshData: loadContestantData
  };
};