import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Target, Clock } from 'lucide-react';
import { DraftFormData } from '@/hooks/useDraftForm';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';

interface TeamSummaryBannerProps {
  formData: DraftFormData;
  className?: string;
  picksPerTeam?: number;
}

export const TeamSummaryBanner: React.FC<TeamSummaryBannerProps> = ({
  formData,
  className = "",
  picksPerTeam = 5,
}) => {
  // Dynamic player selection based on picksPerTeam
  const selectedPlayers = [];
  for (let i = 1; i <= picksPerTeam; i++) {
    const player = formData[`player_${i}` as keyof DraftFormData];
    if (typeof player === 'string' && player.trim()) {
      selectedPlayers.push(player.trim());
    }
  }

  const teamName = formData.team_name || 'Your Team';
  const completionPercentage = (selectedPlayers.length / picksPerTeam) * 100;
  const { houseguestPoints } = useHouseguestPoints();
  
  const getPlayerPoints = (playerName: string) => {
    return houseguestPoints[playerName] || 0;
  };
  
  const totalTeamPoints = selectedPlayers.reduce((sum, player) => {
    return sum + getPlayerPoints(player);
  }, 0);

  // Always render the banner, even if no data yet
  return (
    <div className={`bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 border border-purple-200 rounded-lg py-4 px-6 shadow-sm ${className}`}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Team Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Trophy className="h-4 w-4 text-purple-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base text-foreground truncate">{teamName}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {formData.participant_name && (
                  <span className="truncate">Manager: {formData.participant_name}</span>
                )}
                {selectedPlayers.length > 0 && (
                  <>
                    {formData.participant_name && <span>•</span>}
                    <span className="font-medium text-purple-600">{totalTeamPoints} pts</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Team Progress - Compact */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium">
                {selectedPlayers.length}/{picksPerTeam}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-16 bg-purple-100 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {selectedPlayers.length === picksPerTeam && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs py-0 px-2">
                <Target className="h-2 w-2 mr-1" />
                Ready
              </Badge>
            )}
          </div>
        </div>

        {/* Selected Players Preview - Collapsible on mobile */}
        {selectedPlayers.length > 0 && (
          <div className="mt-2 pt-2 border-t border-purple-100">
            <div className="flex flex-wrap gap-1">
              {selectedPlayers.map((player, index) => {
                const points = getPlayerPoints(player);
                return (
                  <div key={index} className="flex items-center gap-1">
                    <Badge 
                      variant="outline" 
                      className="bg-purple-50 text-purple-600 border-purple-200 text-xs py-0 px-1.5 h-5"
                    >
                      {player}
                    </Badge>
                    {points > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-700 text-xs py-0 px-1 h-4"
                      >
                        {points}
                      </Badge>
                    )}
                  </div>
                );
              })}
              {Array.from({ length: picksPerTeam - selectedPlayers.length }, (_, index) => (
                <Badge 
                  key={`empty-${index}`} 
                  variant="outline" 
                  className="bg-muted/50 text-muted-foreground border-dashed text-xs py-0 px-1.5 h-5"
                >
                  —
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};