import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { usePool } from '@/contexts/PoolContext';
import { useWeekAwareContestants } from '@/hooks/useWeekAwareContestants';
import { BigBrotherIcon } from '@/components/BigBrotherIcons';
import { ScoringLabel } from './ScoringLabel';

interface EvictionSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  evictionLabel?: string;
  scoringRules?: DetailedScoringRule[];
}

export const EvictionSection: React.FC<EvictionSectionProps> = ({
  eventForm,
  setEventForm,
  evictionLabel = "Evicted Houseguest",
  scoringRules = [],
}) => {
  const { activePool } = usePool();
  const { allContestants } = useWeekAwareContestants(eventForm.week);
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
      <ScoringLabel 
        scoringRules={scoringRules} 
        category="weekly_events" 
        subcategory="evicted"
      >
        <BigBrotherIcon type="evicted" />
        {evictionLabel} {arenaRequired && <span className="text-gray-400 text-sm">(Complete AI Arena first)</span>}
      </ScoringLabel>
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
            // CRITICAL FIX: Use filtered nominees (already filtered by POV and AI Arena)
            finalNominees.map(nominee => (
              <SelectItem key={nominee} value={nominee}>
                {nominee}
              </SelectItem>
            ))
           ) : (
                // Show all contestants with status indicator
                allContestants.map(contestant => (
                  <SelectItem key={contestant.id} value={contestant.name}>
                    <span className="flex items-center justify-between w-full">
                      <span className={!contestant.isActive ? 'text-red-600' : ''}>
                        {contestant.name} {contestant.isActive ? '(Active)' : '(Evicted)'}
                      </span>
                    </span>
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