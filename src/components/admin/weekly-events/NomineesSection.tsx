import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { useActiveContestants } from '@/hooks/useActiveContestants';
import { usePool } from '@/contexts/PoolContext';
import { BigBrotherIcon } from '@/components/BigBrotherIcons';
import { PointsTooltip } from '@/components/ui/points-tooltip';
import { ScoringLabel } from './ScoringLabel';

interface NomineesSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  scoringRules?: DetailedScoringRule[];
}

export const NomineesSection: React.FC<NomineesSectionProps> = ({
  eventForm,
  setEventForm,
  scoringRules = [],
}) => {
  const { activePool } = usePool();
  const { allContestants } = useActiveContestants(activePool?.id);
  
  // Get contestants who are not HoH (include both active and evicted for historical data)
  const eligibleNominees = allContestants.filter(c => 
    c.name !== eventForm.hohWinner || eventForm.hohWinner === 'no-winner' || !eventForm.hohWinner
  );

  // Check if HOH is selected (required before nominees)
  const hohSelected = eventForm.hohWinner && eventForm.hohWinner !== 'no-winner';
  
  // Auto-expand to 3 nominees if AI Arena is enabled
  React.useEffect(() => {
    if (eventForm.aiArenaEnabled && eventForm.nominees.length < 3) {
      setEventForm(prev => ({ 
        ...prev, 
        nominees: [...prev.nominees, ''] 
      }));
    }
  }, [eventForm.aiArenaEnabled, eventForm.nominees.length, setEventForm]);
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

  // Ensure we always have at least 2 nominee slots
  React.useEffect(() => {
    if (eventForm.nominees.length < 2) {
      setEventForm(prev => ({ 
        ...prev, 
        nominees: [...prev.nominees, ...Array(2 - prev.nominees.length).fill('')] 
      }));
    }
  }, [eventForm.nominees.length, setEventForm]);

  const updateNominee = (index: number, value: string) => {
    const newNominees = [...eventForm.nominees];
    newNominees[index] = value === 'no-nominee' ? '' : value;
    setEventForm(prev => ({ ...prev, nominees: newNominees }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <ScoringLabel 
          scoringRules={scoringRules} 
          category="weekly_events" 
          subcategory="nominee"
        >
          <BigBrotherIcon type="nominees" className="h-4 w-4" />
          Nominated Houseguests {!hohSelected && <span className="text-gray-400 text-sm">(Select HOH first)</span>}
        </ScoringLabel>
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
          <PointsTooltip 
            key={index}
            scoringRules={scoringRules} 
            category="weekly_events" 
            subcategory="nominee"
          >
            <Select 
              value={nominee || 'no-nominee'} 
              onValueChange={(value) => updateNominee(index, value)}
              disabled={!hohSelected}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Houseguest ${index + 1}`} />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-nominee">No houseguest</SelectItem>
            {eligibleNominees
                .map(contestant => (
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
        ))}
      </div>
    </div>
  );
};