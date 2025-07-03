import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry } from '@/types/pool';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';
import { usePointsCalculation } from '@/hooks/usePointsCalculation';

export const TeamLeaderboard: React.FC = () => {
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { houseguestPoints } = useHouseguestPoints();
  const { recalculateAllPoints, recalculating } = usePointsCalculation();

  useEffect(() => {
    loadPoolEntries();
  }, []);

  const loadPoolEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('pool_entries')
        .select('*')
        .order('total_points', { ascending: false });

      if (error) throw error;
      
      const mappedEntries = data?.map(entry => {
        // Validate that total_points equals weekly_points + bonus_points
        const calculatedTotal = (entry.weekly_points || 0) + (entry.bonus_points || 0);
        if (calculatedTotal !== entry.total_points) {
          console.warn(`Points mismatch for ${entry.team_name}: 
            Weekly: ${entry.weekly_points}, 
            Bonus: ${entry.bonus_points}, 
            Total: ${entry.total_points}, 
            Expected: ${calculatedTotal}`);
        }
        
        return {
          ...entry,
          bonus_answers: entry.bonus_answers as Record<string, any>,
          created_at: new Date(entry.created_at),
          updated_at: new Date(entry.updated_at)
        };
      }) || [];
      
      setPoolEntries(mappedEntries);
    } catch (error) {
      console.error('Error loading pool entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculatePoints = async () => {
    await recalculateAllPoints();
    await loadPoolEntries(); // Reload data after recalculation
  };

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
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
            </div>
          </div>
          <Button 
            onClick={handleRecalculatePoints}
            disabled={recalculating}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Recalculating...' : 'Recalculate Points'}
          </Button>
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
                <TableHead className="font-bold">Player 1</TableHead>
                <TableHead className="font-bold">Player 2</TableHead>
                <TableHead className="font-bold">Player 3</TableHead>
                <TableHead className="font-bold">Player 4</TableHead>
                <TableHead className="font-bold">Player 5</TableHead>
                <TableHead className="font-bold text-center">Weekly Pts</TableHead>
                <TableHead className="font-bold text-center">Bonus Pts</TableHead>
                <TableHead className="font-bold text-center bg-yellow-100">Total</TableHead>
                <TableHead className="font-bold text-center">Payment</TableHead>
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
                  <TableCell>{entry.player_1} {houseguestPoints[entry.player_1] !== undefined && `(${houseguestPoints[entry.player_1]} pts)`}</TableCell>
                  <TableCell>{entry.player_2} {houseguestPoints[entry.player_2] !== undefined && `(${houseguestPoints[entry.player_2]} pts)`}</TableCell>
                  <TableCell>{entry.player_3} {houseguestPoints[entry.player_3] !== undefined && `(${houseguestPoints[entry.player_3]} pts)`}</TableCell>
                  <TableCell>{entry.player_4} {houseguestPoints[entry.player_4] !== undefined && `(${houseguestPoints[entry.player_4]} pts)`}</TableCell>
                  <TableCell>{entry.player_5} {houseguestPoints[entry.player_5] !== undefined && `(${houseguestPoints[entry.player_5]} pts)`}</TableCell>
                  <TableCell className="text-center">{entry.weekly_points}</TableCell>
                  <TableCell className="text-center">{entry.bonus_points}</TableCell>
                  <TableCell className="text-center font-bold text-lg bg-yellow-100">
                    {entry.total_points}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={entry.payment_confirmed ? "default" : "destructive"}>
                      {entry.payment_confirmed ? "✓" : "Pending"}
                    </Badge>
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