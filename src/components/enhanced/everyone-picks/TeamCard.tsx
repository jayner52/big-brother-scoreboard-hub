import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Target } from 'lucide-react';
import { PoolEntry } from '@/types/pool';
// REMOVED: useContestantStatus - eviction logic will be reimplemented from scratch
import { usePool } from '@/contexts/PoolContext';

interface TeamCardProps {
  entry: PoolEntry;
  contestants: Array<{ name: string; is_active: boolean }>;
  houseguestPoints: Record<string, number>;
  teamIndex: number;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  entry,
  contestants,
  houseguestPoints,
  teamIndex,
}) => {
  // REMOVED: contestantStatus - will be reimplemented from scratch
  const { activePool } = usePool();
  
  // Include bonus points in total calculation  
  const teamPlayers = Array.from({ length: activePool?.picks_per_team || 5 }, (_, i) => {
    const playerKey = `player_${i + 1}` as keyof typeof entry;
    return entry[playerKey] as string;
  }).filter(Boolean);
  const totalPoints = teamPlayers.reduce((sum, player) => sum + (houseguestPoints[player] || 0), 0) + entry.bonus_points;

  // REMOVED: Status icon rendering - will be reimplemented from scratch
  const renderStatusIcon = (playerName: string) => {
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
          {Array.from({ length: activePool?.picks_per_team || 5 }, (_, i) => {
            const playerKey = `player_${i + 1}` as keyof typeof entry;
            const player = entry[playerKey] as string;
            return player;
          }).filter(Boolean).map((player, index) => {
            const points = houseguestPoints[player] || 0;
            const contestant = contestants.find(c => c.name === player);
            const isEvicted = false; // REMOVED: eviction logic - always show as active
            const statusIcon = renderStatusIcon(player);
            
            return (
              <div 
                key={index} 
                className={`flex flex-col items-center justify-center p-2 w-32 h-20 rounded-md border transition-all duration-150 hover:shadow-sm ${
                  isEvicted 
                    ? 'bg-red-50/80 border-red-200/60 opacity-70' 
                    : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300/80'
                }`}
              >
                {/* Player name with status icon */}
                <div className="flex items-center gap-1 mb-1">
                  <span className={`text-sm font-medium text-center leading-tight ${
                    isEvicted ? 'text-red-600' : 'text-slate-700'
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