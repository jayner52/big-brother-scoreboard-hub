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
    <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/20">
      <Switch
        checked={eventForm.isTripleEviction}
        onCheckedChange={(checked) => setEventForm(prev => ({ 
          ...prev, 
          isTripleEviction: checked,
          // Reset triple eviction fields when toggling off
          thirdEvicted: checked ? prev.thirdEvicted : ''
        }))}
      />
      <Label className="font-semibold text-lg">Triple Eviction Week</Label>
      {eventForm.isTripleEviction && (
        <div className="text-sm text-muted-foreground ml-4">
          Three evictions will occur this week
        </div>
      )}
    </div>
  );
};