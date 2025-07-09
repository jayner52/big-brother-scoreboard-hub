import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronUp, ChevronDown, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';
// Remove useEvictedContestants - get contestant status from database
import { useBonusQuestions } from '@/hooks/useBonusQuestions';
import { usePool } from '@/contexts/PoolContext';
import { evaluateBonusAnswer } from '@/utils/bonusQuestionUtils';

interface LeaderboardRowProps {
  entry: any;
  index: number;  
  showHistoricalColumns: boolean;
  selectedWeek?: number | null;
  contestants?: Array<{ name: string; is_active: boolean }>;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  entry,
  index,
  showHistoricalColumns,
  selectedWeek,
  contestants = []
}) => {
  const { houseguestPoints } = useHouseguestPoints();
  // Removed useEvictedContestants - using contestants prop with is_active status
  const { bonusQuestions } = useBonusQuestions();
  const { activePool } = usePool();

  // Calculate actual weekly points (sum of all players' points)
  const calculateActualWeeklyPoints = (teamData: any): number => {
    const players = Array.from({ length: activePool?.picks_per_team || 5 }, (_, i) => {
      const playerKey = `player_${i + 1}` as keyof typeof teamData;
      return teamData[playerKey] as string;
    }).filter(Boolean);
    return players.reduce((total, playerName) => {
      return total + (houseguestPoints[playerName] || 0);
    }, 0);
  };

  // Calculate actual bonus points earned from revealed questions
  const calculateActualBonusPoints = (teamData: any): number => {
    if (!bonusQuestions || !teamData.bonus_answers) return 0;
    
    return bonusQuestions.reduce((total, question) => {
      if (!question.answer_revealed || !question.correct_answer) return total;
      
      const userAnswer = teamData.bonus_answers[question.id];
      if (!userAnswer) return total;
      
      const isCorrect = evaluateBonusAnswer(userAnswer, question.correct_answer, question.question_type);
      return total + (isCorrect ? question.points_value : 0);
    }, 0);
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

  const renderPlayerName = (playerName: string) => {
    const contestant = contestants.find(c => c.name === playerName);
    const isEliminated = !contestant?.is_active;
    const points = houseguestPoints[playerName];
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className={`text-xs px-2 py-1 rounded-full inline-block ${
              isEliminated 
                ? 'bg-destructive/20 text-destructive border border-destructive/30 opacity-70' 
                : 'bg-muted text-foreground'
            }`}>
              {playerName}
              {points !== undefined && ` (${points})`}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div className="font-semibold">{playerName}</div>
              <div className="text-muted-foreground">
                {isEliminated ? 'Eliminated' : 'Active'} • {points || 0} total points
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <span className="text-2xl">🥇</span>;
      case 2: return <span className="text-2xl">🥈</span>;
      case 3: return <span className="text-2xl">🥉</span>;
      default: return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const isSnapshot = 'pool_entries' in entry;
  const teamData = isSnapshot ? entry.pool_entries : entry;
  const rankPosition = isSnapshot ? entry.rank_position : index + 1;
  const rankChange = isSnapshot ? entry.rank_change : 0;
  const pointsChange = isSnapshot ? entry.points_change : 0;

  // Calculate the real-time values
  const actualWeeklyPoints = calculateActualWeeklyPoints(teamData);
  const actualBonusPoints = calculateActualBonusPoints(teamData);
  const actualTotalPoints = actualWeeklyPoints + actualBonusPoints;

  return (
    <TableRow className={`
      ${rankPosition === 1 ? "bg-gradient-to-r from-yellow-50 to-yellow-100" : ""} 
      ${index % 2 === 0 ? "bg-muted/50" : ""} 
      hover:bg-muted/70 transition-colors
    `}>
      <TableCell className="text-center">
        {getRankIcon(rankPosition)}
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
      
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="cursor-help">
                <div className="font-semibold text-primary">
                  {teamData.team_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {actualTotalPoints} pts total
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <div className="font-semibold">Team Performance</div>
                <div>Total Score: {actualTotalPoints} pts</div>
                <div>Weekly: {actualWeeklyPoints} pts</div>
                <div>Bonus: {actualBonusPoints} pts</div>
                {showHistoricalColumns && (
                  <>
                    <div>This Week: +{entry.points_change} pts</div>
                    <div>Rank Change: {entry.rank_change > 0 ? `+${entry.rank_change}` : entry.rank_change}</div>
                  </>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{teamData.participant_name}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: activePool?.picks_per_team || 5 }, (_, i) => {
            const playerKey = `player_${i + 1}` as keyof typeof teamData;
            const playerName = teamData[playerKey] as string;
            return playerName ? renderPlayerName(playerName) : null;
          }).filter(Boolean)}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="cursor-help">{actualWeeklyPoints}</span>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <div className="font-semibold">Weekly Points Breakdown</div>
                <div>Sum of all player points: {actualWeeklyPoints}</div>
                {selectedWeek && <div>Through Week {selectedWeek}</div>}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      
      {showHistoricalColumns && (
        <TableCell className={`text-center font-medium ${getPointsChangeColor(pointsChange)}`}>
          <div className="flex items-center justify-center gap-1">
            {pointsChange > 0 && <TrendingUp className="h-3 w-3" />}
            {pointsChange < 0 && <TrendingDown className="h-3 w-3" />}
            <span>{pointsChange > 0 ? '+' : ''}{pointsChange}</span>
          </div>
        </TableCell>
      )}
      
      <TableCell className="text-center">{actualBonusPoints}</TableCell>
      <TableCell className="text-center font-bold text-lg bg-yellow-100">
        {actualTotalPoints}
      </TableCell>
      <TableCell className={`text-center font-medium ${getPointsChangeColor(pointsChange)}`}>
        <div className="flex items-center justify-center gap-1">
          {pointsChange > 0 && <TrendingUp className="h-3 w-3" />}
          {pointsChange < 0 && <TrendingDown className="h-3 w-3" />}
          <span>{pointsChange > 0 ? '+' : ''}{pointsChange}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        {activePool?.has_buy_in ? (
          <Badge variant={teamData.payment_confirmed ? "default" : "destructive"}>
            {teamData.payment_confirmed ? "✓" : "Pending"}
          </Badge>
        ) : (
          <Badge variant="outline">N/A</Badge>
        )}
      </TableCell>
    </TableRow>
  );
};