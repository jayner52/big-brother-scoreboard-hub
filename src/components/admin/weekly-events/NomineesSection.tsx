import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Users } from 'lucide-react';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';

interface NomineesSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
}

export const NomineesSection: React.FC<NomineesSectionProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
}) => {
  const addNominee = (contestant: string) => {
    if (!contestant || eventForm.nominees.includes(contestant) || eventForm.nominees.length >= 2) return;
    setEventForm(prev => ({
      ...prev,
      nominees: [...prev.nominees, contestant]
    }));
  };

  const removeNominee = (contestant: string) => {
    setEventForm(prev => ({
      ...prev,
      nominees: prev.nominees.filter(n => n !== contestant)
    }));
  };

  return (
    <div>
      <Label className="font-semibold flex items-center gap-2">
        <Users className="h-4 w-4" />
        Nominees ({eventForm.nominees.length}/2)
      </Label>
      <div className="mt-2 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {eventForm.nominees.map(nominee => (
            <Badge key={nominee} variant="destructive" className="flex items-center gap-1">
              {nominee}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeNominee(nominee)} />
            </Badge>
          ))}
        </div>
        {eventForm.nominees.length < 2 && (
          <Select value="" onValueChange={addNominee}>
            <SelectTrigger>
              <SelectValue placeholder="Add nominee" />
            </SelectTrigger>
            <SelectContent>
              {activeContestants
                .filter(c => !eventForm.nominees.includes(c.name))
                .map(contestant => (
                  <SelectItem key={contestant.id} value={contestant.name}>
                    {contestant.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};