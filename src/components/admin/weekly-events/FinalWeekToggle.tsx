import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, Heart } from 'lucide-react';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';

interface FinalWeekToggleProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
}

export const FinalWeekToggle: React.FC<FinalWeekToggleProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
}) => {
  return (
    <div className="flex flex-col items-start space-y-2 p-3 border rounded-lg bg-muted/20">
      <div className="flex items-center space-x-2">
        <Switch
          checked={eventForm.isFinalWeek}
          onCheckedChange={(checked) => setEventForm(prev => ({ 
            ...prev, 
            isFinalWeek: checked,
            // Reset final week fields when toggling off
            winner: checked ? prev.winner : '',
            runnerUp: checked ? prev.runnerUp : '',
            americasFavorite: checked ? prev.americasFavorite : ''
          }))}
        />
        <Label className="font-semibold text-sm">Final Week</Label>
      </div>
      {eventForm.isFinalWeek && (
        <div className="text-xs text-muted-foreground">
          Finale Night - Winner, Runner-up, AFP
        </div>
      )}
    </div>
  );
};