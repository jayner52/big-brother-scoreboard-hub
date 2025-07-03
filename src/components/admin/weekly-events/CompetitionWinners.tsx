import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';
import { useEvictedContestants } from '@/hooks/useEvictedContestants';

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
  const { evictedContestants } = useEvictedContestants();
  
  // Get contestants who are still in the game (not evicted) - use all contestants, not just activeContestants
  const gameContestants = activeContestants.filter(c => !evictedContestants.includes(c.name));
  
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
            {gameContestants.map(contestant => (
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
            {gameContestants.map(contestant => (
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