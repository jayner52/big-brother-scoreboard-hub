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
    <div className="bg-gradient-to-br from-background to-muted/20 border rounded-xl p-3 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-center justify-between gap-3">
        {/* Team header - name, manager, total in one line */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="min-w-0">
            <div className="text-base font-bold text-foreground truncate">{entry.team_name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {entry.participant_name} • {totalPoints} pts
            </div>
          </div>
        </div>
        
        {/* Players grid - evenly spaced horizontal layout */}
        <div className="grid grid-cols-5 gap-3 flex-shrink-0 min-w-0">
          {[entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5].map((player, index) => {
            const points = houseguestPoints[player] || 0;
            const isEvicted = evictedContestants.includes(player);
            return (
              <div key={index} className="text-center min-w-0 flex-1">
                <div className="text-xs text-muted-foreground font-medium mb-1">P{index + 1}</div>
                <div className="flex flex-col items-center gap-1">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs font-medium px-2 py-1 w-full max-w-20 truncate ${
                      isEvicted 
                        ? 'bg-red-100 text-red-700 border-red-200 line-through opacity-70' 
                        : 'bg-primary/10 text-primary border-primary/20'
                    }`}
                    title={player}
                  >
                    {player}
                  </Badge>
                  {points > 0 && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 h-4 px-1">
                      {points}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};