import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Check, AlertCircle } from 'lucide-react';
import { DraftFormData } from '@/hooks/useDraftForm';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';

interface LiveTeamSummaryProps {
  formData: DraftFormData;
  onPaymentUpdate: (confirmed: boolean) => void;
}

export const LiveTeamSummary: React.FC<LiveTeamSummaryProps> = ({
  formData,
  onPaymentUpdate,
}) => {
  const { houseguestPoints } = useHouseguestPoints();
  
  const selectedPlayers = [
    formData.player_1,
    formData.player_2,
    formData.player_3,
    formData.player_4,
    formData.player_5,
  ].filter(player => typeof player === 'string' && player.trim());

  const teamName = formData.team_name || 'Your Team';
  const managerName = formData.participant_name || 'Manager';
  
  const totalTeamPoints = selectedPlayers.reduce((sum, player) => {
    return sum + (houseguestPoints[player] || 0);
  }, 0);

  // Always show the team summary box - no hiding conditions

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg py-3 px-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Team Info Section */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Trophy className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-sm text-foreground truncate">{teamName}</div>
            <div className="text-xs text-muted-foreground truncate">
              {managerName} • {selectedPlayers.length}/5 players • {totalTeamPoints} pts
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {Array.from({ length: 5 }, (_, index) => {
            const player = selectedPlayers[index];
            const points = player ? (houseguestPoints[player] || 0) : 0;
            
            return (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">P{index + 1}</div>
                {player ? (
                  <div className="flex flex-col items-center gap-1">
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-blue-100 text-blue-700 border-blue-200 px-2 py-0.5"
                    >
                      {player}
                    </Badge>
                    {points > 0 && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 h-4 px-1">
                        {points}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-gray-50 text-gray-400 border-dashed border-gray-300 px-2 py-0.5"
                  >
                    —
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Payment Status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedPlayers.length === 5 && (
            <Button
              size="sm"
              variant={formData.payment_confirmed ? "secondary" : "default"}
              onClick={() => onPaymentUpdate(!formData.payment_confirmed)}
              className="text-xs"
            >
              {formData.payment_confirmed ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Paid
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Confirm Payment
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};