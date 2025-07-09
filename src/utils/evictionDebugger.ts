
import { supabase } from '@/integrations/supabase/client';

/**
 * Debug utility to trace why a contestant may or may not be marked as evicted
 */
export const debugContestantEvictionStatus = async (contestantName: string, poolId: string) => {
  console.log(`🔍 DEBUGGING EVICTION STATUS FOR: ${contestantName} in pool ${poolId}`);
  
  try {
    // 1. Check current is_active status
    const { data: contestant } = await supabase
      .from('contestants')
      .select('name, is_active')
      .eq('name', contestantName)
      .eq('pool_id', poolId)
      .single();
    
    console.log(`📊 Current status:`, contestant);
    
    // 2. Check weekly_results evictions
    const { data: weeklyEvictions } = await supabase
      .from('weekly_results')
      .select('week_number, evicted_contestant, second_evicted_contestant, third_evicted_contestant, is_draft')
      .eq('pool_id', poolId)
      .eq('is_draft', false);
    
    const evictionWeeks = weeklyEvictions?.filter(week => 
      week.evicted_contestant === contestantName ||
      week.second_evicted_contestant === contestantName ||
      week.third_evicted_contestant === contestantName
    ) || [];
    
    console.log(`📅 Weekly evictions found:`, evictionWeeks);
    
    // 3. Check special eviction events (quit/removed)
    // First get weekly events for this contestant
    const { data: weeklyEvents } = await supabase
      .from('weekly_events')
      .select('week_number, event_type, contestant_id')
      .eq('pool_id', poolId);
    
    // Get contestant ID
    const { data: contestantData } = await supabase
      .from('contestants')
      .select('id')
      .eq('name', contestantName)
      .eq('pool_id', poolId)
      .single();
    
    // Filter events for this contestant
    const contestantEvents = weeklyEvents?.filter(event => 
      event.contestant_id === contestantData?.id
    ) || [];
    
    // Get scoring rules for special evictions
    const { data: evictionRules } = await supabase
      .from('detailed_scoring_rules')
      .select('id, subcategory')
      .in('subcategory', ['self_evicted', 'removed_production']);
    
    const evictionRuleIds = evictionRules?.map(rule => rule.id) || [];
    
    const quitEvents = contestantEvents.filter(event => 
      evictionRuleIds.includes(event.event_type)
    );
    
    console.log(`🚪 Special eviction events found:`, quitEvents);
    
    // 4. Check revival events
    const { data: specialEvents } = await supabase
      .from('special_events')
      .select('week_number, event_type, contestant_id')
      .eq('pool_id', poolId);
    
    // Filter special events for this contestant
    const contestantSpecialEvents = specialEvents?.filter(event => 
      event.contestant_id === contestantData?.id
    ) || [];
    
    // Get revival scoring rules
    const { data: revivalRules } = await supabase
      .from('detailed_scoring_rules')
      .select('id, subcategory')
      .eq('subcategory', 'came_back_evicted');
    
    const revivalEventIds = revivalRules?.map(r => r.id) || [];
    const revivals = contestantSpecialEvents.filter(event => 
      revivalEventIds.includes(event.event_type)
    );
    
    console.log(`🔄 Revival events found:`, revivals);
    
    // 5. Summary
    const shouldBeEvicted = evictionWeeks.length > 0 || quitEvents.length > 0;
    const shouldBeActive = revivals.length > 0 && revivals.some(r => 
      r.week_number > Math.max(...evictionWeeks.map(e => e.week_number), ...quitEvents.map(q => q.week_number), 0)
    );
    
    console.log(`🎯 ANALYSIS SUMMARY:`);
    console.log(`   Current is_active: ${contestant?.is_active}`);
    console.log(`   Should be evicted: ${shouldBeEvicted}`);
    console.log(`   Should be active (revival): ${shouldBeActive}`);
    console.log(`   Expected is_active: ${!shouldBeEvicted || shouldBeActive}`);
    
    if (contestant?.is_active !== (!shouldBeEvicted || shouldBeActive)) {
      console.log(`❌ STATUS INCONSISTENCY DETECTED!`);
      console.log(`   Database trigger may need to be manually run or there's a data issue.`);
    } else {
      console.log(`✅ Status is consistent with eviction rules.`);
    }
    
  } catch (error) {
    console.error(`❌ Error debugging eviction status:`, error);
  }
};

/**
 * Debug all contestants in a pool
 */
export const debugAllContestantsEvictionStatus = async (poolId: string) => {
  console.log(`🔍 DEBUGGING ALL CONTESTANTS IN POOL: ${poolId}`);
  
  const { data: contestants } = await supabase
    .from('contestants')
    .select('name')
    .eq('pool_id', poolId);
  
  if (contestants) {
    for (const contestant of contestants) {
      await debugContestantEvictionStatus(contestant.name, poolId);
      console.log(`---`);
    }
  }
};
