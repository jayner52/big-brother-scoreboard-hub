import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';
import { useEvictedContestants } from '@/hooks/useEvictedContestants';

interface LeaderboardRowProps {
  entry: any;
  index: number;
  showHistoricalColumns: boolean;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  entry,
  index,
  showHistoricalColumns
}) => {
  const { houseguestPoints } = useHouseguestPoints();
  const { evictedContestants } = useEvictedContestants();

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
      <span className={`${isEliminated ? 'line-through text-red-500' : ''}`}>
        {playerName}
        {points !== undefined && ` (${points}pts)`}
      </span>
    );
  };

  const isSnapshot = 'pool_entries' in entry;
  const teamData = isSnapshot ? entry.pool_entries : entry;
  const rankPosition = isSnapshot ? entry.rank_position : index + 1;
  const rankChange = isSnapshot ? entry.rank_change : 0;
  const pointsChange = isSnapshot ? entry.points_change : 0;

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
      
      <TableCell className="font-semibold text-blue-600">{teamData.team_name}</TableCell>
      <TableCell>{teamData.participant_name}</TableCell>
      <TableCell>{renderPlayerName(teamData.player_1)}</TableCell>
      <TableCell>{renderPlayerName(teamData.player_2)}</TableCell>
      <TableCell>{renderPlayerName(teamData.player_3)}</TableCell>
      <TableCell>{renderPlayerName(teamData.player_4)}</TableCell>
      <TableCell>{renderPlayerName(teamData.player_5)}</TableCell>
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
};