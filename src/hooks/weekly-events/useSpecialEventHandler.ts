import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { calculatePoints } from '@/utils/weeklyEventsUtils';

export const useSpecialEventHandler = () => {
  const processSpecialEvents = (
    eventForm: WeeklyEventForm,
    contestants: ContestantWithBio[],
    scoringRules: DetailedScoringRule[],
    poolId: string
  ) => {
    return eventForm.specialEvents
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
      if ((se.event_type === 'self_evicted' || se.event_type === 'removed_production') && se.contestant_id) {
        console.log('🚪 WeeklyEvents - Auto-evicting contestant due to quit:', se.contestant_id, se.event_type);
        
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
    for (const se of specialEvents) {
      // Handle special houseguest revival automatically
      if (se.event_type === 'came_back_after_evicted' && se.contestant_id) {
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
        }
      }

      // Handle automatic evictions for quit events - mark contestants as inactive
      if ((se.event_type === 'self_evicted' || se.event_type === 'removed_production') && se.contestant_id) {
        console.log('🚪 WeeklyEvents - Marking contestant inactive due to quit:', se.contestant_id, se.event_type);
        
        // Mark contestant as inactive
        const { error: inactiveError } = await supabase
          .from('contestants')
          .update({ is_active: false })
          .eq('id', se.contestant_id)
          .eq('pool_id', poolId);
        
        if (inactiveError) {
          console.error('❌ WeeklyEvents - Error marking contestant inactive:', inactiveError);
        } else {
          console.log('✅ WeeklyEvents - Contestant marked inactive due to quit');
        }
      }
    }
  };

  return { 
    processSpecialEvents, 
    handleAutoEvictionForQuitEvents, 
    handleSpecialEventStatusChanges 
  };
};