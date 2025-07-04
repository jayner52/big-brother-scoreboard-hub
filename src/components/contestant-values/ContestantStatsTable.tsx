import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Crown, Target, Shield } from 'lucide-react';
import { ContestantStats } from '@/types/contestant-stats';
import { Contestant } from '@/types/pool';
import { SpecialEventsBadges } from '@/components/admin/SpecialEventsBadges';

interface ContestantStatsTableProps {
  contestantStats: ContestantStats[];
  contestants: Contestant[];
  showSpoilers: boolean;
  hohWinner: string | null;
  povWinner: string | null;
  nominees: string[];
}

export const ContestantStatsTable: React.FC<ContestantStatsTableProps> = ({
  contestantStats,
  contestants,
  showSpoilers,
  hohWinner,
  povWinner,
  nominees,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Contestant</TableHead>
            <TableHead>Group</TableHead>
            {showSpoilers && <TableHead>Status</TableHead>}
            <TableHead>Points Earned</TableHead>
            <TableHead>HOH Wins</TableHead>
            <TableHead>Veto Wins</TableHead>
            <TableHead>Survived the Eviction Vote</TableHead>
            <TableHead>Times Saved by Veto</TableHead>
            <TableHead>Special Events</TableHead>
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
                {showSpoilers && (
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contestant?.isActive ? (
                        <>
                          <Badge variant="default">Active</Badge>
                          {hohWinner === stat.contestant_name && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Crown className="h-3 w-3" />
                              HOH
                            </Badge>
                          )}
                          {povWinner === stat.contestant_name && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              POV
                            </Badge>
                          )}
                          {nominees.includes(stat.contestant_name) && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Nominated
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
                )}
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
                  {stat.times_on_block_at_eviction}
                </TableCell>
                <TableCell className="text-center">
                  {stat.times_saved_by_veto}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <SpecialEventsBadges events={stat.special_events} />
                    {stat.times_on_block_at_eviction >= 4 && <span title="4+ Block Survivals">🏰💪</span>}
                    {stat.times_on_block_at_eviction >= 2 && stat.times_on_block_at_eviction < 4 && <span title="2+ Block Survivals">💪</span>}
                  </div>
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
  );
};