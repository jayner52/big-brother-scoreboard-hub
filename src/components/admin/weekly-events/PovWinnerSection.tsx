import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';
import { useActiveContestants } from '@/hooks/useActiveContestants';
import { BigBrotherIcon } from '@/components/BigBrotherIcons';

interface PovWinnerSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
}

export const PovWinnerSection: React.FC<PovWinnerSectionProps> = ({
  eventForm,
  setEventForm,
}) => {
  const { activeContestants } = useActiveContestants();
  
  return (
    <div className="flex items-end gap-4">
      <div className="flex-1">
        <Label className="font-semibold flex items-center gap-2">
          <BigBrotherIcon type="pov" />
          Power of Veto Winner
        </Label>
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
      
      {eventForm.povWinner && eventForm.povWinner !== 'no-winner' && (
        <div className="flex items-center space-x-2 pb-1">
          <Switch
            checked={eventForm.povUsed}
            onCheckedChange={(checked) => setEventForm(prev => ({ 
              ...prev, 
              povUsed: checked,
              povUsedOn: checked ? prev.povUsedOn : '',
              replacementNominee: checked ? prev.replacementNominee : ''
            }))}
          />
          <Label className="text-sm">POV Used</Label>
        </div>
      )}
    </div>
  );
};