import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Target } from 'lucide-react';
import { PoolEntry } from '@/types/pool';
import { useContestantStatus } from '@/hooks/useContestantStatus';

interface TeamCardProps {
  entry: PoolEntry;
  evictedContestants: string[];
  houseguestPoints: Record<string, number>;
  teamIndex: number;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  entry,
  evictedContestants,
  houseguestPoints,
  teamIndex,
}) => {
  const { contestantStatus } = useContestantStatus();
  
  // Include bonus points in total calculation
  const totalPoints = [entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5]
    .reduce((sum, player) => sum + (houseguestPoints[player] || 0), 0) + entry.bonus_points;

  const renderStatusIcon = (playerName: string) => {
    const status = contestantStatus[playerName];
    if (!status) return null;

    if (status.current_hoh) {
      return <Crown className="h-3 w-3 text-amber-600" />;
    }
    if (status.current_pov_winner) {
      return <Star className="h-3 w-3 text-emerald-600" />;
    }
    if (status.currently_nominated) {
      return <Target className="h-3 w-3 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-slate-50/80 to-slate-100/40 border border-slate-200/60 rounded-lg p-3 transition-all duration-200 hover:shadow-md hover:border-slate-300/60">
      <div className="flex items-center justify-between gap-4">
        {/* Team header - name, manager, total */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="min-w-0">
            <div className="text-lg font-bold text-slate-800 truncate">{entry.team_name}</div>
            <div className="text-xs text-slate-600 truncate">
              {entry.participant_name} • 
              <span className="inline-flex items-center ml-1 px-2 py-0.5 rounded-full bg-slate-700 text-white text-xs font-medium">
                {totalPoints}
                <span className="text-[10px] ml-1 opacity-75">pts</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Players grid - centered and wider */}
        <div className="flex justify-center gap-2 flex-shrink-0">
          {[entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5].map((player, index) => {
            const points = houseguestPoints[player] || 0;
            const isEvicted = evictedContestants.includes(player);
            const statusIcon = renderStatusIcon(player);
            
            return (
              <div 
                key={index} 
                className={`flex flex-col items-center justify-center p-2 w-32 h-20 rounded-md border transition-all duration-150 hover:shadow-sm ${
                  isEvicted 
                    ? 'bg-red-50/80 border-red-200/60 opacity-60' 
                    : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300/80'
                }`}
              >
                {/* Player name with status icon */}
                <div className="flex items-center gap-1 mb-1">
                  <span className={`text-sm font-medium text-center leading-tight ${
                    isEvicted ? 'line-through text-red-600' : 'text-slate-700'
                  }`} title={player}>
                    {player}
                  </span>
                  {statusIcon}
                </div>
                
                {/* Points badge */}
                <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  points > 0 
                    ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                    : 'bg-slate-50 text-slate-500 border border-slate-150'
                }`}>
                  {points}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};