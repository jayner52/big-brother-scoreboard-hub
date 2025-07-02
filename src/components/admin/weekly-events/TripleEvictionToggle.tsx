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
    <div className="flex flex-col items-start space-y-2 p-3 border rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
      <div className="flex items-center space-x-2">
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
        <Label className="font-semibold text-sm text-red-800">Triple Eviction</Label>
      </div>
      {eventForm.isTripleEviction && (
        <div className="text-xs text-red-600 font-medium">
          Three evictions with competitions
        </div>
      )}
    </div>
  );
};