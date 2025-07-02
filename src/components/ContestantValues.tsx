import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Contestant, ContestantGroup } from '@/types/pool';

interface ContestantStats {
  contestant_name: string;
  total_points_earned: number;
  weeks_active: number;
  competitions_won: number;
  times_selected: number;
  group_name?: string;
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
      const [contestantsResult, groupsResult, poolEntriesResult, weeklyResultsResult] = await Promise.all([
        supabase.from('contestants').select('*').order('sort_order'),
        supabase.from('contestant_groups').select('*').order('sort_order'),
        supabase.from('pool_entries').select('*'),
        supabase.from('weekly_results').select('*')
      ]);

      if (contestantsResult.error) throw contestantsResult.error;
      if (groupsResult.error) throw groupsResult.error;
      if (poolEntriesResult.error) throw poolEntriesResult.error;
      if (weeklyResultsResult.error) throw weeklyResultsResult.error;

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

        // Count competitions won
        const competitionsWon = (weeklyResultsResult.data || []).reduce((count, week) => {
          return count + 
            (week.hoh_winner === contestant.name ? 1 : 0) +
            (week.pov_winner === contestant.name ? 1 : 0);
        }, 0);

        // Calculate estimated points (this would need real weekly scoring data)
        const totalPointsEarned = competitionsWon * 10; // Simplified calculation

        return {
          contestant_name: contestant.name,
          total_points_earned: totalPointsEarned,
          weeks_active: contestant.isActive ? (weeklyResultsResult.data?.length || 0) : 0,
          competitions_won: competitionsWon,
          times_selected: timesSelected,
          group_name: group?.group_name
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
                  <TableHead>Competitions Won</TableHead>
                  <TableHead>Times Selected</TableHead>
                  <TableHead>Fantasy Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contestantStats.map((stat, index) => {
                  const contestant = contestants.find(c => c.name === stat.contestant_name);
                  const fantasyValue = stat.times_selected > 0 ? 
                    (stat.total_points_earned / stat.times_selected).toFixed(1) : '0.0';
                  
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
                        <Badge variant={contestant?.isActive ? "default" : "destructive"}>
                          {contestant?.isActive ? "Active" : "Evicted"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {stat.total_points_earned}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.competitions_won}
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