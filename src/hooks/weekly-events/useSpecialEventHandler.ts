
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { calculatePoints } from '@/utils/weeklyEventsUtils';
import { 
  validateSpecialEvents, 
  deduplicateEvents, 
  isEvictionEvent, 
  isRevivalEvent,
  type SpecialEventData,
  type ValidationError 
} from '@/utils/specialEventRules';

export const useSpecialEventHandler = () => {
  const validateSpecialEventsForm = (
    eventForm: WeeklyEventForm,
    contestants: ContestantWithBio[],
    scoringRules: DetailedScoringRule[]
  ): ValidationError[] => {
    const specialEventData: SpecialEventData[] = eventForm.specialEvents.map(se => ({
      contestant: se.contestant,
      eventType: se.eventType,
      weekNumber: eventForm.week,
      description: se.description,
      customPoints: se.customPoints,
      customDescription: se.customDescription,
      customEmoji: se.customEmoji
    }));
    
    return validateSpecialEvents(specialEventData, contestants, scoringRules);
  };

  const processSpecialEvents = (
    eventForm: WeeklyEventForm,
    contestants: ContestantWithBio[],
    scoringRules: DetailedScoringRule[],
    poolId: string
  ) => {
    // Convert to SpecialEventData format for processing
    const specialEventData: SpecialEventData[] = eventForm.specialEvents.map(se => ({
      contestant: se.contestant,
      eventType: se.eventType,
      weekNumber: eventForm.week,
      description: se.description,
      customPoints: se.customPoints,
      customDescription: se.customDescription,
      customEmoji: se.customEmoji
    }));
    
    // Deduplicate events using the rules system
    const deduplicatedEvents = deduplicateEvents(specialEventData);
    
    return deduplicatedEvents
      .filter(se => se.contestant && se.eventType)
      .map(se => ({
        week_number: eventForm.week,
        contestant_id: contestants.find(c => c.name === se.contestant)?.id,
        event_type: se.eventType,
        description: se.description,
        points_awarded: calculatePoints(se.eventType, se.customPoints, scoringRules),
        pool_id: poolId
      }))
      .filter(se => se.contestant_id);
  };

  const handleAutoEvictionForQuitEvents = async (
    specialEvents: any[],
    eventTypeMapping: Map<string, string>,
    eventForm: WeeklyEventForm,
    poolId: string
  ) => {
    const autoEvictionEvents = [];

    for (const se of specialEvents) {
      // Check if this is a quit event by looking up the scoring rule
      const { data: scoringRule } = await supabase
        .from('detailed_scoring_rules')
        .select('subcategory')
        .eq('id', se.event_type)
        .single();

      if (scoringRule && (scoringRule.subcategory === 'self_evicted' || scoringRule.subcategory === 'removed_production') && se.contestant_id) {
        console.log('🚪 WeeklyEvents - Auto-evicting contestant due to quit:', se.contestant_id, scoringRule.subcategory);
        
        // Create an eviction event for this contestant
        const evictionEvent = {
          week_number: eventForm.week,
          contestant_id: se.contestant_id,
          event_type: eventTypeMapping.get('evicted'),
          points_awarded: 0, // No points for being evicted
          pool_id: poolId
        };
        
        // Add to events array if event_type exists
        if (evictionEvent.event_type) {
          autoEvictionEvents.push(evictionEvent);
          console.log('✅ WeeklyEvents - Auto-eviction event created for contestant:', se.contestant_id);
        }
      }
    }

    return autoEvictionEvents;
  };

  const handleSpecialEventStatusChanges = async (
    specialEvents: any[],
    poolId: string
  ) => {
    console.log('🔄 Starting special event status changes for', specialEvents.length, 'events');
    
    for (const se of specialEvents) {
      // Get the subcategory for this event type UUID
      const { data: scoringRule, error: ruleError } = await supabase
        .from('detailed_scoring_rules')
        .select('subcategory, description')
        .eq('id', se.event_type)
        .single();

      if (ruleError || !scoringRule) {
        console.error('❌ Failed to get scoring rule for event:', se.event_type, ruleError);
        continue;
      }

      console.log('📋 Processing special event:', {
        contestant_id: se.contestant_id,
        event_type: scoringRule.subcategory,
        description: scoringRule.description
      });

      // Handle special houseguest revival automatically
      if (scoringRule.subcategory === 'came_back_evicted' && se.contestant_id) {
        console.log('🔄 WeeklyEvents - Auto-reviving houseguest:', se.contestant_id);
        const { error: revivalError } = await supabase
          .from('contestants')
          .update({ is_active: true })
          .eq('id', se.contestant_id)
          .eq('pool_id', poolId);
        
        if (revivalError) {
          console.error('❌ WeeklyEvents - Revival error:', revivalError);
        } else {
          console.log('✅ WeeklyEvents - Houseguest revived successfully');
          
          // Double-check the update worked
          const { data: contestant } = await supabase
            .from('contestants')
            .select('name, is_active')
            .eq('id', se.contestant_id)
            .single();
          console.log('✅ Verified contestant status:', contestant);
        }
      }

      // Handle automatic evictions for quit events - mark contestants as inactive
      if ((scoringRule.subcategory === 'self_evicted' || scoringRule.subcategory === 'removed_production') && se.contestant_id) {
        console.log('🚪 WeeklyEvents - Marking contestant inactive due to quit:', se.contestant_id, scoringRule.subcategory);
        
        // Mark contestant as inactive - this provides redundancy to the database trigger
        const { error: inactiveError } = await supabase
          .from('contestants')
          .update({ is_active: false })
          .eq('id', se.contestant_id)
          .eq('pool_id', poolId);
        
        if (inactiveError) {
          console.error('❌ WeeklyEvents - Error marking contestant inactive:', inactiveError);
        } else {
          console.log('✅ WeeklyEvents - Contestant marked inactive due to quit');
          
          // Double-check the update worked and log the contestant info
          const { data: contestant } = await supabase
            .from('contestants')
            .select('name, is_active')
            .eq('id', se.contestant_id)
            .single();
          console.log('✅ Verified contestant status:', contestant);
        }
      }
    }
    
    console.log('✅ Completed special event status changes');
  };

  return { 
    processSpecialEvents, 
    handleAutoEvictionForQuitEvents, 
    handleSpecialEventStatusChanges,
    validateSpecialEventsForm
  };
};
