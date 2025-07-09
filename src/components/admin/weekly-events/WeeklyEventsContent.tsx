import React from 'react';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { FinalWeekSection } from './FinalWeekSection';
import { RegularWeekContent } from './RegularWeekContent';
import { PointsPreview } from './PointsPreview';
import { SeasonCompletionSection } from './SeasonCompletionSection';

interface WeeklyEventsContentProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  activeContestants: ContestantWithBio[];
  contestants: ContestantWithBio[];
  scoringRules: DetailedScoringRule[];
  pointsPreview: Record<string, number>;
  evictedThisWeek: string[];
}

export const WeeklyEventsContent: React.FC<WeeklyEventsContentProps> = ({
  eventForm,
  setEventForm,
  activeContestants,
  contestants,
  scoringRules,
  pointsPreview,
  evictedThisWeek,
}) => {
  return (
    <>
      {/* Final Week Section (replaces regular week content) */}
      {eventForm.isFinalWeek ? (
        <FinalWeekSection
          eventForm={eventForm}
          setEventForm={setEventForm}
          activeContestants={activeContestants}
          contestants={contestants}
          pointsPreview={pointsPreview}
          evictedThisWeek={evictedThisWeek}
        />
      ) : (
        <RegularWeekContent
          eventForm={eventForm}
          setEventForm={setEventForm}
          activeContestants={activeContestants}
          contestants={contestants}
          scoringRules={scoringRules}
        />
      )}

      {/* Points Preview */}
      <PointsPreview 
        pointsPreview={pointsPreview} 
        contestants={contestants}
        evictedThisWeek={evictedThisWeek}
        scoringRules={scoringRules}
        eventForm={eventForm}
      />

      {/* Season Completion Section - Shows when Final Week is enabled */}
      <SeasonCompletionSection
        eventForm={eventForm}
        setEventForm={setEventForm}
      />
    </>
  );
};