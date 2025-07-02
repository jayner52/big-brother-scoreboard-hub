
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePool } from '@/contexts/PoolContext';

export const PoolTable: React.FC = () => {
  const { poolEntries, scoringRules } = usePool();

  // Sort entries by total score (descending)
  const sortedEntries = [...poolEntries].sort((a, b) => b.scores.total - a.scores.total);

  if (poolEntries.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-gray-500">No Pool Entries Yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-400">Be the first to join the pool above!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Live Pool Standings</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2 text-sm">
          <Badge variant="secondary" className="bg-white/20">HOH: {scoringRules.hoh} pts</Badge>
          <Badge variant="secondary" className="bg-white/20">POV: {scoringRules.pov} pts</Badge>
          <Badge variant="secondary" className="bg-white/20">Evicted: {scoringRules.evicted} pts</Badge>
          <Badge variant="secondary" className="bg-white/20">Bonus: {scoringRules.bonus} pts</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold">Rank</TableHead>
                <TableHead className="font-bold">Participant</TableHead>
                <TableHead className="font-bold">Winner Pick</TableHead>
                <TableHead className="font-bold">First Evicted</TableHead>
                <TableHead className="font-bold">Week 1 HOH</TableHead>
                <TableHead className="font-bold">Week 1 POV</TableHead>
                <TableHead className="font-bold">Week 2 Evicted</TableHead>
                <TableHead className="font-bold text-center">HOH Pts</TableHead>
                <TableHead className="font-bold text-center">POV Pts</TableHead>
                <TableHead className="font-bold text-center">Evicted Pts</TableHead>
                <TableHead className="font-bold text-center">Bonus Pts</TableHead>
                <TableHead className="font-bold text-center bg-yellow-100">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.map((entry, index) => (
                <TableRow key={entry.id} className={index === 0 ? "bg-yellow-50" : index % 2 === 0 ? "bg-gray-50" : ""}>
                  <TableCell className="font-bold">
                    {index === 0 ? "🏆" : index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-blue-600">{entry.participantName}</TableCell>
                  <TableCell>{entry.picks.winner}</TableCell>
                  <TableCell>{entry.picks.firstEvicted}</TableCell>
                  <TableCell>{entry.picks.week1HOH}</TableCell>
                  <TableCell>{entry.picks.week1POV}</TableCell>
                  <TableCell>{entry.picks.week2Evicted}</TableCell>
                  <TableCell className="text-center">{entry.scores.hohPoints}</TableCell>
                  <TableCell className="text-center">{entry.scores.povPoints}</TableCell>
                  <TableCell className="text-center">{entry.scores.evictedPoints}</TableCell>
                  <TableCell className="text-center">{entry.scores.bonusPoints}</TableCell>
                  <TableCell className="text-center font-bold text-lg bg-yellow-100">
                    {entry.scores.total}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
