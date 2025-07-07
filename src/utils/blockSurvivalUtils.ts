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
      // Also check for floater achievement
      await checkAndCreateFloaterAchievement(contestant.id, weeklyEvents);
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

// Floater Achievement: 4 consecutive weeks without competition wins
export const checkAndCreateFloaterAchievement = async (contestantId: string, weeklyEvents: any[]) => {
  try {
    // Check if contestant already earned floater achievement
    const { data: contestant } = await supabase
      .from('contestants')
      .select('floater_achievement_earned, consecutive_weeks_no_wins, last_competition_win_week')
      .eq('id', contestantId)
      .single();

    if (!contestant || contestant.floater_achievement_earned) {
      return; // Already earned or contestant not found
    }

    // Get all competition wins for this contestant (HOH and POV)
    const competitionWins = weeklyEvents.filter(event => 
      event.contestant_id === contestantId && 
      (event.event_type === 'hoh_winner' || event.event_type === 'pov_winner')
    ).sort((a, b) => a.week_number - b.week_number);

    // Get all weeks with events to determine the current week
    const allWeeks = [...new Set(weeklyEvents.map(e => e.week_number))].sort((a, b) => a - b);
    const currentWeek = Math.max(...allWeeks);

    let consecutiveWeeks = 0;
    let lastWinWeek = contestant.last_competition_win_week || 0;

    // Calculate consecutive weeks without wins
    for (let week = lastWinWeek + 1; week <= currentWeek; week++) {
      const hasWinThisWeek = competitionWins.some(win => win.week_number === week);
      
      if (hasWinThisWeek) {
        consecutiveWeeks = 0; // Reset counter
        lastWinWeek = week;
      } else {
        // Check if contestant was still in the house this week (not evicted)
        const wasEvicted = weeklyEvents.some(event => 
          event.contestant_id === contestantId && 
          event.event_type === 'evicted' && 
          event.week_number <= week
        );
        
        if (!wasEvicted) {
          consecutiveWeeks++;
        }
      }
    }

    // Update contestant tracking data
    await supabase
      .from('contestants')
      .update({
        consecutive_weeks_no_wins: consecutiveWeeks,
        last_competition_win_week: lastWinWeek
      })
      .eq('id', contestantId);

    // Award floater achievement if earned
    if (consecutiveWeeks >= 4) {
      // Check if special event already exists
      const { data: existingEvent } = await supabase
        .from('special_events')
        .select('id')
        .eq('contestant_id', contestantId)
        .eq('event_type', 'floater_achievement')
        .maybeSingle();

      if (!existingEvent) {
        // Create special event
        await supabase.from('special_events').insert({
          contestant_id: contestantId,
          event_type: 'floater_achievement',
          description: 'Floater Achievement (4 consecutive weeks without wins)',
          points_awarded: 2,
          week_number: currentWeek
        });

        // Mark achievement as earned
        await supabase
          .from('contestants')
          .update({ floater_achievement_earned: true })
          .eq('id', contestantId);

        console.log(`Floater achievement awarded to contestant ${contestantId} at week ${currentWeek}`);
      }
    }
  } catch (error) {
    console.error('Error checking floater achievement:', error);
  }
};