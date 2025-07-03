import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';

interface AIArenaSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
}

export const AIArenaSection: React.FC<AIArenaSectionProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
}) => {
  const handleAIArenaToggle = (enabled: boolean) => {
    if (!enabled) {
      // Clear AI Arena data when disabled
      setEventForm(prev => ({
        ...prev,
        aiArenaEnabled: false,
        aiArenaWinner: ''
      }));
    } else {
      setEventForm(prev => ({
        ...prev,
        aiArenaEnabled: true
      }));
    }
  };

  const handleAIArenaWinner = (winner: string) => {
    setEventForm(prev => {
      // Remove winner from nominees if they were nominated
      const updatedNominees = prev.nominees.map(nominee => nominee === winner ? '' : nominee);
      
      return {
        ...prev,
        aiArenaWinner: winner,
        nominees: updatedNominees
      };
    });
  };

  // Get current nominees for AI Arena selection
  const currentNominees = eventForm.nominees.filter(nominee => nominee && nominee !== '');

  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardHeader>
        <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
          <Switch
            checked={eventForm.aiArenaEnabled || false}
            onCheckedChange={handleAIArenaToggle}
          />
          BB Arena
        </CardTitle>
      </CardHeader>
      {eventForm.aiArenaEnabled && (
        <CardContent className="space-y-4">
          <div>
            <Label className="font-semibold">BB Arena Winner</Label>
            <Select 
              value={eventForm.aiArenaWinner || ''} 
              onValueChange={handleAIArenaWinner}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select BB Arena winner" />
              </SelectTrigger>
              <SelectContent>
                {currentNominees.length > 0 ? (
                  currentNominees.map(nominee => (
                    <SelectItem key={nominee} value={nominee}>
                      {nominee}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No nominees available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {currentNominees.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Set nominees first to select BB Arena winner
              </p>
            )}
            {eventForm.aiArenaWinner && (
              <p className="text-xs text-purple-700 mt-1">
                Winner will be removed from the block (+2 points)
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};