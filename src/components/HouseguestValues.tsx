import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Crown, Key, Target, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Contestant, ContestantGroup } from '@/types/pool';
import { SpecialEventsBadge } from '@/components/admin/SpecialEventsBadge';
import { useActiveContestants } from '@/hooks/useActiveContestants';

interface HouseguestStats {
  houseguest_name: string;
  total_points_earned: number;
  weeks_active: number;
  hoh_wins: number;
  veto_wins: number;
  times_on_block_at_eviction: number;
  times_saved_by_veto: number;
  prizes_won: number;
  punishments: number;
  times_selected: number;
  elimination_week?: number;
  group_name?: string;
  current_hoh?: boolean;
  current_pov_winner?: boolean;
  currently_nominated?: boolean;
  pov_used_on?: boolean;
  final_placement?: number;
  americas_favorite?: boolean;
  special_events?: Array<{
    event_type: string;
    description?: string;
    points_awarded?: number;
  }>;
}

export const HouseguestValues: React.FC = () => {
  const [houseguests, setHouseguests] = useState<Contestant[]>([]);
  const [houseguestGroups, setHouseguestGroups] = useState<ContestantGroup[]>([]);
  const [houseguestStats, setHouseguestStats] = useState<HouseguestStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { evictedContestants } = useActiveContestants();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [houseguestsResult, groupsResult, poolEntriesResult, weeklyEventsResult, specialEventsResult, weeklyResultsResult] = await Promise.all([
        supabase.from('contestants').select('*').order('sort_order'),
        supabase.from('contestant_groups').select('*').order('sort_order'),
        supabase.from('pool_entries').select('*'),
        supabase.from('weekly_events').select('*'),
        supabase.from('special_events').select('*'),
        supabase.from('weekly_results').select('*').eq('is_draft', false).order('week_number', { ascending: false }).limit(1)
      ]);

      if (houseguestsResult.error) throw houseguestsResult.error;
      if (groupsResult.error) throw groupsResult.error;
      if (poolEntriesResult.error) throw poolEntriesResult.error;
      if (weeklyEventsResult.error) throw weeklyEventsResult.error;
      if (specialEventsResult.error) throw specialEventsResult.error;
      if (weeklyResultsResult.error) throw weeklyResultsResult.error;

      const latestCompletedWeek = weeklyResultsResult.data?.[0];

      // Map houseguests to match our type interface
      const mappedHouseguests = (houseguestsResult.data || []).map(c => ({
        ...c,
        isActive: !evictedContestants.includes(c.name) // Determine based on eviction status
      }));
      
      setHouseguests(mappedHouseguests);
      setHouseguestGroups(groupsResult.data || []);

      // Calculate houseguest statistics
      const stats: HouseguestStats[] = mappedHouseguests.map(houseguest => {
        const group = (groupsResult.data || []).find(g => g.id === houseguest.group_id);
        
        // Count how many times this houseguest was selected
        const timesSelected = (poolEntriesResult.data || []).reduce((count, entry) => {
          const players = [entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5];
          return count + (players.includes(houseguest.name) ? 1 : 0);
        }, 0);

        // Count HOH wins
        const hohWins = (weeklyEventsResult.data || []).filter(event => 
          event.contestant_id === houseguest.id && event.event_type === 'hoh_winner'
        ).length;

        // Count Veto wins
        const vetoWins = (weeklyEventsResult.data || []).filter(event => 
          event.contestant_id === houseguest.id && event.event_type === 'pov_winner'
        ).length;

        // Count times on block at eviction (different from initial nominations)
        const timesOnBlockAtEviction = houseguest.times_on_block_at_eviction || 0;

        // Count times saved by veto
        const timesSavedByVeto = houseguest.times_saved_by_veto || 0;

        // Count prizes
        const prizesWon = (specialEventsResult.data || []).filter(event => 
          event.contestant_id === houseguest.id && event.event_type.includes('prize')
        ).length;

        // Count punishments
        const punishments = (specialEventsResult.data || []).filter(event => 
          event.contestant_id === houseguest.id && event.event_type.includes('punishment')
        ).length;

        // Find elimination week
        const evictionEvent = (weeklyEventsResult.data || []).find(event => 
          event.contestant_id === houseguest.id && event.event_type === 'evicted'
        );
        const eliminationWeek = evictionEvent ? evictionEvent.week_number : undefined;

        // Calculate total points earned from all weekly and special events
        const weeklyPoints = (weeklyEventsResult.data || [])
          .filter(event => event.contestant_id === houseguest.id)
          .reduce((sum, event) => sum + (event.points_awarded || 0), 0);
        
        const specialPoints = (specialEventsResult.data || [])
          .filter(event => event.contestant_id === houseguest.id)
          .reduce((sum, event) => sum + (event.points_awarded || 0), 0);

        const totalPointsEarned = weeklyPoints + specialPoints;

        // Get special events for this houseguest
        const houseguestSpecialEvents = (specialEventsResult.data || [])
          .filter(event => event.contestant_id === houseguest.id)
          .map(event => ({
            event_type: event.event_type,
            description: event.description,
            points_awarded: event.points_awarded
          }));

        // Determine if contestant is evicted based on weekly events (dynamic status)
        const isEvicted = (weeklyEventsResult.data || []).some(event => 
          event.contestant_id === houseguest.id && event.event_type === 'evicted'
        );

        // Determine current status based on latest completed week
        let currentStatus = {
          current_hoh: false,
          current_pov_winner: false,
          currently_nominated: false,
          pov_used_on: false
        };

        if (latestCompletedWeek && !isEvicted) {
          currentStatus = {
            current_hoh: latestCompletedWeek.hoh_winner === houseguest.name,
            current_pov_winner: latestCompletedWeek.pov_winner === houseguest.name,
            currently_nominated: (latestCompletedWeek.nominees || []).includes(houseguest.name),
            pov_used_on: latestCompletedWeek.pov_used_on === houseguest.name
          };
        }

        return {
          houseguest_name: houseguest.name,
          total_points_earned: totalPointsEarned,
          weeks_active: houseguest.isActive ? (weeklyEventsResult.data?.filter(e => e.contestant_id === houseguest.id).length || 0) : 0,
          hoh_wins: hohWins,
          veto_wins: vetoWins,
          times_on_block_at_eviction: timesOnBlockAtEviction,
          times_saved_by_veto: timesSavedByVeto,
          prizes_won: prizesWon,
          punishments: punishments,
          times_selected: timesSelected,
          elimination_week: eliminationWeek,
          group_name: group?.group_name,
          ...currentStatus,
          final_placement: houseguest.final_placement,
          americas_favorite: houseguest.americas_favorite,
          special_events: houseguestSpecialEvents
        };
      });

      // Sort by: Active players first (by points), then evicted players (first evicted last)
      stats.sort((a, b) => {
        const aEvicted = !!a.elimination_week;
        const bEvicted = !!b.elimination_week;
        
        if (!aEvicted && bEvicted) return -1; // Active first
        if (aEvicted && !bEvicted) return 1;  // Evicted last
        if (!aEvicted && !bEvicted) return b.total_points_earned - a.total_points_earned; // Active by points
        
        // For evicted, first evicted goes to bottom
        return (a.elimination_week || 0) - (b.elimination_week || 0);
      });
      setHouseguestStats(stats);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading houseguest values...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Houseguest Performance & Values</CardTitle>
          <p className="text-sm text-gray-600">
            Track how each houseguest is performing and their fantasy value
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Houseguest</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>HOH Wins</TableHead>
                  <TableHead>Veto Wins</TableHead>
                  <TableHead>Block at Eviction</TableHead>
                  <TableHead>Saved by Veto</TableHead>
                  <TableHead>Prizes</TableHead>
                  <TableHead>Punishments</TableHead>
                  <TableHead>Special Events</TableHead>
                  <TableHead>Times Selected</TableHead>
                  <TableHead className="font-bold text-green-600">Points Earned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {houseguestStats.map((stat, index) => {
                  const houseguest = houseguests.find(c => c.name === stat.houseguest_name);
                  
                  return (
                    <TableRow key={stat.houseguest_name}>
                      <TableCell className="font-bold">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {stat.houseguest_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {stat.group_name}
                        </Badge>
                      </TableCell>
                       <TableCell>
                         <div className="flex flex-wrap gap-1">
                           {!houseguestStats.find(s => s.houseguest_name === houseguest?.name)?.elimination_week ? (
                             <>
                               <Badge variant="default">Active</Badge>
                               {stat.current_hoh && (
                                 <Badge variant="secondary" className="flex items-center gap-1">
                                   <Crown className="h-3 w-3" />
                                   HoH
                                 </Badge>
                               )}
                               {stat.current_pov_winner && (
                                 <Badge variant="secondary" className="flex items-center gap-1">
                                   <Key className="h-3 w-3" />
                                   Veto
                                 </Badge>
                               )}
                               {stat.currently_nominated && (
                                 <Badge variant="destructive" className="flex items-center gap-1">
                                   <Target className="h-3 w-3" />
                                   Nominee
                                 </Badge>
                               )}
                               {stat.pov_used_on && (
                                 <Badge variant="outline" className="flex items-center gap-1">
                                   <Shield className="h-3 w-3" />
                                   Saved
                                 </Badge>
                               )}
                             </>
                           ) : (
                             <>
                               <Badge variant="destructive">
                                 {stat.elimination_week ? `Evicted - Week ${stat.elimination_week}` : "Evicted"}
                               </Badge>
                               {stat.final_placement && (
                                 <Badge variant="outline">
                                   {stat.final_placement === 1 ? "Winner" : 
                                    stat.final_placement === 2 ? "Runner-up" :
                                    `${stat.final_placement}th Place`}
                                 </Badge>
                               )}
                               {stat.americas_favorite && (
                                 <Badge variant="secondary">AFP</Badge>
                               )}
                             </>
                           )}
                         </div>
                       </TableCell>
                      <TableCell className="text-center">
                        {stat.hoh_wins}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.veto_wins}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.times_on_block_at_eviction}
                        {stat.times_on_block_at_eviction >= 2 && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            +3pts
                          </Badge>
                        )}
                        {stat.times_on_block_at_eviction >= 4 && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            +5pts
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.times_saved_by_veto}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.prizes_won}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.punishments}
                      </TableCell>
                      <TableCell>
                        {stat.special_events && stat.special_events.length > 0 ? (
                          <SpecialEventsBadge events={stat.special_events} />
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.times_selected}
                      </TableCell>
                      <TableCell className="text-center font-bold text-green-600">
                        {stat.total_points_earned}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Houseguest Groups Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Houseguest Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {houseguestGroups.map(group => {
              const groupHouseguests = houseguests.filter(c => c.group_id === group.id);
              const activeCount = groupHouseguests.filter(c => !evictedContestants.includes(c.name)).length;
              
              return (
                <div key={group.id} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{group.group_name}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {activeCount} of {groupHouseguests.length} still active
                  </p>
                  <div className="space-y-1">
                    {groupHouseguests.map(houseguest => {
                      const isEvicted = evictedContestants.includes(houseguest.name);
                      return (
                        <div key={houseguest.id} className="flex justify-between items-center">
                          <span className={isEvicted ? 'line-through text-gray-400' : ''}>
                            {houseguest.name}
                          </span>
                          <Badge variant={isEvicted ? "destructive" : "default"} className="text-xs">
                            {isEvicted ? "Out" : "Active"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};