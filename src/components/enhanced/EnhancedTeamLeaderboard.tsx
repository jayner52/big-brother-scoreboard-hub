import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry } from '@/types/pool';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';
import { useWeeklySnapshots } from '@/hooks/useWeeklySnapshots';
import { useScoringRules } from '@/hooks/useScoringRules';
import { useBonusQuestions } from '@/hooks/useBonusQuestions';

export const EnhancedTeamLeaderboard: React.FC = () => {
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const { houseguestPoints } = useHouseguestPoints();
  const { snapshots, completedWeeks, loadSnapshotsForWeek } = useWeeklySnapshots();
  const { scoringRules } = useScoringRules();
  const { bonusQuestions } = useBonusQuestions();

  useEffect(() => {
    if (completedWeeks.length > 0 && selectedWeek === null) {
      const latestWeek = Math.max(...completedWeeks.map(w => w.week_number));
      setSelectedWeek(latestWeek);
      loadSnapshotsForWeek(latestWeek);
    } else if (completedWeeks.length === 0 && selectedWeek === null) {
      // No completed weeks, show current standings
      loadCurrentPoolEntries();
    }
  }, [completedWeeks, selectedWeek, loadSnapshotsForWeek]);

  useEffect(() => {
    if (selectedWeek === null) {
      loadCurrentPoolEntries();
    }
  }, [selectedWeek]);

  const loadCurrentPoolEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('pool_entries')
        .select('*')
        .order('total_points', { ascending: false });

      if (error) throw error;
      
      const mappedEntries = data?.map(entry => ({
        ...entry,
        bonus_answers: entry.bonus_answers as Record<string, any>,
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      })) || [];
      
      setPoolEntries(mappedEntries);
    } catch (error) {
      console.error('Error loading pool entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeekChange = async (weekStr: string) => {
    if (weekStr === 'current') {
      setSelectedWeek(null);
      loadCurrentPoolEntries();
    } else {
      const week = parseInt(weekStr);
      setSelectedWeek(week);
      await loadSnapshotsForWeek(week);
      
      // If no snapshots found for this week, generate them
      if (snapshots.length === 0) {
        try {
          await supabase.rpc('generate_weekly_snapshots', { week_num: week });
          await loadSnapshotsForWeek(week);
        } catch (error) {
          console.error('Error generating snapshots:', error);
          // Fall back to current standings if snapshot generation fails
          setSelectedWeek(null);
          loadCurrentPoolEntries();
        }
      }
    }
  };

  const getRankChangeIcon = (rankChange: number) => {
    if (rankChange > 0) return <ChevronUp className="h-4 w-4 text-green-500" />;
    if (rankChange < 0) return <ChevronDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getPointsChangeColor = (pointsChange: number) => {
    if (pointsChange > 0) return "text-green-600";
    if (pointsChange < 0) return "text-red-600";
    return "text-gray-500";
  };

  const getScoringBadges = () => {
    const badges = [];
    
    // Group scoring rules by category for better display
    const competitionRules = scoringRules.filter(r => r.category === 'competitions');
    const bonusRules = scoringRules.filter(r => r.category === 'bonuses');
    
    // Add competition badges
    competitionRules.forEach(rule => {
      if (rule.subcategory === 'hoh_winner') {
        badges.push(<Badge key={rule.id} variant="secondary" className="bg-yellow-500/20 text-yellow-700">HOH: {rule.points} pts</Badge>);
      } else if (rule.subcategory === 'pov_winner') {
        badges.push(<Badge key={rule.id} variant="secondary" className="bg-green-500/20 text-green-700">POV: {rule.points} pts</Badge>);
      } else if (rule.subcategory === 'survival') {
        badges.push(<Badge key={rule.id} variant="secondary" className="bg-blue-500/20 text-blue-700">Survival: {rule.points} pt/week</Badge>);
      }
    });

    // Add bonus badge with tooltip
    if (bonusQuestions.length > 0) {
      badges.push(
        <TooltipProvider key="bonus">
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-700 cursor-help">
                Bonus: {bonusQuestions.map(q => q.points_value).join('/')} pts
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-1">
                {bonusQuestions.map(q => (
                  <div key={q.id} className="text-xs">
                    <span className="font-medium">{q.points_value} pts:</span> {q.question_text}
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return badges;
  };

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  const displayData = selectedWeek && snapshots.length > 0 ? snapshots : poolEntries;
  const showHistoricalColumns = selectedWeek !== null && snapshots.length > 0;

  if (displayData.length === 0) {
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl">Team Leaderboard</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2 text-sm">
              {getScoringBadges()}
            </div>
          </div>
          
          {completedWeeks.length > 0 && (
            <div className="min-w-[200px]">
              <Select value={selectedWeek?.toString() || 'current'} onValueChange={handleWeekChange}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Standings</SelectItem>
                  {completedWeeks.map(week => (
                    <SelectItem key={week.week_number} value={week.week_number.toString()}>
                      Week {week.week_number} (Complete)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold">Rank</TableHead>
                {showHistoricalColumns && <TableHead className="font-bold text-center">Change</TableHead>}
                <TableHead className="font-bold">Team Name</TableHead>
                <TableHead className="font-bold">Participant</TableHead>
                <TableHead className="font-bold">Player 1</TableHead>
                <TableHead className="font-bold">Player 2</TableHead>
                <TableHead className="font-bold">Player 3</TableHead>
                <TableHead className="font-bold">Player 4</TableHead>
                <TableHead className="font-bold">Player 5</TableHead>
                <TableHead className="font-bold text-center">Weekly Pts</TableHead>
                {showHistoricalColumns && <TableHead className="font-bold text-center">Pts Change</TableHead>}
                <TableHead className="font-bold text-center">Bonus Pts</TableHead>
                <TableHead className="font-bold text-center bg-yellow-100">Total</TableHead>
                <TableHead className="font-bold text-center">Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((entry, index) => {
                const isSnapshot = 'pool_entries' in entry;
                const teamData = isSnapshot ? (entry as any).pool_entries : entry;
                const rankPosition = isSnapshot ? (entry as any).rank_position : index + 1;
                const rankChange = isSnapshot ? (entry as any).rank_change : 0;
                const pointsChange = isSnapshot ? (entry as any).points_change : 0;
                
                return (
                  <TableRow key={entry.id} className={rankPosition === 1 ? "bg-yellow-50" : index % 2 === 0 ? "bg-gray-50" : ""}>
                    <TableCell className="font-bold">
                      {rankPosition === 1 ? "🏆" : rankPosition}
                    </TableCell>
                    
                    {showHistoricalColumns && (
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getRankChangeIcon(rankChange)}
                          {Math.abs(rankChange) > 0 && (
                            <span className="text-xs">{Math.abs(rankChange)}</span>
                          )}
                        </div>
                      </TableCell>
                    )}
                    
                    <TableCell className="font-semibold text-blue-600">{teamData.team_name}</TableCell>
                    <TableCell>{teamData.participant_name}</TableCell>
                    <TableCell>{teamData.player_1} {houseguestPoints[teamData.player_1] !== undefined && `(${houseguestPoints[teamData.player_1]} pts)`}</TableCell>
                    <TableCell>{teamData.player_2} {houseguestPoints[teamData.player_2] !== undefined && `(${houseguestPoints[teamData.player_2]} pts)`}</TableCell>
                    <TableCell>{teamData.player_3} {houseguestPoints[teamData.player_3] !== undefined && `(${houseguestPoints[teamData.player_3]} pts)`}</TableCell>
                    <TableCell>{teamData.player_4} {houseguestPoints[teamData.player_4] !== undefined && `(${houseguestPoints[teamData.player_4]} pts)`}</TableCell>
                    <TableCell>{teamData.player_5} {houseguestPoints[teamData.player_5] !== undefined && `(${houseguestPoints[teamData.player_5]} pts)`}</TableCell>
                    <TableCell className="text-center">{entry.weekly_points}</TableCell>
                    
                    {showHistoricalColumns && (
                      <TableCell className={`text-center font-medium ${getPointsChangeColor(pointsChange)}`}>
                        {pointsChange > 0 ? '+' : ''}{pointsChange}
                      </TableCell>
                    )}
                    
                    <TableCell className="text-center">{entry.bonus_points}</TableCell>
                    <TableCell className="text-center font-bold text-lg bg-yellow-100">
                      {entry.total_points}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={teamData.payment_confirmed ? "default" : "destructive"}>
                        {teamData.payment_confirmed ? "✓" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};