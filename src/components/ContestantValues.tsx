import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Crown, Key, Target, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Contestant, ContestantGroup } from '@/types/pool';

interface ContestantStats {
  contestant_name: string;
  total_points_earned: number;
  weeks_active: number;
  hoh_wins: number;
  veto_wins: number;
  times_on_block: number;
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
}

export const ContestantValues: React.FC = () => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [contestantGroups, setContestantGroups] = useState<ContestantGroup[]>([]);
  const [contestantStats, setContestantStats] = useState<ContestantStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
        isActive: c.is_active
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

        // Count times on block (nominations)
        const timesOnBlock = (weeklyEventsResult.data || []).filter(event => 
          event.contestant_id === contestant.id && event.event_type === 'nominated'
        ).length;

        // Count prizes
        const prizesWon = (specialEventsResult.data || []).filter(event => 
          event.contestant_id === contestant.id && event.event_type.includes('prize')
        ).length;

        // Count punishments
        const punishments = (specialEventsResult.data || []).filter(event => 
          event.contestant_id === contestant.id && event.event_type.includes('punishment')
        ).length;

        // Find elimination week
        const evictionEvent = (weeklyEventsResult.data || []).find(event => 
          event.contestant_id === contestant.id && event.event_type === 'evicted'
        );
        const eliminationWeek = evictionEvent ? evictionEvent.week_number : undefined;

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
          prizes_won: prizesWon,
          punishments: punishments,
          times_selected: timesSelected,
          elimination_week: eliminationWeek,
          group_name: group?.group_name,
          current_hoh: contestant.current_hoh,
          current_pov_winner: contestant.current_pov_winner,
          currently_nominated: contestant.currently_nominated,
          pov_used_on: contestant.pov_used_on,
          final_placement: contestant.final_placement,
          americas_favorite: contestant.americas_favorite
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

  if (loading) {
    return <div className="text-center py-8">Loading contestant values...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contestant Performance & Values</CardTitle>
          <p className="text-sm text-gray-600">
            Track how each contestant is performing and their fantasy value
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Contestant</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Points Earned</TableHead>
                  <TableHead>HOH Wins</TableHead>
                  <TableHead>Veto Wins</TableHead>
                  <TableHead>Times on Block</TableHead>
                  <TableHead>Prizes</TableHead>
                  <TableHead>Punishments</TableHead>
                  <TableHead>Times Selected</TableHead>
                  <TableHead>Fantasy Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contestantStats.map((stat, index) => {
                  const contestant = contestants.find(c => c.name === stat.contestant_name);
                  const fantasyValue = stat.times_selected > 0 ? 
                    Math.round(stat.total_points_earned / stat.times_selected).toString() : '0';
                  
                  return (
                    <TableRow key={stat.contestant_name}>
                      <TableCell className="font-bold">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {stat.contestant_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {stat.group_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contestant?.isActive ? (
                            <>
                              <Badge variant="default">Active</Badge>
                              {stat.current_hoh && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Crown className="h-3 w-3" />
                                  HOH
                                </Badge>
                              )}
                              {stat.current_pov_winner && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Key className="h-3 w-3" />
                                  POV
                                </Badge>
                              )}
                              {stat.currently_nominated && (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  Nominated
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
                      <TableCell className="text-center font-bold">
                        {stat.total_points_earned}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.hoh_wins}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.veto_wins}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.times_on_block}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.prizes_won}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.punishments}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.times_selected}
                      </TableCell>
                      <TableCell className="text-center font-bold text-green-600">
                        {fantasyValue} pts/pick
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Contestant Groups Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Contestant Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contestantGroups.map(group => {
              const groupContestants = contestants.filter(c => c.group_id === group.id);
              const activeCount = groupContestants.filter(c => c.isActive).length;
              
              return (
                <div key={group.id} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{group.group_name}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {activeCount} of {groupContestants.length} still active
                  </p>
                  <div className="space-y-1">
                    {groupContestants.map(contestant => (
                      <div key={contestant.id} className="flex justify-between items-center">
                        <span className={contestant.isActive ? '' : 'line-through text-gray-400'}>
                          {contestant.name}
                        </span>
                        <Badge variant={contestant.isActive ? "default" : "destructive"} className="text-xs">
                          {contestant.isActive ? "Active" : "Out"}
                        </Badge>
                      </div>
                    ))}
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