import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronUp, ChevronDown, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';
import { useEvictedContestants } from '@/hooks/useEvictedContestants';
import { useBonusQuestions } from '@/hooks/useBonusQuestions';
import { usePool } from '@/contexts/PoolContext';
import { evaluateBonusAnswer } from '@/utils/bonusQuestionUtils';

interface LeaderboardRowProps {
  entry: any;
  index: number;
  showHistoricalColumns: boolean;
  selectedWeek?: number | null;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  entry,
  index,
  showHistoricalColumns,
  selectedWeek
}) => {
  const { houseguestPoints } = useHouseguestPoints();
  const { evictedContestants } = useEvictedContestants();
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
    const isEliminated = evictedContestants.includes(playerName);
    const points = houseguestPoints[playerName];
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className={`cursor-help ${isEliminated ? 'line-through text-red-600' : ''}`}>
              {playerName}
              {points !== undefined && ` (${points}pts)`}
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
    <TableRow className={rankPosition === 1 ? "bg-yellow-50" : index % 2 === 0 ? "bg-gray-50" : ""}>
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
      
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="font-semibold text-blue-600 cursor-help">
                {teamData.team_name}
              </span>
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
      <TableCell>{teamData.participant_name}</TableCell>
      <TableCell>{renderPlayerName(teamData.player_1)}</TableCell>
      <TableCell>{renderPlayerName(teamData.player_2)}</TableCell>
      <TableCell>{renderPlayerName(teamData.player_3)}</TableCell>
      <TableCell>{renderPlayerName(teamData.player_4)}</TableCell>
      <TableCell>{renderPlayerName(teamData.player_5)}</TableCell>
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
      <TableCell className={`text-center font-medium ${getPointsChangeColor(actualTotalPoints - (entry.total_points || 0))}`}>
        <div className="flex items-center justify-center gap-1">
          {(actualTotalPoints - (entry.total_points || 0)) > 0 && <TrendingUp className="h-3 w-3" />}
          {(actualTotalPoints - (entry.total_points || 0)) < 0 && <TrendingDown className="h-3 w-3" />}
          <span>{(actualTotalPoints - (entry.total_points || 0)) > 0 ? '+' : ''}{actualTotalPoints - (entry.total_points || 0)}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant={teamData.payment_confirmed ? "default" : "destructive"}>
          {teamData.payment_confirmed ? "✓" : "Pending"}
        </Badge>
      </TableCell>
    </TableRow>
  );
};