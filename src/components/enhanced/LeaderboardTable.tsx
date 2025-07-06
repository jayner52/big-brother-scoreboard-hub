import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LeaderboardRow } from './LeaderboardRow';

interface LeaderboardTableProps {
  displayData: any[];
  showHistoricalColumns: boolean;
  selectedWeek?: number | null;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  displayData,
  showHistoricalColumns,
  selectedWeek
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="w-16 text-center font-bold">Rank</TableHead>
            {showHistoricalColumns && <TableHead className="w-20 text-center font-bold">Rank Δ</TableHead>}
            <TableHead className="w-48 font-bold">Team Name</TableHead>
            <TableHead className="w-32 font-bold">Participant</TableHead>
            <TableHead className="flex-1 font-bold">Houseguests</TableHead>
            <TableHead className="w-20 text-center font-bold">Weekly</TableHead>
            {showHistoricalColumns && <TableHead className="w-20 text-center font-bold">Week Δ</TableHead>}
            <TableHead className="w-20 text-center font-bold">Bonus</TableHead>
            <TableHead className="w-24 text-center font-bold bg-gradient-to-r from-yellow-100 to-yellow-200">Total</TableHead>
            <TableHead className="w-20 text-center font-bold">Δ</TableHead>
            <TableHead className="w-20 text-center font-bold">Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              index={index}
              showHistoricalColumns={showHistoricalColumns}
              selectedWeek={selectedWeek}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};