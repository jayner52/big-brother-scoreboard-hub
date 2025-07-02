import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';

interface EvictionSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
}

export const EvictionSection: React.FC<EvictionSectionProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
}) => {
  return (
    <div>
      <Label className="font-semibold">Evicted Contestant</Label>
      <Select value={eventForm.evicted} onValueChange={(value) => setEventForm(prev => ({ ...prev, evicted: value }))}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select evicted contestant" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no-eviction">No eviction</SelectItem>
          {activeContestants.map(contestant => (
            <SelectItem key={contestant.id} value={contestant.name}>
              {contestant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};