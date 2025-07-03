import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PoolEntry } from '@/types/pool';

interface TeamCardProps {
  entry: PoolEntry;
  evictedContestants: string[];
  houseguestPoints: Record<string, number>;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  entry,
  evictedContestants,
  houseguestPoints,
}) => {
  const totalPoints = [entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5]
    .reduce((sum, player) => sum + (houseguestPoints[player] || 0), 0);

  return (
    <div className="bg-gradient-to-br from-background to-muted/20 border rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <div className="text-lg font-bold text-foreground">{entry.team_name}</div>
          <div className="text-sm text-muted-foreground">
            <span>Manager: {entry.participant_name}</span>
          </div>
        </div>
        <div className="text-right bg-primary/10 rounded-lg px-3 py-2">
          <div className="text-2xl font-bold text-primary">{totalPoints}</div>
          <div className="text-xs text-muted-foreground font-medium">Total Points</div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {[entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5].map((player, index) => {
          const points = houseguestPoints[player] || 0;
          const isEvicted = evictedContestants.includes(player);
          return (
            <div key={index} className="bg-background/80 border rounded-lg p-3 text-center space-y-2 hover:bg-background transition-colors">
              <div className="text-xs text-muted-foreground font-medium">P{index + 1}</div>
              <div className="relative">
                <Badge 
                  variant="secondary" 
                  className={`text-sm font-semibold px-2 py-1 ${
                    isEvicted 
                      ? 'bg-red-100 text-red-700 border-red-200 line-through opacity-60' 
                      : 'bg-primary/10 text-primary border-primary/20'
                  }`}
                >
                  {player}
                </Badge>
                {isEvicted && (
                  <Badge variant="destructive" className="text-xs mt-1 bg-red-500 text-white">
                    EVICTED
                  </Badge>
                )}
              </div>
              {points > 0 && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {points} pts
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};