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
    <div className="flex flex-col items-start space-y-2 p-3 border rounded-lg bg-amber-50 border-amber-200">
      <div className="flex items-center space-x-2">
        <Switch
          id="jury-phase"
          checked={eventForm.isJuryPhase || false}
          onCheckedChange={handleJuryToggle}
        />
        <Label htmlFor="jury-phase" className="font-semibold text-sm text-amber-800">
          Jury Starts
        </Label>
      </div>
      {eventForm.isJuryPhase && (
        <div className="text-xs text-amber-700">
          +2 jury points for remaining contestants
        </div>
      )}
    </div>
  );
};