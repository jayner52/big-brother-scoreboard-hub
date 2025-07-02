import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';

interface PovUsageSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
}

export const PovUsageSection: React.FC<PovUsageSectionProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
}) => {
  if (!eventForm.povWinner) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          checked={eventForm.povUsed}
          onCheckedChange={(checked) => setEventForm(prev => ({ ...prev, povUsed: checked }))}
        />
        <Label>POV was used</Label>
      </div>

      {eventForm.povUsed && (
        <div>
          <Label className="font-semibold">Replacement Nominee</Label>
          <Select 
            value={eventForm.replacementNominee || ''} 
            onValueChange={(value) => setEventForm(prev => ({ ...prev, replacementNominee: value }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select replacement nominee" />
            </SelectTrigger>
            <SelectContent>
              {activeContestants
                .filter(c => !eventForm.nominees.includes(c.name) && c.name !== eventForm.povWinner)
                .map(contestant => (
                  <SelectItem key={contestant.id} value={contestant.name}>
                    {contestant.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};