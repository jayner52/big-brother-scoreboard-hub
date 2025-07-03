import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scale, AlertTriangle } from 'lucide-react';
import { WeeklyEventForm } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JuryPhaseToggleProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
}

export const JuryPhaseToggle: React.FC<JuryPhaseToggleProps> = ({
  eventForm,
  setEventForm,
}) => {
  const { toast } = useToast();
  const [juryWeekExists, setJuryWeekExists] = useState<number | null>(null);

  useEffect(() => {
    checkExistingJuryWeek();
  }, []);

  const checkExistingJuryWeek = async () => {
    try {
      const { data } = await supabase
        .from('weekly_results')
        .select('week_number')
        .eq('jury_phase_started', true)
        .eq('is_draft', false)
        .single();
      
      if (data) {
        setJuryWeekExists(data.week_number);
      }
    } catch (error) {
      // No existing jury week found
    }
  };

  const handleJuryToggle = (checked: boolean) => {
    if (checked && juryWeekExists && juryWeekExists !== eventForm.week) {
      toast({
        title: "Jury Phase Already Started",
        description: `Jury phase was already started in Week ${juryWeekExists}. Only one week can start the jury phase.`,
        variant: "destructive",
      });
      return;
    }
    
    setEventForm(prev => ({ ...prev, isJuryPhase: checked }));
  };

  const canStartJury = !juryWeekExists || juryWeekExists === eventForm.week;

  return (
    <div className="flex flex-col items-start space-y-2 p-3 border rounded-lg bg-amber-50 border-amber-200">
      <div className="flex items-center space-x-2">
        <Switch
          id="jury-phase"
          checked={eventForm.isJuryPhase || false}
          onCheckedChange={handleJuryToggle}
          disabled={!canStartJury}
        />
        <Label htmlFor="jury-phase" className="font-semibold text-sm text-amber-800 flex items-center gap-2">
          <Scale className="h-4 w-4" />
          Jury Phase Starts
        </Label>
      </div>
      
      {juryWeekExists && juryWeekExists !== eventForm.week && (
        <Alert className="border-amber-300 bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-amber-800 text-xs">
            Jury phase already started in Week {juryWeekExists}
          </AlertDescription>
        </Alert>
      )}
      
      {eventForm.isJuryPhase && (
        <div className="text-xs text-amber-700 bg-amber-100 p-2 rounded border border-amber-200">
          <strong>First week jury bonus:</strong> +2 jury points for all remaining contestants
        </div>
      )}
      
      {!eventForm.isJuryPhase && !juryWeekExists && (
        <div className="text-xs text-amber-600">
          Enable when jury phase begins (one-time bonus)
        </div>
      )}
    </div>
  );
};