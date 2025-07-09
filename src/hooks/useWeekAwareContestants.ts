
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';
import { usePool } from '@/contexts/PoolContext';
import { debugContestantEvictionStatus } from '@/utils/evictionDebugger';

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

      // CRITICAL FIX: Load contestants with their current is_active status from database
      // This is the single source of truth maintained by the database trigger
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', activePool.id)
        .order('name');

      console.log('📊 Loaded contestants with is_active status:', contestantsData?.map(c => ({ name: c.name, is_active: c.is_active })));

      if (contestantsData) {
        // Debug Isaiah specifically if he's in the list
        const isaiah = contestantsData.find(c => c.name.toLowerCase().includes('isaiah'));
        if (isaiah) {
          console.log(`🎯 ISAIAH DEBUG - is_active: ${isaiah.is_active}`);
          await debugContestantEvictionStatus(isaiah.name, activePool.id);
        }
      }

      // Build evicted list from database is_active field (single source of truth)
      const evictedByDatabase = contestantsData?.filter(c => !c.is_active).map(c => c.name) || [];

      console.log('❌ Contestants marked as evicted in database:', evictedByDatabase);
      
      const contestants = contestantsData?.map(c => ({
        id: c.id,
        name: c.name,
        isActive: c.is_active, // Use database value directly
        group_id: c.group_id,
        sort_order: c.sort_order,
        bio: c.bio,
        photo_url: c.photo_url
      })) || [];

      // Active contestants are those with is_active = true in database
      const active = contestants.filter(c => c.isActive);

      console.log('✅ Active contestants for week', weekNumber, ':', active.map(c => c.name));
      console.log('❌ Evicted contestants for week', weekNumber, ':', contestants.filter(c => !c.isActive).map(c => c.name));

      setAllContestants(contestants);
      setEvictedContestants(evictedByDatabase);
      setActiveContestants(active);
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
