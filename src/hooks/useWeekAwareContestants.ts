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

      // Load evicted contestants up to AND INCLUDING the current week
      // This ensures that contestants evicted in previous weeks show as evicted in the current week
      const { data: evictionData } = await supabase
        .from('weekly_events')
        .select(`
          contestants(name),
          event_type,
          week_number
        `)
        .eq('event_type', 'evicted')
        .lte('week_number', weekNumber);

      // Also check for contestants marked as inactive due to special events (self-evicted, removed by production)
      const { data: inactiveContestants } = await supabase
        .from('contestants')
        .select('name, is_active')
        .eq('is_active', false);

      const evictedByVote = evictionData?.map(event => event.contestants?.name).filter(Boolean) || [];
      const evictedBySpecialEvent = inactiveContestants?.map(c => c.name).filter(Boolean) || [];
      const evicted = [...new Set([...evictedByVote, ...evictedBySpecialEvent])]; // Remove duplicates
      
      const contestants = contestantsData?.map(c => ({
        id: c.id,
        name: c.name,
        isActive: c.is_active, // Use the actual database value
        group_id: c.group_id,
        sort_order: c.sort_order,
        bio: c.bio,
        photo_url: c.photo_url
      })) || [];

      // Determine active contestants (not evicted and still active)
      const active = contestants.filter(c => !evicted.includes(c.name) && c.isActive);

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