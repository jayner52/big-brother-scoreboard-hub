import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';
import { useActiveContestants } from '@/hooks/useActiveContestants';
import { usePool } from '@/contexts/PoolContext';
import { BigBrotherIcon } from '@/components/BigBrotherIcons';

interface EvictionSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  evictionLabel?: string;
}

export const EvictionSection: React.FC<EvictionSectionProps> = ({
  eventForm,
  setEventForm,
  evictionLabel = "Evicted Houseguest",
}) => {
  const { activePool } = usePool();
  const { activeContestants } = useActiveContestants(activePool?.id);
  // Calculate final nominees (after POV ceremony) and exclude BB Arena winner
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
    
    // Remove BB Arena winner (they are safe from eviction)
    if (eventForm.aiArenaWinner) {
      finalNominees = finalNominees.filter(n => n !== eventForm.aiArenaWinner);
    }
    
    return finalNominees;
  };

  // Check if AI Arena ceremony is required (3+ nominees but no Arena completion)
  const hasThreeOrMoreNominees = eventForm.nominees.filter(n => n).length >= 3;
  const arenaRequired = hasThreeOrMoreNominees && !eventForm.aiArenaWinner;

  const finalNominees = getFinalNominees();

  return (
    <div>
      <Label className="font-semibold flex items-center gap-2">
        <BigBrotherIcon type="evicted" />
        {evictionLabel} {arenaRequired && <span className="text-gray-400 text-sm">(Complete AI Arena first)</span>}
      </Label>
      <Select 
        value={eventForm.evicted} 
        onValueChange={(value) => setEventForm(prev => ({ ...prev, evicted: value }))}
        disabled={arenaRequired}
      >
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select evicted houseguest" />
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
        Showing final houseguests after POV ceremony
      </p>
      )}
    </div>
  );
};