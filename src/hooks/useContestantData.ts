import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contestant, ContestantGroup } from '@/types/pool';

export const useContestantData = () => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [contestantGroups, setContestantGroups] = useState<ContestantGroup[]>([]);
  const [poolEntries, setPoolEntries] = useState<any[]>([]);
  const [weeklyEvents, setWeeklyEvents] = useState<any[]>([]);
  const [specialEvents, setSpecialEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [contestantsResult, groupsResult, poolEntriesResult, weeklyEventsResult, specialEventsResult] = await Promise.all([
        supabase.from('contestants').select('*').order('sort_order'),
        supabase.from('contestant_groups').select('*').order('sort_order'),
        supabase.from('pool_entries').select('*'),
        supabase.from('weekly_events').select('*'),
        supabase.from('special_events').select('*')
      ]);

      if (contestantsResult.error) throw contestantsResult.error;
      if (groupsResult.error) throw groupsResult.error;
      if (poolEntriesResult.error) throw poolEntriesResult.error;
      if (weeklyEventsResult.error) throw weeklyEventsResult.error;
      if (specialEventsResult.error) throw specialEventsResult.error;

      // Map contestants to include isActive property
      const mappedContestants = (contestantsResult.data || []).map(c => ({
        ...c,
        isActive: true // Will be updated by the calling hook based on eviction status
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
    loadData();
  }, []);

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