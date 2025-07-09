import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { calculatePoints } from '@/utils/weeklyEventsUtils';
import { useAutoPointsRecalculation } from './useAutoPointsRecalculation';
import { useEventTypeMapping } from './weekly-events/useEventTypeMapping';
import { useEvictionCycleProcessor } from './weekly-events/useEvictionCycleProcessor';
import { useSpecialEventHandler } from './weekly-events/useSpecialEventHandler';
import { useSurvivalPointsCalculator } from './weekly-events/useSurvivalPointsCalculator';
import { useWeeklyResultsManager } from './weekly-events/useWeeklyResultsManager';
import { useWeekAdvancement } from './weekly-events/useWeekAdvancement';
import { useFinalWeekProcessor } from './weekly-events/useFinalWeekProcessor';

export const useWeeklyEventsSubmission = (
  contestants: ContestantWithBio[],
  scoringRules: DetailedScoringRule[],
  poolId: string
) => {
  const { toast } = useToast();
  const { triggerRecalculation } = useAutoPointsRecalculation();
  
  const { getEventTypeMapping } = useEventTypeMapping();
  const { processEvictionCycle, processTripleEvictionCycle } = useEvictionCycleProcessor();
  const { processSpecialEvents, handleAutoEvictionForQuitEvents, handleSpecialEventStatusChanges } = useSpecialEventHandler();
  const { calculateSurvivalPoints, calculateJuryPoints } = useSurvivalPointsCalculator();
  const { createOrUpdateWeeklyResults, updateEvictedContestantStatuses, updateFinalWeekContestantStatuses } = useWeeklyResultsManager();
  const { advanceWeek } = useWeekAdvancement();
  const { processFinalWeekEvents } = useFinalWeekProcessor();

  const handleSubmitWeek = async (eventForm: WeeklyEventForm, loadData: () => void) => {
    try {
      // Get event type mappings
      const eventTypeMapping = await getEventTypeMapping();

      // First delete existing data for this week to avoid duplicates
      await Promise.all([
        supabase.from('weekly_events').delete().eq('week_number', eventForm.week).eq('pool_id', poolId),
        supabase.from('special_events').delete().eq('week_number', eventForm.week).eq('pool_id', poolId)
      ]);

      // Create weekly events entries
      const events = [];
      
      // Process first eviction cycle (always happens)
      events.push(...processEvictionCycle('first', eventForm, contestants, scoringRules, eventTypeMapping, poolId));
      
      // Process second eviction cycle if double eviction
      if (eventForm.isDoubleEviction) {
        events.push(...processEvictionCycle('second', eventForm, contestants, scoringRules, eventTypeMapping, poolId));
      }
      
      // Process third eviction cycle if triple eviction
      if (eventForm.isTripleEviction) {
        events.push(...processTripleEvictionCycle(eventForm, contestants, scoringRules, eventTypeMapping, poolId));
      }

      // Add survival points for non-evicted contestants
      const survivalEvents = await calculateSurvivalPoints(eventForm, contestants, scoringRules, eventTypeMapping, poolId);
      events.push(...survivalEvents);

      // Add BB Arena winner points
      if (eventForm.aiArenaWinner) {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.aiArenaWinner)?.id,
          event_type: eventTypeMapping.get('bb_arena_winner'),
          points_awarded: calculatePoints('bb_arena_winner', undefined, scoringRules),
          pool_id: poolId
        });
      }

      // Add jury points if jury phase starts this week
      const currentWeekEvicted = [eventForm.evicted, eventForm.secondEvicted, eventForm.thirdEvicted]
        .filter(name => name && name !== 'no-eviction');
      const evictedEventTypeId = eventTypeMapping.get('evicted');
      const { data: allEvictedData } = await supabase
        .from('weekly_events')
        .select('contestants!inner(name)')
        .eq('event_type', evictedEventTypeId)
        .eq('pool_id', poolId);
      const allEvictedNames = allEvictedData?.map(event => (event.contestants as any).name) || [];
      const currentlyEvicted = [...allEvictedNames, ...currentWeekEvicted];
      const survivingContestants = contestants.filter(c => !currentlyEvicted.includes(c.name));

      const juryEvents = calculateJuryPoints(eventForm, contestants, scoringRules, eventTypeMapping, poolId, survivingContestants);
      events.push(...juryEvents);

      // Handle Final Week events
      const finalWeekEvents = processFinalWeekEvents(eventForm, contestants, scoringRules, eventTypeMapping, poolId);
      events.push(...finalWeekEvents);

      // Prepare special events for processing
      const specialEvents = processSpecialEvents(eventForm, contestants, scoringRules, poolId);

      // Handle automatic evictions for quit events (self_evicted, removed_production)
      const autoEvictionEvents = await handleAutoEvictionForQuitEvents(specialEvents, eventTypeMapping, eventForm, poolId);
      events.push(...autoEvictionEvents);

      // Filter out events with missing contestant_id or event_type
      const validEvents = events.filter(e => e.contestant_id && e.event_type);
      
      console.log('🔍 All events created:', events);
      console.log('🔍 Valid events for insertion:', validEvents);
      console.log('🔍 Filtered out events:', events.filter(e => !e.contestant_id || !e.event_type));
      
      if (validEvents.length > 0) {
        const { error: eventsError } = await supabase
          .from('weekly_events')
          .insert(validEvents);

        if (eventsError) throw eventsError;
      }

      // Insert special events
      if (specialEvents.length > 0) {
        const { error: specialEventsError } = await supabase
          .from('special_events')
          .insert(specialEvents);

        if (specialEventsError) throw specialEventsError;
      }

      // Handle special event status changes
      await handleSpecialEventStatusChanges(specialEvents, poolId);

      // Update evicted contestant statuses
      await updateEvictedContestantStatuses(eventForm, poolId);

      // Update final week contestant statuses
      await updateFinalWeekContestantStatuses(eventForm, poolId);

      // Update or insert into weekly_results table
      await createOrUpdateWeeklyResults(eventForm, poolId);

      console.log('🏁 Final Week Check:', { 
        isFinalWeek: eventForm.isFinalWeek, 
        week: eventForm.week,
        winner: eventForm.winner,
        runnerUp: eventForm.runnerUp 
      });

      // Show different success messages for final week vs regular week
      if (eventForm.isFinalWeek) {
        console.log('🏁 Processing FINAL WEEK - NO WEEK ADVANCEMENT');
        toast({
          title: "🏆 Final Week Submitted!",
          description: `Season finale results recorded successfully. Ready for season completion.`,
        });
        
        // For final week, reload data and trigger recalculation but don't advance
        loadData();
        await triggerRecalculation(`Final week ${eventForm.week} events submitted`);
        
        console.log('🏁 Final Week submission complete - staying on same week');
        return; // CRITICAL: Exit early to prevent ANY week advancement for final week
      } else {
        toast({
          title: "Success!",
          description: `Week ${eventForm.week} events recorded successfully`,
        });

        // Only advance week for non-final weeks
        const advancementSuccess = await advanceWeek(eventForm.week, poolId);
        
        if (advancementSuccess) {
          toast({
            title: "Week Completed!",
            description: `Week ${eventForm.week} completed! Advanced to Week ${eventForm.week + 1}`,
          });
        }
      }

      // Reload data and trigger automatic recalculation
      loadData();
      await triggerRecalculation(`Week ${eventForm.week} events submitted`);

    } catch (error) {
      console.error('Error submitting week:', error);
      toast({
        title: "Error",
        description: "Failed to record weekly events",
        variant: "destructive",
      });
    }
  };

  return {
    handleSubmitWeek
  };
};