import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { calculatePoints } from '@/utils/weeklyEventsUtils';

export const useSurvivalPointsCalculator = () => {
  const calculateSurvivalPoints = async (
    eventForm: WeeklyEventForm,
    contestants: ContestantWithBio[],
    scoringRules: DetailedScoringRule[],
    eventTypeMapping: Map<string, string>,
    poolId: string
  ) => {
    // Get current week evicted contestants
    const currentWeekEvicted = [eventForm.evicted, eventForm.secondEvicted, eventForm.thirdEvicted]
      .filter(name => name && name !== 'no-eviction');
    
    // Get all evicted contestants from database to determine who's active
    const evictedEventTypeId = eventTypeMapping.get('evicted');
    const { data: allEvictedData } = await supabase
      .from('weekly_events')
      .select('contestants!inner(name)')
      .eq('event_type', evictedEventTypeId)
      .eq('pool_id', poolId);
    
    const allEvictedNames = allEvictedData?.map(event => (event.contestants as any).name) || [];
    const currentlyEvicted = [...allEvictedNames, ...currentWeekEvicted];
    
    const survivingContestants = contestants.filter(c => !currentlyEvicted.includes(c.name));
    
    return survivingContestants.map(contestant => ({
      week_number: eventForm.week,
      contestant_id: contestant.id,
      event_type: eventTypeMapping.get('survival'),
      points_awarded: calculatePoints('survival', undefined, scoringRules),
      pool_id: poolId
    }));
  };

  const calculateJuryPoints = (
    eventForm: WeeklyEventForm,
    contestants: ContestantWithBio[],
    scoringRules: DetailedScoringRule[],
    eventTypeMapping: Map<string, string>,
    poolId: string,
    survivingContestants: ContestantWithBio[]
  ) => {
    if (!eventForm.isJuryPhase) return [];

    return survivingContestants.map(contestant => ({
      week_number: eventForm.week,
      contestant_id: contestant.id,
      event_type: eventTypeMapping.get('jury_member'),
      points_awarded: calculatePoints('jury_member', undefined, scoringRules),
      pool_id: poolId
    }));
  };

  return { calculateSurvivalPoints, calculateJuryPoints };
};