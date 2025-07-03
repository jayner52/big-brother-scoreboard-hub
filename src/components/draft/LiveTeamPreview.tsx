import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Users, Trophy, Target } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface LiveTeamPreviewProps {
  teamName: string;
  participantName: string;
  selectedPlayers: {
    player_1: string;
    player_2: string;
    player_3: string;
    player_4: string;
    player_5: string;
  };
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const LiveTeamPreview: React.FC<LiveTeamPreviewProps> = ({
  teamName,
  participantName,
  selectedPlayers,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const filledSlots = Object.values(selectedPlayers).filter(player => player.trim()).length;
  const completionPercentage = (filledSlots / 5) * 100;

  const getSlotDisplay = (player: string, slotNumber: number) => {
    if (player.trim()) {
      return player;
    }
    return `Select Player ${slotNumber}`;
  };

  return (
    <Card className="w-full bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg font-bold text-purple-800">
              {teamName || 'Your Team'}
            </CardTitle>
          </div>
          {onToggleCollapse && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapse}
                  className="text-purple-600 hover:text-purple-800"
                >
                  {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>
        
        {participantName && (
          <p className="text-sm text-purple-600">Manager: {participantName}</p>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 bg-purple-100 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <Badge variant="secondary" className="text-xs">
            {filledSlots}/5
          </Badge>
        </div>
      </CardHeader>

      <Collapsible open={!isCollapsed}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Team Roster</span>
              </div>
              
              {Array.from({ length: 5 }, (_, index) => {
                const playerKey = `player_${index + 1}` as keyof typeof selectedPlayers;
                const player = selectedPlayers[playerKey];
                const hasPlayer = player && player.trim();
                
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                      hasPlayer 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                        : 'bg-muted border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        hasPlayer 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-muted-foreground/20 text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <span className={`font-medium ${
                        hasPlayer ? 'text-green-800' : 'text-muted-foreground'
                      }`}>
                        {getSlotDisplay(player, index + 1)}
                      </span>
                    </div>
                    
                    {hasPlayer && (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        Selected
                      </Badge>
                    )}
                  </div>
                );
              })}
              
              {filledSlots === 5 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Team Complete! Ready for bonus questions.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};