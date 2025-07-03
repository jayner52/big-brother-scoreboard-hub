import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { WeeklyEventForm } from '@/types/admin';

interface TripleEvictionToggleProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
}

export const TripleEvictionToggle: React.FC<TripleEvictionToggleProps> = ({
  eventForm,
  setEventForm,
}) => {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <Switch
        checked={eventForm.isTripleEviction}
        onCheckedChange={(checked) => setEventForm(prev => ({ 
          ...prev, 
          isTripleEviction: checked,
          // Reset triple eviction fields when toggling off
          thirdHohWinner: checked ? prev.thirdHohWinner : '',
          thirdNominees: checked ? prev.thirdNominees : ['', ''],
          thirdPovWinner: checked ? prev.thirdPovWinner : '',
          thirdPovUsed: checked ? prev.thirdPovUsed : false,
          thirdPovUsedOn: checked ? prev.thirdPovUsedOn : '',
          thirdReplacementNominee: checked ? prev.thirdReplacementNominee : '',
          thirdEvicted: checked ? prev.thirdEvicted : ''
        }))}
      />
      <span className="text-sm font-medium text-red-800">Triple Eviction</span>
    </div>
  );
};