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
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
      <Switch
        id="jury-phase"
        checked={eventForm.isJuryPhase || false}
        onCheckedChange={handleJuryToggle}
        disabled={!canStartJury}
      />
      <span className="text-sm font-medium text-amber-800">Jury Starts</span>
    </div>
  );
};