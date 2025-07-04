import { supabase } from '@/integrations/supabase/client';

export const calculateBlockSurvivalStats = (contestantId: string, weeklyEvents: any[]) => {
  const nomineeEvents = weeklyEvents.filter(event => 
    event.contestant_id === contestantId && event.event_type === 'nominee'
  );
  
  const weeksWithEvictions = new Set(
    weeklyEvents.filter(event => event.event_type === 'evicted').map(event => event.week_number)
  );
  
  const weeksSavedByPov = new Set(
    weeklyEvents.filter(event => event.contestant_id === contestantId && event.event_type === 'pov_used_on').map(event => event.week_number)
  );
  
  const weeksWonBBArena = new Set(
    weeklyEvents.filter(event => event.contestant_id === contestantId && event.event_type === 'bb_arena_winner').map(event => event.week_number)
  );
  
  const weeksEvicted = new Set(
    weeklyEvents.filter(event => event.contestant_id === contestantId && event.event_type === 'evicted').map(event => event.week_number)
  );
  
  const timesOnBlockAtEviction = nomineeEvents.filter(nomEvent => {
    const week = nomEvent.week_number;
    return weeksWithEvictions.has(week) && 
           !weeksSavedByPov.has(week) && 
           !weeksWonBBArena.has(week) && 
           !weeksEvicted.has(week);
  }).length;

  return timesOnBlockAtEviction;
};

export const createBlockSurvivalBonuses = async (contestants: any[], weeklyEvents: any[]) => {
  try {
    for (const contestant of contestants) {
      await checkAndCreateBlockSurvivalEvents(contestant.id, weeklyEvents);
    }
  } catch (error) {
    console.error('Error creating block survival bonuses:', error);
  }
};

export const checkAndCreateBlockSurvivalEvents = async (contestantId: string, weeklyEvents: any[]) => {
  // Get nomination events for this contestant, sorted by week
  const nomineeEvents = weeklyEvents
    .filter(event => event.contestant_id === contestantId && event.event_type === 'nominee')
    .sort((a, b) => a.week_number - b.week_number);
  
  const weeksWithEvictions = new Set(
    weeklyEvents.filter(event => event.event_type === 'evicted').map(event => event.week_number)
  );
  
  const weeksSavedByPov = new Set(
    weeklyEvents.filter(event => event.contestant_id === contestantId && event.event_type === 'pov_used_on').map(event => event.week_number)
  );
  
  const weeksWonBBArena = new Set(
    weeklyEvents.filter(event => event.contestant_id === contestantId && event.event_type === 'bb_arena_winner').map(event => event.week_number)
  );
  
  const weeksEvicted = new Set(
    weeklyEvents.filter(event => event.contestant_id === contestantId && event.event_type === 'evicted').map(event => event.week_number)
  );
  
  // Track survival streaks week by week
  let survivalCount = 0;
  const milestones = [2, 4]; // Milestones to track
  const achievedMilestones = new Set();
  
  // Check existing special events to avoid duplicates
  const { data: existingEvents } = await supabase
    .from('special_events')
    .select('event_type, week_number')
    .eq('contestant_id', contestantId)
    .in('event_type', ['block_survival_2_weeks', 'block_survival_4_weeks']);
  
  const existingMilestones = new Set(
    existingEvents?.map(e => e.event_type) || []
  );
  
  for (const nomEvent of nomineeEvents) {
    const week = nomEvent.week_number;
    
    // Check if they survived this eviction week
    if (weeksWithEvictions.has(week) && 
        !weeksSavedByPov.has(week) && 
        !weeksWonBBArena.has(week) && 
        !weeksEvicted.has(week)) {
      
      survivalCount++;
      
      // Check if we hit a milestone this week and haven't already created it
      for (const milestone of milestones) {
        if (survivalCount === milestone && !achievedMilestones.has(milestone)) {
          achievedMilestones.add(milestone);
          
          const eventType = milestone === 2 ? 'block_survival_2_weeks' : 'block_survival_4_weeks';
          
          // Only create if it doesn't exist
          if (!existingMilestones.has(eventType)) {
            await createWeeklySpecialEvent(contestantId, eventType, week);
          }
        }
      }
    }
  }
};

export const createWeeklySpecialEvent = async (contestantId: string, eventType: string, weekNumber: number) => {
  try {
    // Import scoring rules to get points
    const { useScoringRules } = await import('@/hooks/useScoringRules');
    const { getPointsForEvent } = useScoringRules();
    
    const points = eventType === 'block_survival_2_weeks' ? 
      getPointsForEvent('block_survival_2_weeks') || 3 : 
      getPointsForEvent('block_survival_4_weeks') || 5;
    
    const description = eventType === 'block_survival_2_weeks' ? 
      'Survived 2+ Eviction Votes' : 'Survived 4+ Eviction Votes';
    
    await supabase.from('special_events').insert({
      contestant_id: contestantId,
      event_type: eventType,
      description: description,
      points_awarded: points,
      week_number: weekNumber
    });
    
    console.log(`Created ${eventType} event for week ${weekNumber}`);
  } catch (error) {
    console.error('Error creating weekly special event:', error);
  }
};

export const ensureBlockSurvivalEvent = async (contestantId: string, eventType: string, shouldExist: boolean) => {
  try {
    const { data: existingEvent } = await supabase
      .from('special_events')
      .select('*')
      .eq('contestant_id', contestantId)
      .eq('event_type', eventType)
      .maybeSingle();

    if (shouldExist && !existingEvent) {
      // Import scoring rules within the function to avoid circular dependencies
      const { getPointsForEvent } = await import('@/hooks/useScoringRules').then(m => m.useScoringRules());
      const points = eventType === 'block_survival_2_weeks' ? 
        getPointsForEvent('block_survival_2_weeks') || 3 : 
        getPointsForEvent('block_survival_4_weeks') || 5;
      
      await supabase.from('special_events').insert({
        contestant_id: contestantId,
        event_type: eventType,
        description: eventType === 'block_survival_2_weeks' ? 
          'Survived 2+ Eviction Votes' : 'Survived 4+ Eviction Votes',
        points_awarded: points,
        week_number: 1
      });
    }
  } catch (error) {
    console.error('Error ensuring block survival event:', error);
  }
};

export const calculateBlockSurvivalBonus = async (timesOnBlockAtEviction: number): Promise<number> => {
  // Import scoring rules within the function to avoid circular dependencies
  const { getPointsForEvent } = await import('@/hooks/useScoringRules').then(m => m.useScoringRules());
  let bonus = 0;
  if (timesOnBlockAtEviction >= 2) {
    bonus += getPointsForEvent('block_survival_2_weeks') || 3;
  }
  if (timesOnBlockAtEviction >= 4) {
    bonus += getPointsForEvent('block_survival_4_weeks') || 5;
  }
  return bonus;
};