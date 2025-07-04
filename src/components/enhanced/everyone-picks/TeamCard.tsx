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
    <div className="bg-gradient-to-br from-background to-muted/20 border rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-center justify-between gap-4">
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
        <div className="grid grid-cols-5 gap-4 flex-shrink-0">
          {[entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5].map((player, index) => {
            const points = houseguestPoints[player] || 0;
            const isEvicted = evictedContestants.includes(player);
            return (
              <div key={index} className="text-center w-24">
                <div className="text-xs text-muted-foreground font-medium mb-2 tracking-wide">P{index + 1}</div>
                <div className="flex flex-col items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs font-medium px-3 py-1.5 w-full justify-center rounded-lg transition-colors ${
                      isEvicted 
                        ? 'bg-red-50 text-red-700 border-red-200 line-through opacity-75' 
                        : 'bg-primary/5 text-primary border-primary/15 hover:bg-primary/10'
                    }`}
                    title={player}
                  >
                    <span className="truncate">{player}</span>
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-semibold px-2 py-0.5 min-w-[2rem] justify-center rounded-md ${
                      points > 0 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-muted/50 text-muted-foreground border-muted'
                    }`}
                  >
                    {points}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};