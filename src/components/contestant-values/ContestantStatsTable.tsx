import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Crown, Target, Shield } from 'lucide-react';
import { ContestantStats } from '@/types/contestant-stats';
import { Contestant } from '@/types/pool';
import { SpecialEventsBadges } from '@/components/admin/SpecialEventsBadges';
// REMOVED: useEvictionWeeks - eviction logic will be reimplemented from scratch

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
  // REMOVED: evictionWeeks - will be reimplemented from scratch
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
            const isEvicted = contestant && !contestant.isActive; // Use actual eviction status
            
            return (
              <TableRow key={stat.contestant_name}>
                <TableCell className="text-center font-bold">
                  {index + 1}
                </TableCell>
                <TableCell className={`text-center font-semibold ${isEvicted ? 'text-red-600 line-through' : ''}`}>
                  {stat.contestant_name}
                  {isEvicted && <span className="text-red-500 text-xs ml-1">(Evicted)</span>}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {stat.group_name}
                  </Badge>
                </TableCell>
                {showSpoilers && (
                  <TableCell>
                    <div className="flex flex-wrap gap-1 justify-center">
                      <Badge variant="default">Active</Badge>
                      {/* REMOVED: Eviction status and current game status - will be reimplemented */}
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