import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';
import { useSimpleLeaderboard } from '@/hooks/useSimpleLeaderboard';
import { usePool } from '@/contexts/PoolContext';


export const TeamLeaderboard: React.FC = () => {
  const { activePool } = usePool();
  const { poolEntries, loading, error, reload } = useSimpleLeaderboard();
  const { houseguestPoints } = useHouseguestPoints();

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (poolEntries.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-gray-500">No Teams Yet</CardTitle>
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
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Team Leaderboard</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2 text-sm">
              <Badge variant="secondary" className="bg-white/20">Survival: 1 pt/week</Badge>
              <Badge variant="secondary" className="bg-white/20">HOH/POV: 3 pts each</Badge>
              <Badge variant="secondary" className="bg-white/20">Bonus: 5-10 pts</Badge>
              <Button 
                onClick={() => reload()} 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold">Rank</TableHead>
                <TableHead className="font-bold">Team Name</TableHead>
                <TableHead className="font-bold">Participant</TableHead>
                {Array.from({ length: activePool?.picks_per_team || 5 }, (_, i) => (
                  <TableHead key={i} className="font-bold">Player {i + 1}</TableHead>
                ))}
                <TableHead className="font-bold text-center">Weekly Pts</TableHead>
                <TableHead className="font-bold text-center">Bonus Pts</TableHead>
                <TableHead className="font-bold text-center bg-yellow-100">Total</TableHead>
                {activePool?.has_buy_in && (
                  <TableHead className="font-bold text-center">Payment</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {poolEntries.map((entry, index) => (
                <TableRow key={entry.id} className={index === 0 ? "bg-yellow-50" : index % 2 === 0 ? "bg-gray-50" : ""}>
                  <TableCell className="font-bold">
                    {index === 0 ? "🏆" : index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-blue-600">{entry.team_name}</TableCell>
                  <TableCell>{entry.participant_name}</TableCell>
                  {Array.from({ length: activePool?.picks_per_team || 5 }, (_, i) => {
                    const playerKey = `player_${i + 1}` as keyof typeof entry;
                    const playerName = entry[playerKey] as string;
                    return (
                      <TableCell key={i}>
                        {playerName} {houseguestPoints[playerName] !== undefined && `(${houseguestPoints[playerName]} pts)`}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">{entry.weekly_points}</TableCell>
                  <TableCell className="text-center">{entry.bonus_points}</TableCell>
                  <TableCell className="text-center font-bold text-lg bg-yellow-100">
                    {entry.total_points}
                  </TableCell>
                  {activePool?.has_buy_in && (
                    <TableCell className="text-center">
                      <Badge variant={entry.payment_confirmed ? "default" : "destructive"}>
                        {entry.payment_confirmed ? "✓" : "Pending"}
                      </Badge>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};