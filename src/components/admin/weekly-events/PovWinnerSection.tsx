import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { useActiveContestants } from '@/hooks/useActiveContestants';
import { usePool } from '@/contexts/PoolContext';
import { BigBrotherIcon } from '@/components/BigBrotherIcons';
import { PointsTooltip } from '@/components/ui/points-tooltip';
import { ScoringLabel } from './ScoringLabel';

interface PovWinnerSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  scoringRules?: DetailedScoringRule[];
}

export const PovWinnerSection: React.FC<PovWinnerSectionProps> = ({
  eventForm,
  setEventForm,
  scoringRules = [],
}) => {
  const { activePool } = usePool();
  const { allContestants } = useActiveContestants(activePool?.id);
  
  // Check if nominees are selected (required before POV winner)
  const nomineesSelected = eventForm.nominees.some(n => n && n !== '');
  
  return (
    <div className="flex items-end gap-4">
      <div className="flex-1">
        <ScoringLabel 
          scoringRules={scoringRules} 
          category="competitions" 
          subcategory="pov_winner"
        >
          <BigBrotherIcon type="pov" />
          Power of Veto Winner {!nomineesSelected && <span className="text-gray-400 text-sm">(Select nominees first)</span>}
        </ScoringLabel>
        <PointsTooltip 
          scoringRules={scoringRules} 
          category="competitions" 
          subcategory="pov_winner"
        >
          <Select 
            value={eventForm.povWinner} 
            onValueChange={(value) => setEventForm(prev => ({ ...prev, povWinner: value }))}
            disabled={!nomineesSelected}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select POV winner" />
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