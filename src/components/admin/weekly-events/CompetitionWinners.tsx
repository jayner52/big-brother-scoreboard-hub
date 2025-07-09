import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { useActiveContestants } from '@/hooks/useActiveContestants';
import { usePool } from '@/contexts/PoolContext';
import { BigBrotherIcon } from '@/components/BigBrotherIcons';
import { PointsTooltip } from '@/components/ui/points-tooltip';
import { ScoringLabel } from './ScoringLabel';

interface CompetitionWinnersProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  scoringRules?: DetailedScoringRule[];
}

export const CompetitionWinners: React.FC<CompetitionWinnersProps> = ({
  eventForm,
  setEventForm,
  scoringRules = [],
}) => {
  const { activePool } = usePool();
  const { allContestants } = useActiveContestants(activePool?.id);
  
  return (
    <div>
      <ScoringLabel 
        scoringRules={scoringRules} 
        category="competitions" 
        subcategory="hoh_winner"
      >
        <BigBrotherIcon type="hoh" />
        Head of Household Winner
      </ScoringLabel>
      <PointsTooltip 
        scoringRules={scoringRules} 
        category="competitions" 
        subcategory="hoh_winner"
      >
        <Select value={eventForm.hohWinner} onValueChange={(value) => setEventForm(prev => ({ ...prev, hohWinner: value }))}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select HOH winner" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no-winner">No winner</SelectItem>
          {allContestants.map(contestant => (
            <SelectItem key={contestant.id} value={contestant.name}>
              <span className="flex items-center justify-between w-full">
                <span className={!contestant.isActive ? 'text-red-600' : ''}>
                  {contestant.name} {contestant.isActive ? '(Active)' : '(Evicted)'}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
        </Select>
      </PointsTooltip>
    </div>
  );
};