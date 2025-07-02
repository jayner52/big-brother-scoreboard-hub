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
    <div className="flex flex-col items-start space-y-2 p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
      <div className="flex items-center space-x-2">
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
        <Label className="font-semibold text-sm text-blue-800">Double Eviction</Label>
      </div>
      {eventForm.isDoubleEviction && (
        <div className="text-xs text-blue-600 font-medium">
          Two evictions with competitions
        </div>
      )}
    </div>
  );
};