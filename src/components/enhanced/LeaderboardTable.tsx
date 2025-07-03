import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LeaderboardRow } from './LeaderboardRow';

interface LeaderboardTableProps {
  displayData: any[];
  showHistoricalColumns: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  displayData,
  showHistoricalColumns
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-bold">Rank</TableHead>
            {showHistoricalColumns && <TableHead className="font-bold text-center">Rank Δ</TableHead>}
            <TableHead className="font-bold">Team Name</TableHead>
            <TableHead className="font-bold">Participant</TableHead>
            <TableHead className="font-bold">Player 1</TableHead>
            <TableHead className="font-bold">Player 2</TableHead>
            <TableHead className="font-bold">Player 3</TableHead>
            <TableHead className="font-bold">Player 4</TableHead>
            <TableHead className="font-bold">Player 5</TableHead>
            <TableHead className="font-bold text-center">Weekly Pts</TableHead>
            {showHistoricalColumns && <TableHead className="font-bold text-center">Pts Δ</TableHead>}
            <TableHead className="font-bold text-center">Bonus Pts</TableHead>
            <TableHead className="font-bold text-center bg-yellow-100">Total</TableHead>
            <TableHead className="font-bold text-center">Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              index={index}
              showHistoricalColumns={showHistoricalColumns}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};