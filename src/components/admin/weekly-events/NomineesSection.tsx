import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
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
  const addNominee = () => {
    if (eventForm.nominees.length < eventForm.maxNominees) {
      setEventForm(prev => ({ ...prev, nominees: [...prev.nominees, ''] }));
    }
  };

  const removeNominee = (index: number) => {
    if (eventForm.nominees.length > 2) {
      setEventForm(prev => ({
        ...prev,
        nominees: prev.nominees.filter((_, i) => i !== index)
      }));
    }
  };

  const updateNominee = (index: number, value: string) => {
    const newNominees = [...eventForm.nominees];
    newNominees[index] = value === 'no-nominee' ? '' : value;
    setEventForm(prev => ({ ...prev, nominees: newNominees }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="font-semibold">Nominees</Label>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={addNominee}
            disabled={eventForm.nominees.length >= eventForm.maxNominees}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => removeNominee(eventForm.nominees.length - 1)}
            disabled={eventForm.nominees.length <= 2}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {eventForm.nominees.map((nominee, index) => (
          <Select 
            key={index}
            value={nominee || 'no-nominee'} 
            onValueChange={(value) => updateNominee(index, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Nominee ${index + 1}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-nominee">No nominee</SelectItem>
              {activeContestants
                .filter(c => 
                  (c.name !== eventForm.hohWinner || eventForm.hohWinner === 'no-winner' || !eventForm.hohWinner) &&
                  (!eventForm.nominees.includes(c.name) || c.name === nominee)
                )
                .map(contestant => (
                  <SelectItem key={contestant.id} value={contestant.name}>
                    {contestant.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        ))}
      </div>
    </div>
  );
};