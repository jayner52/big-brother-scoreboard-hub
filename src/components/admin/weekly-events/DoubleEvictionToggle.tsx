import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { WeeklyEventForm } from '@/types/admin';

interface DoubleEvictionToggleProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
}

export const DoubleEvictionToggle: React.FC<DoubleEvictionToggleProps> = ({
  eventForm,
  setEventForm,
}) => {
  return (
    <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/20">
      <Switch
        checked={eventForm.isDoubleEviction}
        onCheckedChange={(checked) => setEventForm(prev => ({ 
          ...prev, 
          isDoubleEviction: checked,
          // Reset second eviction fields when toggling off
          secondHohWinner: checked ? prev.secondHohWinner : '',
          secondNominees: checked ? prev.secondNominees : [],
          secondPovWinner: checked ? prev.secondPovWinner : '',
          secondPovUsed: checked ? prev.secondPovUsed : false,
          secondReplacementNominee: checked ? prev.secondReplacementNominee : '',
          secondEvicted: checked ? prev.secondEvicted : ''
        }))}
      />
      <Label className="font-semibold text-lg">Double Eviction Week</Label>
      {eventForm.isDoubleEviction && (
        <div className="text-sm text-muted-foreground ml-4">
          Additional competition and eviction sections will appear below
        </div>
      )}
    </div>
  );
};