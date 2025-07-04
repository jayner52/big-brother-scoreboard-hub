import { ContestantStats } from '@/types/contestant-stats';
import { Contestant, ContestantGroup } from '@/types/pool';
import { calculateBlockSurvivalStats } from './blockSurvivalUtils';

export const calculateContestantStats = (
  contestants: Contestant[],
  contestantGroups: ContestantGroup[],
  poolEntries: any[],
  weeklyEvents: any[],
  specialEvents: any[],
  evictedContestants: string[],
  currentGameWeek: number = 7
): ContestantStats[] => {
  // Determine who is evicted based on current game week
  const evictedThisGameWeek = weeklyEvents
    .filter(event => event.event_type === 'evicted' && event.week_number < currentGameWeek)
    .map(event => {
      const contestant = contestants.find(c => c.id === event.contestant_id);
      return contestant?.name;
    })
    .filter(Boolean);

  const mappedContestants = contestants.map(c => ({
    ...c,
    isActive: !evictedThisGameWeek.includes(c.name)
  }));

  const stats: ContestantStats[] = mappedContestants.map(contestant => {
    const group = contestantGroups.find(g => g.id === contestant.group_id);
    
    // Count how many times this contestant was selected
    const timesSelected = poolEntries.reduce((count, entry) => {
      const players = [entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5];
      return count + (players.includes(contestant.name) ? 1 : 0);
    }, 0);

    // Count HOH wins
    const hohWins = weeklyEvents.filter(event => 
      event.contestant_id === contestant.id && event.event_type === 'hoh_winner'
    ).length;

    // Count Veto wins
    const vetoWins = weeklyEvents.filter(event => 
      event.contestant_id === contestant.id && event.event_type === 'pov_winner'
    ).length;

    // Count times on block (nominations)
    const timesOnBlock = weeklyEvents.filter(event => 
      event.contestant_id === contestant.id && event.event_type === 'nominee'
    ).length;

    // Count times on block at eviction and survived
    const timesOnBlockAtEviction = calculateBlockSurvivalStats(contestant.id, weeklyEvents);

    // Count times saved by veto
    const timesSavedByVeto = weeklyEvents.filter(event => 
      event.contestant_id === contestant.id && event.event_type === 'pov_used_on'
    ).length;

    // Find elimination week
    const evictionEvent = weeklyEvents.find(event => 
      event.contestant_id === contestant.id && event.event_type === 'evicted'
    );
    const eliminationWeek = evictionEvent ? evictionEvent.week_number : undefined;

    // Get all special events for this contestant
    const contestantSpecialEvents = specialEvents
      .filter(event => event.contestant_id === contestant.id)
      .map(event => ({
        event_type: event.event_type,
        description: event.description,
        points_awarded: event.points_awarded
      }));

    // Include relevant weekly events as special events for display
    const weeklySpecialEvents = weeklyEvents
      .filter(event => 
        event.contestant_id === contestant.id && 
        ['bb_arena_winner', 'jury_member'].includes(event.event_type)
      )
      .map(event => ({
        event_type: event.event_type,
        description: event.event_type === 'bb_arena_winner' ? 'BB Arena Winner' : 'Jury Member',
        points_awarded: event.points_awarded
      }));

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

    return {
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
    };
  });

  // Sort by total points earned (descending)
  stats.sort((a, b) => b.total_points_earned - a.total_points_earned);
  return stats;
};