import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { calculatePoints } from '@/utils/weeklyEventsUtils';

export const useFinalWeekProcessor = () => {
  const processFinalWeekEvents = (
    eventForm: WeeklyEventForm,
    contestants: ContestantWithBio[],
    scoringRules: DetailedScoringRule[],
    eventTypeMapping: Map<string, string>,
    poolId: string
  ) => {
    if (!eventForm.isFinalWeek) return [];

    const finalWeekEvents = [];

    // Add winner
    if (eventForm.winner) {
      finalWeekEvents.push({
        week_number: eventForm.week,
        contestant_id: contestants.find(c => c.name === eventForm.winner)?.id,
        event_type: eventTypeMapping.get('winner'),
        points_awarded: calculatePoints('winner', undefined, scoringRules),
        pool_id: poolId
      });
    }

    // Add runner-up
    if (eventForm.runnerUp) {
      finalWeekEvents.push({
        week_number: eventForm.week,
        contestant_id: contestants.find(c => c.name === eventForm.runnerUp)?.id,
        event_type: eventTypeMapping.get('runner_up'),
        points_awarded: calculatePoints('runner_up', undefined, scoringRules),
        pool_id: poolId
      });
    }

    // Add America's Favorite
    if (eventForm.americasFavorite) {
      finalWeekEvents.push({
        week_number: eventForm.week,
        contestant_id: contestants.find(c => c.name === eventForm.americasFavorite)?.id,
        event_type: eventTypeMapping.get('americas_favorite'),
        points_awarded: calculatePoints('americas_favorite', undefined, scoringRules),
        pool_id: poolId
      });
    }

    return finalWeekEvents;
  };

  return { processFinalWeekEvents };
};