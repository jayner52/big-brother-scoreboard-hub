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

      // Load all contestants from the current pool only
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', activePool.id)
        .order('name');

      console.log('📊 Loaded contestants:', contestantsData?.length);

      // Load evicted contestants from weekly_results table for this pool
      const { data: weeklyResultsData } = await supabase
        .from('weekly_results')
        .select(`
          week_number,
          evicted_contestant,
          second_evicted_contestant,
          third_evicted_contestant
        `)
        .eq('pool_id', activePool.id)
        .lte('week_number', weekNumber)
        .eq('is_draft', false)
        .order('week_number');

      console.log('📈 Weekly results data:', weeklyResultsData);

      // Build cumulative eviction list up to current week
      const evictedByVote = weeklyResultsData?.reduce((acc, result) => {
        console.log(`Week ${result.week_number} evictions:`, {
          first: result.evicted_contestant,
          second: result.second_evicted_contestant,
          third: result.third_evicted_contestant
        });
        
        if (result.evicted_contestant) acc.push(result.evicted_contestant);
        if (result.second_evicted_contestant) acc.push(result.second_evicted_contestant);
        if (result.third_evicted_contestant) acc.push(result.third_evicted_contestant);
        return acc;
      }, [] as string[]) || [];

      // Check for contestants evicted by special events (self_evicted, removed_production)
      const { data: specialEvictionData } = await supabase
        .from('weekly_events')
        .select(`
          contestants(name),
          event_type
        `)
        .eq('pool_id', activePool.id)
        .lte('week_number', weekNumber);

      console.log('🚫 Special eviction data:', specialEvictionData);

      // Filter for only legitimate eviction special events
      const evictedBySpecialEvent = [];
      if (specialEvictionData) {
        for (const event of specialEvictionData) {
          if (event.event_type && event.contestants?.name) {
            // Check if this event type is a legitimate eviction event
            const { data: scoringRule } = await supabase
              .from('detailed_scoring_rules')
              .select('subcategory')
              .eq('id', event.event_type)
              .single();
            
            if (scoringRule && (scoringRule.subcategory === 'self_evicted' || scoringRule.subcategory === 'removed_production')) {
              evictedBySpecialEvent.push(event.contestants.name);
              console.log(`🚪 Special eviction: ${event.contestants.name} (${scoringRule.subcategory})`);
            }
          }
        }
      }

      const allEvicted = [...new Set([...evictedByVote, ...evictedBySpecialEvent])];

      console.log('❌ All evicted contestants:', allEvicted);
      
      const contestants = contestantsData?.map(c => {
        const isEvicted = allEvicted.includes(c.name);
        return {
          id: c.id,
          name: c.name,
          isActive: !isEvicted, // Set based on legitimate eviction status only
          group_id: c.group_id,
          sort_order: c.sort_order,
          bio: c.bio,
          photo_url: c.photo_url
        };
      }) || [];

      // Determine active contestants for this week
      // A contestant is active if they haven't been legitimately evicted
      const active = contestants.filter(c => {
        console.log(`👤 ${c.name}:`, { isEvicted: !c.isActive, shouldBeActive: c.isActive });
        return c.isActive;
      });

      console.log('✅ Active contestants for week', weekNumber, ':', active.map(c => c.name));

      setAllContestants(contestants);
      setEvictedContestants(allEvicted);
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