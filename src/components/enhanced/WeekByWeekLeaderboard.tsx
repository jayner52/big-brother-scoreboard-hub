import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';

interface WeeklyScore {
  week: number;
  points: number;
  rank: number;
  rankChange: number;
}

interface PlayerWeeklyData {
  id: string;
  participant_name: string;
  team_name: string;
  payment_confirmed: boolean;
  weeklyScores: Record<number, WeeklyScore>;
  currentTotal: number;
  currentRank: number;
}

interface WeekByWeekLeaderboardProps {
  viewMode: 'points' | 'cumulative';
  onViewModeChange: (mode: 'points' | 'cumulative') => void;
}

export const WeekByWeekLeaderboard: React.FC<WeekByWeekLeaderboardProps> = ({
  viewMode,
  onViewModeChange
}) => {
  const { activePool } = usePool();
  const [loading, setLoading] = useState(true);
  const [playersData, setPlayersData] = useState<PlayerWeeklyData[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [sortColumn, setSortColumn] = useState<number | 'total' | 'name'>('total');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (activePool?.id) {
      fetchWeeklyData();
    }
  }, [activePool?.id]);

  const fetchWeeklyData = async () => {
    if (!activePool?.id) return;

    try {
      setLoading(true);
      console.log('🔍 WeekByWeek - Fetching data for pool:', activePool.id);

      // Get all weekly snapshots for this pool
      const { data: snapshots, error: snapshotsError } = await supabase
        .from('weekly_team_snapshots')
        .select('*')
        .eq('pool_id', activePool.id)
        .order('week_number', { ascending: true });

      if (snapshotsError) throw snapshotsError;

      console.log('🔍 WeekByWeek - Raw snapshots:', snapshots);

      // Get current pool entries for team names and participant info
      const { data: entries, error: entriesError } = await supabase
        .from('pool_entries')
        .select('*')
        .eq('pool_id', activePool.id);

      if (entriesError) throw entriesError;

      if (!snapshots || !entries) {
        setPlayersData([]);
        setAvailableWeeks([]);
        return;
      }

      // Get unique weeks
      const weeks = [...new Set(snapshots.map(s => s.week_number))].sort((a, b) => a - b);
      setAvailableWeeks(weeks);

      // Transform data into player-centric format
      const playersMap = new Map<string, PlayerWeeklyData>();

      entries.forEach(entry => {
        playersMap.set(entry.id, {
          id: entry.id,
          participant_name: entry.participant_name,
          team_name: entry.team_name,
          payment_confirmed: entry.payment_confirmed,
          weeklyScores: {},
          currentTotal: entry.total_points,
          currentRank: entry.current_rank || 0
        });
      });

      // Fill in weekly data
      snapshots.forEach(snapshot => {
        const player = playersMap.get(snapshot.pool_entry_id);
        if (player) {
          player.weeklyScores[snapshot.week_number] = {
            week: snapshot.week_number,
            points: snapshot.points_change, // Points earned THAT week
            rank: snapshot.rank_position,
            rankChange: snapshot.rank_change
          };
        }
      });

      const playersArray = Array.from(playersMap.values());
      console.log('🔍 WeekByWeek - Processed players data:', playersArray);

      setPlayersData(playersArray);
    } catch (error) {
      console.error('❌ WeekByWeek - Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: number | 'total' | 'name') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedData = [...playersData].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    if (sortColumn === 'total') {
      aValue = a.currentTotal;
      bValue = b.currentTotal;
    } else if (sortColumn === 'name') {
      aValue = a.participant_name;
      bValue = b.participant_name;
    } else if (typeof sortColumn === 'number') {
      aValue = a.weeklyScores[sortColumn]?.points || 0;
      bValue = b.weeklyScores[sortColumn]?.points || 0;
    } else {
      return 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    const numA = typeof aValue === 'number' ? aValue : 0;
    const numB = typeof bValue === 'number' ? bValue : 0;
    
    return sortDirection === 'asc' ? numA - numB : numB - numA;
  });

  const getPointsColor = (points: number) => {
    if (points > 10) return 'bg-green-100 text-green-800 border-green-200';
    if (points > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (points < 0) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getCumulativeTotal = (player: PlayerWeeklyData, upToWeek: number) => {
    let total = 0;
    for (let week = 1; week <= upToWeek; week++) {
      total += player.weeklyScores[week]?.points || 0;
    }
    return total;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading week-by-week data...</p>
        </CardContent>
      </Card>
    );
  }

  if (playersData.length === 0 || availableWeeks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No weekly data available yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Complete at least one week to see week-by-week results.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-brand-teal to-coral text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Week-by-Week Performance</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'points' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('points')}
              className="text-xs"
            >
              Points by Week
            </Button>
            <Button 
              variant={viewMode === 'cumulative' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('cumulative')}
              className="text-xs"
            >
              Cumulative Score
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow className="bg-muted">
                <TableHead className="sticky left-0 bg-muted z-20 min-w-[200px] border-r">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="h-auto p-1 font-bold text-left justify-start"
                  >
                    Player
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                {availableWeeks.map(week => (
                  <TableHead key={week} className="text-center min-w-[80px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort(week)}
                      className="h-auto p-1 font-bold"
                    >
                      Week {week}
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-[100px] bg-yellow-50 border-l-2 border-yellow-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('total')}
                    className="h-auto p-1 font-bold"
                  >
                    Current Total
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((player, index) => (
                <TableRow key={player.id} className="hover:bg-muted/50">
                  <TableCell className="sticky left-0 bg-background z-10 border-r">
                    <div className="min-w-[180px]">
                      <div className="font-medium">{player.participant_name}</div>
                      <div className="text-xs text-muted-foreground">{player.team_name}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge 
                          variant={player.payment_confirmed ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {player.payment_confirmed ? '✓ Paid' : 'Unpaid'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  {availableWeeks.map(week => {
                    const weekData = player.weeklyScores[week];
                    const points = weekData?.points || 0;
                    const displayValue = viewMode === 'cumulative' 
                      ? getCumulativeTotal(player, week)
                      : points;
                    
                    return (
                      <TableCell key={week} className="text-center p-2">
                        {weekData ? (
                          <div className="flex flex-col items-center gap-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-bold border ${getPointsColor(viewMode === 'cumulative' ? points : displayValue)}`}
                            >
                              {displayValue > 0 ? '+' : ''}{displayValue}
                            </Badge>
                            {weekData.rankChange !== 0 && (
                              <div className="flex items-center text-xs">
                                {weekData.rankChange > 0 ? (
                                  <TrendingUp className="h-3 w-3 text-green-600" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-red-600" />
                                )}
                                <span className={weekData.rankChange > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {Math.abs(weekData.rankChange)}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center bg-yellow-50 border-l-2 border-yellow-200">
                    <Badge variant="secondary" className="text-lg font-bold bg-yellow-200 text-yellow-800">
                      {player.currentTotal}
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