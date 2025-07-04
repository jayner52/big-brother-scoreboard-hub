import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';

export const useActiveContestants = () => {
  const [allContestants, setAllContestants] = useState<ContestantWithBio[]>([]);
  const [evictedContestants, setEvictedContestants] = useState<string[]>([]);
  const [activeContestants, setActiveContestants] = useState<ContestantWithBio[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContestantData = async () => {
    try {
      // Load all contestants
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .order('name');

      // Load evicted contestants from weekly_events with proper join
      // Get current week to determine who should be considered evicted
      const { data: currentWeekData } = await supabase
        .from('current_game_week')
        .select('week_number')
        .single();
      
      const currentWeek = currentWeekData?.week_number || 7;
      
      const { data: evictionData } = await supabase
        .from('weekly_events')
        .select(`
          contestants(name),
          event_type,
          week_number
        `)
        .eq('event_type', 'evicted')
        .lt('week_number', currentWeek); // Only get evictions before current week

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

      // Determine active contestants (not evicted)
      const active = contestants.filter(c => !evicted.includes(c.name));

      setAllContestants(contestants);
      setEvictedContestants(evicted);
      setActiveContestants(active);
    } catch (error) {
      console.error('Error loading contestant data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContestantData();
  }, []);

  return {
    allContestants,
    activeContestants,
    evictedContestants,
    loading,
    refreshData: loadContestantData
  };
};