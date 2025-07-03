import React from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompetitionWinners } from './CompetitionWinners';
import { NomineesSection } from './NomineesSection';
import { PovUsageSection } from './PovUsageSection';
import { EvictionSection } from './EvictionSection';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';

interface SecondEvictionSectionProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
  contestants: ContestantWithBio[];
}

export const SecondEvictionSection: React.FC<SecondEvictionSectionProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
  contestants,
}) => {
  // Create a modified form for second eviction data
  const secondEvictionForm = {
    ...eventForm,
    nominees: eventForm.secondNominees,
    hohWinner: eventForm.secondHohWinner || '',
    povWinner: eventForm.secondPovWinner || '',
    povUsed: eventForm.secondPovUsed,
    povUsedOn: eventForm.secondPovUsedOn || '',
    replacementNominee: eventForm.secondReplacementNominee,
    evicted: eventForm.secondEvicted || ''
  };

  const setSecondEvictionForm = (updateFn: (prev: WeeklyEventForm) => WeeklyEventForm) => {
    setEventForm(prev => {
      const updated = updateFn(secondEvictionForm);
      return {
        ...prev,
        secondNominees: updated.nominees,
        secondHohWinner: updated.hohWinner,
        secondPovWinner: updated.povWinner,
        secondPovUsed: updated.povUsed,
        secondPovUsedOn: updated.povUsedOn,
        secondReplacementNominee: updated.replacementNominee,
        secondEvicted: updated.evicted
      };
    });
  };

  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardHeader>
        <CardTitle className="text-lg text-orange-800">Second Eviction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Second Competition Winners */}
        <CompetitionWinners
          eventForm={secondEvictionForm}
          setEventForm={setSecondEvictionForm}
        />

        {/* Second Nominees */}
        <NomineesSection
          eventForm={secondEvictionForm}
          setEventForm={setSecondEvictionForm}
        />

        {/* Second POV Usage */}
        <PovUsageSection
          eventForm={secondEvictionForm}
          setEventForm={setSecondEvictionForm}
        />

        {/* Second Evicted Contestant */}
        <EvictionSection
          eventForm={secondEvictionForm}
          setEventForm={setSecondEvictionForm}
          evictionLabel="Second Evicted Contestant"
        />
      </CardContent>
    </Card>
  );
};