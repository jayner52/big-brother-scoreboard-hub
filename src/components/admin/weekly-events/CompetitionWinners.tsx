import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';

interface CompetitionWinnersProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
}

export const CompetitionWinners: React.FC<CompetitionWinnersProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label className="font-semibold">Head of Household Winner</Label>
        <Select value={eventForm.hohWinner} onValueChange={(value) => setEventForm(prev => ({ ...prev, hohWinner: value }))}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select HOH winner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-winner">No winner</SelectItem>
            {activeContestants.map(contestant => (
              <SelectItem key={contestant.id} value={contestant.name}>
                {contestant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="font-semibold">Power of Veto Winner</Label>
        <Select value={eventForm.povWinner} onValueChange={(value) => setEventForm(prev => ({ ...prev, povWinner: value }))}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select POV winner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-winner">No winner</SelectItem>
            {activeContestants.map(contestant => (
              <SelectItem key={contestant.id} value={contestant.name}>
                {contestant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};