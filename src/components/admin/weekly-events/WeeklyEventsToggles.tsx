import React from 'react';
import { ContestantWithBio, WeeklyEventForm } from '@/types/admin';
import { JuryPhaseToggle } from './EnhancedJuryPhaseToggle';
import { DoubleEvictionToggle } from './DoubleEvictionToggle';
import { TripleEvictionToggle } from './TripleEvictionToggle';
import { FinalWeekToggle } from './FinalWeekToggle';

interface WeeklyEventsTogglesProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
}

export const WeeklyEventsToggles: React.FC<WeeklyEventsTogglesProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
}) => {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <JuryPhaseToggle
        eventForm={eventForm}
        setEventForm={setEventForm}
      />
      
      <DoubleEvictionToggle
        eventForm={eventForm}
        setEventForm={setEventForm}
      />
      
      <TripleEvictionToggle
        eventForm={eventForm}
        setEventForm={setEventForm}
      />
      
      <FinalWeekToggle
        eventForm={eventForm}
        setEventForm={setEventForm}
        activeContestants={activeContestants}
      />
    </div>
  );
};