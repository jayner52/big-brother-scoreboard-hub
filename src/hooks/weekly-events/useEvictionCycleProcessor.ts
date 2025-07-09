import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { calculatePoints } from '@/utils/weeklyEventsUtils';

export const useEvictionCycleProcessor = () => {
  const processEvictionCycle = (
    cycle: 'first' | 'second',
    eventForm: WeeklyEventForm,
    contestants: ContestantWithBio[],
    scoringRules: DetailedScoringRule[],
    eventTypeMapping: Map<string, string>,
    poolId: string
  ) => {
    const evictionRound = cycle === 'first' ? 1 : 2;
    const hohWinner = cycle === 'first' ? eventForm.hohWinner : eventForm.secondHohWinner;
    const povWinner = cycle === 'first' ? eventForm.povWinner : eventForm.secondPovWinner;
    const povUsed = cycle === 'first' ? eventForm.povUsed : eventForm.secondPovUsed;
    const povUsedOn = cycle === 'first' ? eventForm.povUsedOn : eventForm.secondPovUsedOn;
    const nominees = cycle === 'first' ? eventForm.nominees : eventForm.secondNominees;
    const replacementNominee = cycle === 'first' ? eventForm.replacementNominee : eventForm.secondReplacementNominee;
    const evicted = cycle === 'first' ? eventForm.evicted : eventForm.secondEvicted;
    
    const cycleEvents = [];

    // Add HOH winner
    if (hohWinner && hohWinner !== 'no-winner') {
      cycleEvents.push({
        week_number: eventForm.week,
        contestant_id: contestants.find(c => c.name === hohWinner)?.id,
        event_type: eventTypeMapping.get('hoh_winner'),
        points_awarded: calculatePoints('hoh_winner', undefined, scoringRules),
        eviction_round: evictionRound,
        pool_id: poolId
      });
    }

    // Add POV winner
    if (povWinner && povWinner !== 'no-winner') {
      cycleEvents.push({
        week_number: eventForm.week,
        contestant_id: contestants.find(c => c.name === povWinner)?.id,
        event_type: eventTypeMapping.get('pov_winner'),
        points_awarded: calculatePoints('pov_winner', undefined, scoringRules),
        eviction_round: evictionRound,
        pool_id: poolId
      });
    }

    // Add POV used on someone
    if (povUsed && povUsedOn) {
      cycleEvents.push({
        week_number: eventForm.week,
        contestant_id: contestants.find(c => c.name === povUsedOn)?.id,
        event_type: eventTypeMapping.get('pov_used_on'),
        points_awarded: calculatePoints('pov_used_on', undefined, scoringRules),
        eviction_round: evictionRound,
        pool_id: poolId
      });
    }

    // Add nominees
    nominees.filter(n => n).forEach((nominee) => {
      cycleEvents.push({
        week_number: eventForm.week,
        contestant_id: contestants.find(c => c.name === nominee)?.id,
        event_type: eventTypeMapping.get('nominee'),
        points_awarded: calculatePoints('nominee', undefined, scoringRules),
        eviction_round: evictionRound,
        pool_id: poolId
      });
    });

    // Add replacement nominee
    if (replacementNominee) {
      cycleEvents.push({
        week_number: eventForm.week,
        contestant_id: contestants.find(c => c.name === replacementNominee)?.id,
        event_type: eventTypeMapping.get('replacement_nominee'),
        points_awarded: calculatePoints('replacement_nominee', undefined, scoringRules),
        eviction_round: evictionRound,
        pool_id: poolId
      });
    }

    // Add evicted contestant
    if (evicted && evicted !== 'no-eviction') {
      cycleEvents.push({
        week_number: eventForm.week,
        contestant_id: contestants.find(c => c.name === evicted)?.id,
        event_type: eventTypeMapping.get('evicted'),
        points_awarded: 0, // No points for being evicted
        eviction_round: evictionRound,
        pool_id: poolId
      });
    }

    return cycleEvents;
  };

  const processTripleEvictionCycle = (
    eventForm: WeeklyEventForm,
    contestants: ContestantWithBio[],
    scoringRules: DetailedScoringRule[],
    eventTypeMapping: Map<string, string>,
    poolId: string
  ) => {
    const events = [];

    // Add third HOH winner
    if (eventForm.thirdHohWinner && eventForm.thirdHohWinner !== 'no-winner') {
      events.push({
        week_number: eventForm.week,
        contestant_id: contestants.find(c => c.name === eventForm.thirdHohWinner)?.id,
        event_type: eventTypeMapping.get('hoh_winner'),
        points_awarded: calculatePoints('hoh_winner', undefined, scoringRules),
        eviction_round: 3,
        pool_id: poolId
      });
    }

    // Add third POV winner
    if (eventForm.thirdPovWinner && eventForm.thirdPovWinner !== 'no-winner') {
      events.push({
        week_number: eventForm.week,
        contestant_id: contestants.find(c => c.name === eventForm.thirdPovWinner)?.id,
        event_type: eventTypeMapping.get('pov_winner'),
        points_awarded: calculatePoints('pov_winner', undefined, scoringRules),
        eviction_round: 3,
        pool_id: poolId
      });
    }

    // Add third evicted contestant
    if (eventForm.thirdEvicted && eventForm.thirdEvicted !== 'no-eviction') {
      events.push({
        week_number: eventForm.week,
        contestant_id: contestants.find(c => c.name === eventForm.thirdEvicted)?.id,
        event_type: eventTypeMapping.get('evicted'),
        points_awarded: 0, // No points for being evicted
        eviction_round: 3,
        pool_id: poolId
      });
    }

    return events;
  };

  return { processEvictionCycle, processTripleEvictionCycle };
};