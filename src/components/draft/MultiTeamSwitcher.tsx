import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Users, Edit3 } from 'lucide-react';

interface Team {
  id: string;
  team_name: string;
  participant_name: string;
  payment_confirmed: boolean;
  player_1: string;
  player_2: string;
  player_3: string;
  player_4: string;
  player_5: string;
  player_6?: string;
}

interface MultiTeamSwitcherProps {
  teams: Team[];
  currentTeamIndex: number;
  onTeamChange: (index: number) => void;
  onEditTeam: (team: Team) => void;
  picksPerTeam: number;
}

export const MultiTeamSwitcher: React.FC<MultiTeamSwitcherProps> = ({
  teams,
  currentTeamIndex,
  onTeamChange,
  onEditTeam,
  picksPerTeam,
}) => {
  if (teams.length <= 1) return null;

  const currentTeam = teams[currentTeamIndex];
  
  // Count filled player slots
  const filledSlots = [];
  for (let i = 1; i <= picksPerTeam; i++) {
    const player = currentTeam[`player_${i}` as keyof Team];
    if (typeof player === 'string' && player.trim()) {
      filledSlots.push(player);
    }
  }

  const handlePrevious = () => {
    const newIndex = currentTeamIndex > 0 ? currentTeamIndex - 1 : teams.length - 1;
    onTeamChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentTeamIndex < teams.length - 1 ? currentTeamIndex + 1 : 0;
    onTeamChange(newIndex);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <div>
              <h3 className="font-semibold text-sm">{currentTeam.team_name}</h3>
              <p className="text-xs text-muted-foreground">
                {currentTeam.participant_name} • Team {currentTeamIndex + 1} of {teams.length}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {filledSlots.length}/{picksPerTeam} Players
          </Badge>
          
          {currentTeam.payment_confirmed && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              Paid ✓
            </Badge>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEditTeam(currentTeam)}
            className="flex items-center gap-1 text-xs h-7 px-2"
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </Button>
        </div>
      </div>

      {/* Team Preview */}
      <div className="mt-3 pt-3 border-t border-blue-100">
        <div className="flex flex-wrap gap-1">
          {filledSlots.map((player, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
            >
              {player}
            </Badge>
          ))}
          {Array.from({ length: picksPerTeam - filledSlots.length }, (_, index) => (
            <Badge 
              key={`empty-${index}`} 
              variant="outline" 
              className="text-xs bg-gray-50 text-gray-400 border-dashed"
            >
              —
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};