import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';
import { useActiveContestants } from '@/hooks/useActiveContestants';
import { usePool } from '@/contexts/PoolContext';
import { BigBrotherIcon } from '@/components/BigBrotherIcons';

interface CompetitionWinnersProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
}

export const CompetitionWinners: React.FC<CompetitionWinnersProps> = ({
  eventForm,
  setEventForm,
}) => {
  const { activePool } = usePool();
  const { activeContestants } = useActiveContestants(activePool?.id);
  
  return (
    <div>
      <Label className="font-semibold flex items-center gap-2">
        <BigBrotherIcon type="hoh" />
        Head of Household Winner
      </Label>
      <Select value={eventForm.hohWinner} onValueChange={(value) => setEventForm(prev => ({ ...prev, hohWinner: value }))}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select HOH winner" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no-winner">No winner</SelectItem>
          {activeContestants.map(contestant => (
            <SelectItem key={contestant.id} value={contestant.name}>
              <span className="flex items-center justify-between w-full">
                <span>{contestant.name}</span>
                {!contestant.isActive && (
                  <Badge variant="outline" className="text-xs ml-2">Evicted</Badge>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};