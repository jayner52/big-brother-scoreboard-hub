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
  // Fix 1: Include bonus points in total calculation
  const totalPoints = [entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5]
    .reduce((sum, player) => sum + (houseguestPoints[player] || 0), 0) + entry.bonus_points;

  return (
    <div className="bg-gradient-to-br from-background to-muted/20 border rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      {/* Fix 2: Compact horizontal layout - team info and players on same level */}
      <div className="flex items-center justify-between gap-4">
        {/* Team name, manager, and total score in one line */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="min-w-0">
            <div className="text-lg font-bold text-foreground truncate">{entry.team_name}</div>
            <div className="text-sm text-muted-foreground truncate">
              Manager: {entry.participant_name}
            </div>
          </div>
          <div className="bg-primary/10 rounded-lg px-3 py-2 flex-shrink-0">
            <div className="text-xl font-bold text-primary">{totalPoints}</div>
            <div className="text-xs text-muted-foreground font-medium">Total</div>
          </div>
        </div>
        
        {/* Player badges in horizontal layout */}
        <div className="flex gap-2 flex-shrink-0">
          {[entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5].map((player, index) => {
            const points = houseguestPoints[player] || 0;
            const isEvicted = evictedContestants.includes(player);
            return (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground font-medium mb-1">P{index + 1}</div>
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
                {points > 0 && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 mt-1">
                    {points} pts
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};