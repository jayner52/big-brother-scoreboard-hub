import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contestant, ContestantGroup } from '@/types/pool';
import { ContestantStats } from '@/types/contestant-stats';
import { useActiveContestants } from './useActiveContestants';

export const useContestantStats = () => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [contestantGroups, setContestantGroups] = useState<ContestantGroup[]>([]);
  const [contestantStats, setContestantStats] = useState<ContestantStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { evictedContestants } = useActiveContestants();

  useEffect(() => {
    loadData();
  }, [evictedContestants]);

  const loadData = async () => {
    try {
      const [contestantsResult, groupsResult, poolEntriesResult, weeklyEventsResult, specialEventsResult] = await Promise.all([
        supabase.from('contestants').select('*').order('sort_order'),
        supabase.from('contestant_groups').select('*').order('sort_order'),
        supabase.from('pool_entries').select('*'),
        supabase.from('weekly_events').select('*'),
        supabase.from('special_events').select('*')
      ]);

      if (contestantsResult.error) throw contestantsResult.error;
      if (groupsResult.error) throw groupsResult.error;
      if (poolEntriesResult.error) throw poolEntriesResult.error;
      if (weeklyEventsResult.error) throw weeklyEventsResult.error;
      if (specialEventsResult.error) throw specialEventsResult.error;

      // Map contestants to match our type interface
      const mappedContestants = (contestantsResult.data || []).map(c => ({
        ...c,
        isActive: !evictedContestants.includes(c.name)
      }));
      
      setContestants(mappedContestants);
      setContestantGroups(groupsResult.data || []);

      // Calculate contestant statistics
      const stats: ContestantStats[] = mappedContestants.map(contestant => {
        const group = (groupsResult.data || []).find(g => g.id === contestant.group_id);
        
        // Count how many times this contestant was selected
        const timesSelected = (poolEntriesResult.data || []).reduce((count, entry) => {
          const players = [entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5];
          return count + (players.includes(contestant.name) ? 1 : 0);
        }, 0);

        // Count HOH wins
        const hohWins = (weeklyEventsResult.data || []).filter(event => 
          event.contestant_id === contestant.id && event.event_type === 'hoh_winner'
        ).length;

        // Count Veto wins
        const vetoWins = (weeklyEventsResult.data || []).filter(event => 
          event.contestant_id === contestant.id && event.event_type === 'pov_winner'
        ).length;

        // Count times on block (nominations) - use correct event type
        const timesOnBlock = (weeklyEventsResult.data || []).filter(event => 
          event.contestant_id === contestant.id && event.event_type === 'nominee'
        ).length;

        // Count times on block at eviction - calculate from weekly events
        const nomineeEvents = (weeklyEventsResult.data || []).filter(event => 
          event.contestant_id === contestant.id && event.event_type === 'nominee'
        );
        const evictionEvents = (weeklyEventsResult.data || []).filter(event => 
          event.contestant_id === contestant.id && event.event_type === 'evicted'
        );
        
        // Count nominees who were evicted in the same week they were nominated
        const timesOnBlockAtEviction = nomineeEvents.filter(nomEvent => 
          evictionEvents.some(evictEvent => evictEvent.week_number === nomEvent.week_number)
        ).length;

        // Count times saved by veto - calculate from weekly events
        const timesSavedByVeto = (weeklyEventsResult.data || []).filter(event => 
          event.contestant_id === contestant.id && event.event_type === 'pov_used_on'
        ).length;

        // Find elimination week
        const evictionEvent = (weeklyEventsResult.data || []).find(event => 
          event.contestant_id === contestant.id && event.event_type === 'evicted'
        );
        const eliminationWeek = evictionEvent ? evictionEvent.week_number : undefined;

        // Get all special events for this contestant from both tables
        const contestantSpecialEvents = (specialEventsResult.data || [])
          .filter(event => event.contestant_id === contestant.id)
          .map(event => ({
            event_type: event.event_type,
            description: event.description,
            points_awarded: event.points_awarded
          }));

        // Include relevant weekly events as special events for display
        const weeklySpecialEvents = (weeklyEventsResult.data || [])
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
        const weeklyPoints = (weeklyEventsResult.data || [])
          .filter(event => event.contestant_id === contestant.id)
          .reduce((sum, event) => sum + (event.points_awarded || 0), 0);
        
        const specialPoints = (specialEventsResult.data || [])
          .filter(event => event.contestant_id === contestant.id)
          .reduce((sum, event) => sum + (event.points_awarded || 0), 0);

        const totalPointsEarned = weeklyPoints + specialPoints;

        return {
          contestant_name: contestant.name,
          total_points_earned: totalPointsEarned,
          weeks_active: contestant.isActive ? (weeklyEventsResult.data?.filter(e => e.contestant_id === contestant.id).length || 0) : 0,
          hoh_wins: hohWins,
          veto_wins: vetoWins,
          times_on_block: timesOnBlock,
          times_on_block_at_eviction: timesOnBlockAtEviction,
          times_saved_by_veto: timesSavedByVeto,
          times_selected: timesSelected,
          elimination_week: eliminationWeek,
          group_name: group?.group_name,
          current_hoh: contestant.current_hoh,
          current_pov_winner: contestant.current_pov_winner,
          currently_nominated: contestant.currently_nominated,
          pov_used_on: contestant.pov_used_on,
          final_placement: contestant.final_placement,
          americas_favorite: contestant.americas_favorite,
          special_events: allSpecialEvents
        };
      });

      // Sort by total points earned (descending)
      stats.sort((a, b) => b.total_points_earned - a.total_points_earned);
      setContestantStats(stats);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    contestants,
    contestantGroups,
    contestantStats,
    loading
  };
};