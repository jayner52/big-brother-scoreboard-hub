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
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">
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
      <span className="text-sm font-medium text-blue-800">Double Eviction</span>
    </div>
  );
};