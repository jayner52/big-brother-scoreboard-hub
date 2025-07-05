import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Crown, Target, Shield } from 'lucide-react';
import { ContestantStats } from '@/types/contestant-stats';
import { Contestant } from '@/types/pool';
import { SpecialEventsBadges } from '@/components/admin/SpecialEventsBadges';
import { useEvictedContestants } from '@/hooks/useEvictedContestants';
import { useEvictionWeeks } from '@/hooks/useEvictionWeeks';

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
  const { evictedContestants } = useEvictedContestants();
  const { evictionWeeks } = useEvictionWeeks();
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Rank</TableHead>
            <TableHead className="text-center">Contestant</TableHead>
            <TableHead className="text-center w-24">Group</TableHead>
            {showSpoilers && <TableHead className="text-center">Status</TableHead>}
            <TableHead className="text-center w-20">HOH Wins</TableHead>
            <TableHead className="text-center w-20">Veto Wins</TableHead>
            <TableHead className="text-center w-20">Survived Eviction</TableHead>
            <TableHead className="text-center w-20">Saved by Veto</TableHead>
            <TableHead className="text-center">Special Events</TableHead>
            <TableHead className="text-center">Times Selected</TableHead>
            <TableHead className="text-center w-24">Total Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {contestantStats.map((stat, index) => {
            const contestant = contestants.find(c => c.name === stat.contestant_name);
            const isEvicted = evictedContestants.includes(stat.contestant_name);
            
            return (
              <TableRow key={stat.contestant_name}>
                <TableCell className="text-center font-bold">
                  {index + 1}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {stat.contestant_name}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {stat.group_name}
                  </Badge>
                </TableCell>
                {showSpoilers && (
                  <TableCell>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {!isEvicted ? (
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
                            {evictionWeeks[stat.contestant_name] ? `Evicted - Week ${evictionWeeks[stat.contestant_name]}` : "Evicted"}
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
                  </div>
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
  );
};