import { supabase } from '@/integrations/supabase/client';
import { isEventOfType } from './scoringRulesLookup';

export const calculateBlockSurvivalStats = async (contestantId: string, weeklyEvents: any[]): Promise<number> => {
  // Find nominee events using proper UUID matching
  const nomineeEvents: any[] = [];
  for (const event of weeklyEvents) {
    if (event.contestant_id === contestantId && await isEventOfType(event.event_type, 'nominee')) {
      nomineeEvents.push(event);
    }
  }
  
  // Find weeks with evictions using proper UUID matching
  const weeksWithEvictions = new Set<number>();
  for (const event of weeklyEvents) {
    if (await isEventOfType(event.event_type, 'evicted')) {
      weeksWithEvictions.add(event.week_number);
    }
  }
  
  // Find weeks saved by POV using proper UUID matching
  const weeksSavedByPov = new Set<number>();
  for (const event of weeklyEvents) {
    if (event.contestant_id === contestantId && await isEventOfType(event.event_type, 'pov_used_on')) {
      weeksSavedByPov.add(event.week_number);
    }
  }
  
  // Find weeks won BB Arena using proper UUID matching
  const weeksWonBBArena = new Set<number>();
  for (const event of weeklyEvents) {
    if (event.contestant_id === contestantId && await isEventOfType(event.event_type, 'bb_arena_winner')) {
      weeksWonBBArena.add(event.week_number);
    }
  }
  
  // Find weeks evicted using proper UUID matching
  const weeksEvicted = new Set<number>();
  for (const event of weeklyEvents) {
    if (event.contestant_id === contestantId && await isEventOfType(event.event_type, 'evicted')) {
      weeksEvicted.add(event.week_number);
    }
  }
  
  // Get weekly_results data to cross-reference nominations and evictions
  try {
    const { data: weeklyResults } = await supabase
      .from('weekly_results')
      .select('*')
      .order('week_number');

    // Get contestant name for cross-referencing
    const { data: contestant } = await supabase
      .from('contestants')
      .select('name')
      .eq('id', contestantId)
      .single();

    if (!contestant || !weeklyResults) {
      // Fallback to original calculation if we can't get weekly results
      let timesOnBlockAtEviction = 0;
      for (const nomEvent of nomineeEvents) {
        const week = nomEvent.week_number;
        if (weeksWithEvictions.has(week) && 
            !weeksSavedByPov.has(week) && 
            !weeksWonBBArena.has(week) && 
            !weeksEvicted.has(week)) {
          timesOnBlockAtEviction++;
        }
      }
      return timesOnBlockAtEviction;
    }

    const contestantName = contestant.name;
    let survivedEvictions = 0;

    // Check each week's results to see if contestant was nominated but survived
    for (const weekResult of weeklyResults) {
      const nominees = weekResult.nominees || [];
      const secondNominees = weekResult.second_nominees || [];
      const allNominees = [...nominees, ...secondNominees];
      
      // Check if contestant was nominated this week
      const wasNominated = allNominees.includes(contestantName);
      
      if (wasNominated) {
        // Check if there was an eviction this week
        const wasEvictionWeek = weekResult.evicted_contestant || 
                               weekResult.second_evicted_contestant || 
                               weekResult.third_evicted_contestant;
        
        if (wasEvictionWeek) {
          // Check if this contestant was evicted
          const wasEvicted = contestantName === weekResult.evicted_contestant ||
                            contestantName === weekResult.second_evicted_contestant ||
                            contestantName === weekResult.third_evicted_contestant;
          
          // Check if they were saved by veto
          const wasSavedByVeto = contestantName === weekResult.pov_used_on ||
                                contestantName === weekResult.second_pov_used_on;
          
          // If nominated, there was an eviction, but they weren't evicted and weren't saved by veto
          if (!wasEvicted && !wasSavedByVeto) {
            survivedEvictions++;
          }
        }
      }
    }

    return survivedEvictions;
  } catch (error) {
    console.error('Error calculating block survival stats from weekly results:', error);
    
    // Fallback to original calculation
    let timesOnBlockAtEviction = 0;
    for (const nomEvent of nomineeEvents) {
      const week = nomEvent.week_number;
      if (weeksWithEvictions.has(week) && 
          !weeksSavedByPov.has(week) && 
          !weeksWonBBArena.has(week) && 
          !weeksEvicted.has(week)) {
        timesOnBlockAtEviction++;
      }
    }
    return timesOnBlockAtEviction;
  }
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
  // Get nomination events for this contestant using proper UUID matching
  const nomineeEvents: any[] = [];
  for (const event of weeklyEvents) {
    if (event.contestant_id === contestantId && await isEventOfType(event.event_type, 'nominee')) {
      nomineeEvents.push(event);
    }
  }
  nomineeEvents.sort((a, b) => a.week_number - b.week_number);
  
  // Get weeks with evictions using proper UUID matching
  const weeksWithEvictions = new Set<number>();
  for (const event of weeklyEvents) {
    if (await isEventOfType(event.event_type, 'evicted')) {
      weeksWithEvictions.add(event.week_number);
    }
  }
  
  // Get weeks saved by POV using proper UUID matching
  const weeksSavedByPov = new Set<number>();
  for (const event of weeklyEvents) {
    if (event.contestant_id === contestantId && await isEventOfType(event.event_type, 'pov_used_on')) {
      weeksSavedByPov.add(event.week_number);
    }
  }
  
  // Get weeks won BB Arena using proper UUID matching
  const weeksWonBBArena = new Set<number>();
  for (const event of weeklyEvents) {
    if (event.contestant_id === contestantId && await isEventOfType(event.event_type, 'bb_arena_winner')) {
      weeksWonBBArena.add(event.week_number);
    }
  }
  
  // Get weeks evicted using proper UUID matching
  const weeksEvicted = new Set<number>();
  for (const event of weeklyEvents) {
    if (event.contestant_id === contestantId && await isEventOfType(event.event_type, 'evicted')) {
      weeksEvicted.add(event.week_number);
    }
  }
  
  // Track survival streaks week by week
  let survivalCount = 0;
  const milestones = [2, 4]; // Milestones to track
  const achievedMilestones = new Set();
  
  // Get scoring rule UUIDs for block survival events
  const { data: scoringRules } = await supabase
    .from('detailed_scoring_rules')
    .select('id, subcategory')
    .in('subcategory', ['block_survival_2_weeks', 'block_survival_4_weeks'])
    .eq('is_active', true);

  const blockSurvival2WeeksId = scoringRules?.find(r => r.subcategory === 'block_survival_2_weeks')?.id;
  const blockSurvival4WeeksId = scoringRules?.find(r => r.subcategory === 'block_survival_4_weeks')?.id;

  // Check existing special events to avoid duplicates
  const { data: existingEvents } = await supabase
    .from('special_events')
    .select('event_type, week_number')
    .eq('contestant_id', contestantId)
    .in('event_type', [blockSurvival2WeeksId, blockSurvival4WeeksId].filter(Boolean));
  
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
          const eventTypeId = milestone === 2 ? blockSurvival2WeeksId : blockSurvival4WeeksId;
          
          // Only create if it doesn't exist and we have the scoring rule ID
          if (eventTypeId && !existingMilestones.has(eventTypeId)) {
            await createWeeklySpecialEvent(contestantId, eventType, week);
          }
        }
      }
    }
  }
};

export const createWeeklySpecialEvent = async (contestantId: string, eventType: string, weekNumber: number) => {
  try {
    // Get scoring rule UUID for the event type
    const { data: scoringRule } = await supabase
      .from('detailed_scoring_rules')
      .select('id, points')
      .eq('subcategory', eventType)
      .eq('is_active', true)
      .single();

    if (!scoringRule) {
      console.error(`❌ No scoring rule found for ${eventType}`);
      return;
    }
    
    const description = eventType === 'block_survival_2_weeks' ? 
      'Survived 2+ Eviction Votes' : 'Survived 4+ Eviction Votes';
    
    const { error } = await supabase.from('special_events').insert({
      contestant_id: contestantId,
      event_type: scoringRule.id, // Use UUID instead of string
      description: description,
      points_awarded: scoringRule.points,
      week_number: weekNumber
    });

    if (error) {
      console.error('❌ Error creating special event:', error);
    } else {
      console.log(`✅ Created ${eventType} event for week ${weekNumber} with ${scoringRule.points} points`);
    }
  } catch (error) {
    console.error('❌ Error creating weekly special event:', error);
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

    // Get all competition wins for this contestant (HOH and POV) using proper UUID matching
    const competitionWins: any[] = [];
    for (const event of weeklyEvents) {
      if (event.contestant_id === contestantId && 
          (await isEventOfType(event.event_type, 'hoh_winner') || 
           await isEventOfType(event.event_type, 'pov_winner'))) {
        competitionWins.push(event);
      }
    }
    competitionWins.sort((a, b) => a.week_number - b.week_number);

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
        // Check if contestant was still in the house this week (not evicted) using proper UUID matching
        let wasEvicted = false;
        for (const event of weeklyEvents) {
          if (event.contestant_id === contestantId && 
              event.week_number <= week && 
              await isEventOfType(event.event_type, 'evicted')) {
            wasEvicted = true;
            break;
          }
        }
        
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
