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
  // Calculate final nominees (after POV ceremony)
  const getFinalNominees = () => {
    let finalNominees = [...eventForm.nominees.filter(n => n)];
    
    if (eventForm.povUsed && eventForm.povUsedOn) {
      // Remove the person saved by POV
      finalNominees = finalNominees.filter(n => n !== eventForm.povUsedOn);
      // Add replacement nominee if there is one
      if (eventForm.replacementNominee) {
        finalNominees.push(eventForm.replacementNominee);
      }
    }
    
    return finalNominees;
  };

  const finalNominees = getFinalNominees();

  return (
    <div>
      <Label className="font-semibold">Evicted Contestant</Label>
      <Select value={eventForm.evicted} onValueChange={(value) => setEventForm(prev => ({ ...prev, evicted: value }))}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select evicted contestant" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no-eviction">No eviction</SelectItem>
          {finalNominees.length > 0 ? (
            finalNominees.map(nominee => (
              <SelectItem key={nominee} value={nominee}>
                {nominee}
              </SelectItem>
            ))
          ) : (
            activeContestants.map(contestant => (
              <SelectItem key={contestant.id} value={contestant.name}>
                {contestant.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {finalNominees.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Showing final nominees after POV ceremony
        </p>
      )}
    </div>
  );
};