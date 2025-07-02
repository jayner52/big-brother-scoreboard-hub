import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale } from 'lucide-react';
import { WeeklyEventForm } from '@/types/admin';

interface JuryPhaseToggleProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  onJuryPhaseStart?: () => void;
}

export const JuryPhaseToggle: React.FC<JuryPhaseToggleProps> = ({
  eventForm,
  setEventForm,
  onJuryPhaseStart
}) => {
  const handleJuryToggle = (checked: boolean) => {
    setEventForm(prev => ({ ...prev, isJuryPhase: checked }));
    if (checked && onJuryPhaseStart) {
      onJuryPhaseStart();
    }
  };

  return (
    <Card className="border-2 border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Scale className="h-5 w-5" />
          Jury Phase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            id="jury-phase"
            checked={eventForm.isJuryPhase || false}
            onCheckedChange={handleJuryToggle}
          />
          <Label htmlFor="jury-phase" className="font-medium">
            Jury phase starts this week (remaining contestants get +2 jury points)
          </Label>
        </div>
        {eventForm.isJuryPhase && (
          <p className="text-sm text-amber-700 mt-2">
            All remaining contestants will receive 2 points for making jury this week.
          </p>
        )}
      </CardContent>
    </Card>
  );
};