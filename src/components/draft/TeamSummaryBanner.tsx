import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Target, Clock } from 'lucide-react';
import { DraftFormData } from '@/hooks/useDraftForm';

interface TeamSummaryBannerProps {
  formData: DraftFormData;
  className?: string;
}

export const TeamSummaryBanner: React.FC<TeamSummaryBannerProps> = ({
  formData,
  className = "",
}) => {
  const selectedPlayers = [
    formData.player_1,
    formData.player_2,
    formData.player_3,
    formData.player_4,
    formData.player_5,
  ].filter(player => player.trim());

  const teamName = formData.team_name || 'Your Team';
  const completionPercentage = (selectedPlayers.length / 5) * 100;

  return (
    <div className={`bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 border border-purple-200 rounded-lg p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Team Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-lg text-foreground">{teamName}</h3>
          </div>
          {formData.participant_name && (
            <Badge variant="outline" className="text-xs">
              Manager: {formData.participant_name}
            </Badge>
          )}
        </div>

        {/* Team Progress */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">
              {selectedPlayers.length}/5 Players
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-24 bg-purple-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(completionPercentage)}%
            </span>
          </div>

          {selectedPlayers.length === 5 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              <Target className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
      </div>

      {/* Selected Players Preview */}
      {selectedPlayers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-purple-200">
          <div className="flex flex-wrap gap-2">
            {selectedPlayers.map((player, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
              >
                {player}
              </Badge>
            ))}
            {Array.from({ length: 5 - selectedPlayers.length }, (_, index) => (
              <Badge 
                key={`empty-${index}`} 
                variant="outline" 
                className="bg-muted text-muted-foreground border-dashed text-xs"
              >
                Open Slot
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};