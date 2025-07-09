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
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', poolId)
        .order('name');

      const contestants = contestantsData?.map(c => ({
        id: c.id,
        name: c.name,
        isActive: c.is_active, // Single source of truth: database is_active field
        group_id: c.group_id,
        sort_order: c.sort_order,
        bio: c.bio,
        photo_url: c.photo_url
      })) || [];

      console.log('📊 Active contestants data loaded:', {
        total: contestants.length,
        active: contestants.filter(c => c.isActive).length,
        inactive: contestants.filter(c => !c.isActive).length,
        evicted_names: contestants.filter(c => !c.isActive).map(c => c.name)
      });

      // Separate active and evicted contestants based on is_active field ONLY
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

  return {
    allContestants,
    activeContestants,
    evictedContestants,
    loading,
    refreshData: loadContestantData
  };
};