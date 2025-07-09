import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contestant, ContestantGroup } from '@/types/pool';

export const useContestantData = (poolId?: string) => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [contestantGroups, setContestantGroups] = useState<ContestantGroup[]>([]);  
  const [poolEntries, setPoolEntries] = useState<any[]>([]);
  const [weeklyEvents, setWeeklyEvents] = useState<any[]>([]);
  const [specialEvents, setSpecialEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!poolId) return;
    
    try {
      const [contestantsResult, groupsResult, poolEntriesResult, weeklyEventsResult, specialEventsResult] = await Promise.all([
        supabase.from('contestants').select('*').eq('pool_id', poolId).order('sort_order'),
        supabase.from('contestant_groups').select('*').eq('pool_id', poolId).order('sort_order'),
        supabase.from('pool_entries').select('*').eq('pool_id', poolId),
        supabase.from('weekly_events').select('*').eq('pool_id', poolId),
        supabase.from('special_events').select('*').eq('pool_id', poolId)
      ]);

      if (contestantsResult.error) throw contestantsResult.error;
      if (groupsResult.error) throw groupsResult.error;
      if (poolEntriesResult.error) throw poolEntriesResult.error;
      if (weeklyEventsResult.error) throw weeklyEventsResult.error;
      if (specialEventsResult.error) throw specialEventsResult.error;

      // Use actual is_active status from database (updated by eviction logic)
      const mappedContestants = (contestantsResult.data || []).map(c => ({
        ...c,
        isActive: c.is_active
      }));
      
      setContestants(mappedContestants as Contestant[]);
      setContestantGroups(groupsResult.data || []);
      setPoolEntries(poolEntriesResult.data || []);
      setWeeklyEvents(weeklyEventsResult.data || []);
      setSpecialEvents(specialEventsResult.data || []);
    } catch (error) {
      console.error('Error loading contestant data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (poolId) {
      loadData();
    }
  }, [poolId]);

  return {
    contestants,
    contestantGroups,
    poolEntries,
    weeklyEvents,
    specialEvents,
    loading,
    refetchData: loadData
  };
};