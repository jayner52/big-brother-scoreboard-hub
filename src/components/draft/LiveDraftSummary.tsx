import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Check, AlertCircle } from 'lucide-react';
import { DraftFormData } from '@/hooks/useDraftForm';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';

interface LiveDraftSummaryProps {
  formData: DraftFormData;
  onPaymentUpdate: (confirmed: boolean) => void;
}

export const LiveDraftSummary: React.FC<LiveDraftSummaryProps> = ({
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
  const managerName = formData.participant_name || 'Team Manager';
  
  const totalTeamPoints = selectedPlayers.reduce((sum, player) => {
    return sum + (houseguestPoints[player] || 0);
  }, 0);

  const isTeamComplete = selectedPlayers.length === 5;

  return (
    <Card className="mb-6 shadow-md border-2 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">{teamName}</h3>
              <p className="text-sm text-muted-foreground">{managerName}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{totalTeamPoints}</div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
        </div>

        {/* Team Progress */}
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{selectedPlayers.length}/5 Players</span>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(selectedPlayers.length / 5) * 100}%` }}
                />
              </div>
              {isTeamComplete && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  Complete
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Selected Players Grid */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: 5 }, (_, index) => {
            const player = selectedPlayers[index];
            const points = player ? (houseguestPoints[player] || 0) : 0;
            
            return (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">P{index + 1}</div>
                {player ? (
                  <div>
                    <Badge 
                      variant="outline" 
                      className="text-xs mb-1 w-full justify-center bg-primary/10 text-primary border-primary/30"
                    >
                      {player}
                    </Badge>
                    {points > 0 && (
                      <div className="text-xs font-medium text-green-600">{points} pts</div>
                    )}
                  </div>
                ) : (
                  <Badge 
                    variant="outline" 
                    className="text-xs w-full justify-center bg-muted/50 text-muted-foreground border-dashed"
                  >
                    Empty
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Payment Status */}
        {isTeamComplete && (
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm font-medium">Payment Status:</span>
            <Button
              size="sm"
              variant={formData.payment_confirmed ? "secondary" : "default"}
              onClick={() => onPaymentUpdate(!formData.payment_confirmed)}
              className="flex items-center gap-2"
            >
              {formData.payment_confirmed ? (
                <>
                  <Check className="h-4 w-4" />
                  Confirmed
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Confirm Payment
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};