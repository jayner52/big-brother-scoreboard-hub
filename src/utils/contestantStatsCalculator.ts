import { ContestantStats } from '@/types/contestant-stats';
import { Contestant, ContestantGroup } from '@/types/pool';
import { calculateBlockSurvivalStats } from './blockSurvivalUtils';
import { isEventOfType, isEventAnyOfTypes, getEventSubcategory } from './scoringRulesLookup';

export const calculateContestantStats = async (
  contestants: Contestant[],
  contestantGroups: ContestantGroup[],
  poolEntries: any[],
  weeklyEvents: any[],
  specialEvents: any[],
  evictedContestants: string[],
  currentGameWeek: number = 7
): Promise<ContestantStats[]> => {
  // Determine who is evicted based on current game week  
  const evictedThisGameWeek: string[] = [];
  for (const event of weeklyEvents) {
    if (await isEventOfType(event.event_type, 'evicted') && event.week_number < currentGameWeek) {
      const contestant = contestants.find(c => c.id === event.contestant_id);
      if (contestant?.name) {
        evictedThisGameWeek.push(contestant.name);
      }
    }
  }

  const mappedContestants = contestants.map(c => ({
    ...c,
    isActive: !evictedThisGameWeek.includes(c.name)
  }));

  // Process each contestant's stats using proper async calculations
  const stats: ContestantStats[] = [];
  
  for (const contestant of mappedContestants) {
    const group = contestantGroups.find(g => g.id === contestant.group_id);
    
    // Count how many times this contestant was selected
    const timesSelected = poolEntries.reduce((count, entry) => {
      const players = [entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5];
      return count + (players.includes(contestant.name) ? 1 : 0);
    }, 0);

    // Count HOH wins using proper UUID matching
    let hohWins = 0;
    for (const event of weeklyEvents) {
      if (event.contestant_id === contestant.id && 
          await isEventOfType(event.event_type, 'hoh_winner')) {
        hohWins++;
      }
    }

    // Count POV wins using proper UUID matching
    let vetoWins = 0;
    for (const event of weeklyEvents) {
      if (event.contestant_id === contestant.id && 
          await isEventOfType(event.event_type, 'pov_winner')) {
        vetoWins++;
      }
    }

    // Count times on block (nominations) using proper UUID matching
    let timesOnBlock = 0;
    for (const event of weeklyEvents) {
      if (event.contestant_id === contestant.id && 
          await isEventOfType(event.event_type, 'nominee')) {
        timesOnBlock++;
      }
    }

    // Count times on block at eviction and survived (will fix this in blockSurvivalUtils)
    const timesOnBlockAtEviction = await calculateBlockSurvivalStats(contestant.id, weeklyEvents);

    // Count times saved by veto using proper UUID matching
    let timesSavedByVeto = 0;
    for (const event of weeklyEvents) {
      if (event.contestant_id === contestant.id && 
          await isEventOfType(event.event_type, 'pov_used_on')) {
        timesSavedByVeto++;
      }
    }

    // Find elimination week using proper UUID matching
    let eliminationWeek: number | undefined;
    for (const event of weeklyEvents) {
      if (event.contestant_id === contestant.id && 
          await isEventOfType(event.event_type, 'evicted')) {
        eliminationWeek = event.week_number;
        break;
      }
    }

    // Get all special events for this contestant
    const contestantSpecialEvents = specialEvents
      .filter(event => event.contestant_id === contestant.id)
      .map(event => ({
        event_type: event.event_type,
        description: event.description,
        points_awarded: event.points_awarded
      }));

    // Include relevant weekly events as special events for display using proper UUID matching
    const weeklySpecialEvents: any[] = [];
    for (const event of weeklyEvents) {
      if (event.contestant_id === contestant.id) {
        if (await isEventAnyOfTypes(event.event_type, ['bb_arena_winner', 'jury_member'])) {
          const subcategory = await getEventSubcategory(event.event_type);
          weeklySpecialEvents.push({
            event_type: event.event_type,
            description: subcategory === 'bb_arena_winner' ? 'BB Arena Winner' : 'Jury Member',
            points_awarded: event.points_awarded
          });
        }
      }
    }

    const allSpecialEvents = [...contestantSpecialEvents, ...weeklySpecialEvents];

    // Calculate total points earned from all weekly and special events
    const weeklyPoints = weeklyEvents
      .filter(event => event.contestant_id === contestant.id)
      .reduce((sum, event) => sum + (event.points_awarded || 0), 0);
    
    const specialPoints = specialEvents
      .filter(event => event.contestant_id === contestant.id)
      .reduce((sum, event) => sum + (event.points_awarded || 0), 0);

    // Block survival points are now handled through special events, no need for manual calculation
    const totalPointsEarned = weeklyPoints + specialPoints;

    stats.push({
      contestant_name: contestant.name,
      total_points_earned: totalPointsEarned,
      weeks_active: contestant.isActive ? (weeklyEvents.filter(e => e.contestant_id === contestant.id).length || 0) : 0,
      hoh_wins: hohWins,
      veto_wins: vetoWins,
      times_on_block: timesOnBlock,
      times_on_block_at_eviction: timesOnBlockAtEviction,
      times_saved_by_veto: timesSavedByVeto,
      times_selected: timesSelected,
      elimination_week: eliminationWeek,
      group_name: group?.group_name,
      current_hoh: (contestant as any).current_hoh || false,
      current_pov_winner: (contestant as any).current_pov_winner || false,
      currently_nominated: (contestant as any).currently_nominated || false,
      pov_used_on: (contestant as any).pov_used_on || false,
      final_placement: (contestant as any).final_placement,
      americas_favorite: (contestant as any).americas_favorite || false,
      special_events: allSpecialEvents
    });
  }

  // Sort by total points earned (descending)
  stats.sort((a, b) => b.total_points_earned - a.total_points_earned);
  return stats;
};