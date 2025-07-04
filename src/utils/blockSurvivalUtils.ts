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
      const timesOnBlockAtEviction = calculateBlockSurvivalStats(contestant.id, weeklyEvents);

      if (timesOnBlockAtEviction >= 2) {
        await ensureBlockSurvivalEvent(contestant.id, 'block_survival_2_weeks', timesOnBlockAtEviction >= 2);
      }
      
      if (timesOnBlockAtEviction >= 4) {
        await ensureBlockSurvivalEvent(contestant.id, 'block_survival_4_weeks', timesOnBlockAtEviction >= 4);
      }
    }
  } catch (error) {
    console.error('Error creating block survival bonuses:', error);
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