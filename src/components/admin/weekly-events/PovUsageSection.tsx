import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { useActiveContestants } from '@/hooks/useActiveContestants';
import { usePool } from '@/contexts/PoolContext';
import { PointsTooltip } from '@/components/ui/points-tooltip';

interface PovUsageSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  scoringRules?: DetailedScoringRule[];
}

export const PovUsageSection: React.FC<PovUsageSectionProps> = ({
  eventForm,
  setEventForm,
  scoringRules = [],
}) => {
  const { activePool } = usePool();
  const { activeContestants } = useActiveContestants(activePool?.id);
  if (!eventForm.povWinner || eventForm.povWinner === 'no-winner') {
    return null;
  }

  return (
    <div className="space-y-4">
      {eventForm.povUsed && (
        <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <Label className="font-semibold flex items-center gap-2">
              POV Used On
            </Label>
            <PointsTooltip 
              scoringRules={scoringRules} 
              category="weekly_events" 
              subcategory="pov_used_on"
            >
              <Select 
                value={eventForm.povUsedOn || ''} 
                onValueChange={(value) => setEventForm(prev => ({ ...prev, povUsedOn: value }))}
              >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Who was saved by POV?" />
              </SelectTrigger>
              <SelectContent>
                {eventForm.nominees
                  .filter(nominee => nominee)
                  .map(nominee => (
                    <SelectItem key={nominee} value={nominee}>
                      {nominee}
                    </SelectItem>
                  ))}
              </SelectContent>
              </Select>
            </PointsTooltip>
          </div>

          <div>
            <Label className="font-semibold">Replacement Houseguest</Label>
            <PointsTooltip 
              scoringRules={scoringRules} 
              category="weekly_events" 
              subcategory="replacement_nominee"
            >
              <Select 
                value={eventForm.replacementNominee || ''} 
                onValueChange={(value) => setEventForm(prev => ({ ...prev, replacementNominee: value }))}
              >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select replacement houseguest" />
              </SelectTrigger>
              <SelectContent>
                {activeContestants
                  .filter(c => 
                    !eventForm.nominees.includes(c.name) && 
                    c.name !== eventForm.povWinner &&
                    c.name !== eventForm.povUsedOn &&
                    c.name !== eventForm.hohWinner
                  )
                  .map(contestant => (
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
            </PointsTooltip>
            <p className="text-xs text-muted-foreground mt-1">
              Cannot be HOH winner, POV winner, or person saved by POV
            </p>
          </div>
        </div>
      )}
    </div>
  );
};