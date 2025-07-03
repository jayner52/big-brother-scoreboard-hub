import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';

export const useWeekAwareContestants = (weekNumber: number) => {
  const [allContestants, setAllContestants] = useState<ContestantWithBio[]>([]);
  const [evictedContestants, setEvictedContestants] = useState<string[]>([]);
  const [activeContestants, setActiveContestants] = useState<ContestantWithBio[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWeekAwareContestantData = async () => {
    try {
      // Load all contestants
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .order('name');

      // Load evicted contestants up to (but not including) the current week
      const { data: evictionData } = await supabase
        .from('weekly_events')
        .select(`
          contestants(name),
          event_type,
          week_number
        `)
        .eq('event_type', 'evicted')
        .lt('week_number', weekNumber);

      const evicted = evictionData?.map(event => event.contestants?.name).filter(Boolean) || [];
      
      const contestants = contestantsData?.map(c => ({
        id: c.id,
        name: c.name,
        isActive: true, // We'll determine this dynamically
        group_id: c.group_id,
        sort_order: c.sort_order,
        bio: c.bio,
        photo_url: c.photo_url
      })) || [];

      // Determine active contestants (not evicted up to this week)
      const active = contestants.filter(c => !evicted.includes(c.name));

      setAllContestants(contestants);
      setEvictedContestants(evicted);
      setActiveContestants(active);
    } catch (error) {
      console.error('Error loading week-aware contestant data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeekAwareContestantData();
  }, [weekNumber]);

  return {
    allContestants,
    activeContestants,
    evictedContestants,
    loading,
    refreshData: loadWeekAwareContestantData
  };
};