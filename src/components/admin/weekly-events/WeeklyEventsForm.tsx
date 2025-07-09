import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WeeklyEventsHeader } from './WeeklyEventsHeader';
import { WeekSelector } from './WeekSelector';
import { FinalWeekBanner } from './FinalWeekBanner';
import { WeekControls } from './WeekControls';
import { WeeklyEventsToggles } from './WeeklyEventsToggles';
import { WeeklyEventsContent } from './WeeklyEventsContent';
import { WeeklyEventForm, ContestantWithBio, DetailedScoringRule } from '@/types/admin';

interface WeeklyEventsFormProps {
  eventForm: WeeklyEventForm;
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>;
  currentGameWeek: number;
  isWeekComplete: boolean;
  isLoadingWeek: boolean;
  isAutoSaving: boolean;
  isSubmitting: boolean;
  contestants: ContestantWithBio[];
  scoringRules: DetailedScoringRule[];
  pointsPreview: any;
  evictedThisWeek: string[];
  onWeekChange: (week: number) => void;
  onMarkComplete: (complete: boolean) => void;
  onClearWeek: (week: number) => void;
  onSaveProgress: () => void;
  onSubmitWeek: () => void;
}

export const WeeklyEventsForm: React.FC<WeeklyEventsFormProps> = ({
  eventForm,
  setEventForm,
  currentGameWeek,
  isWeekComplete,
  isLoadingWeek,
  isAutoSaving,
  isSubmitting,
  contestants,
  scoringRules,
  pointsPreview,
  evictedThisWeek,
  onWeekChange,
  onMarkComplete,
  onClearWeek,
  onSaveProgress,
  onSubmitWeek
}) => {
  const activeContestants = contestants.filter(c => c.isActive);

  return (
    <Card>
      <WeeklyEventsHeader
        week={eventForm.week}
        currentGameWeek={currentGameWeek}
        onWeekChange={onWeekChange}
        isLoadingWeek={isLoadingWeek}
      />
      
      <CardContent className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Week Selector */}
        <WeekSelector
          currentWeek={eventForm.week}
          onWeekChange={onWeekChange}
        />

        {/* Final Week Banner */}
        <FinalWeekBanner
          isFinalWeek={eventForm.isFinalWeek}
          week={eventForm.week}
          winner={eventForm.winner}
          runnerUp={eventForm.runnerUp}
          americasFavorite={eventForm.americasFavorite}
        />

        {/* Week Controls */}
        <WeekControls
          weekNumber={eventForm.week}
          isComplete={isWeekComplete}
          onMarkComplete={onMarkComplete}
          onClearWeek={() => onClearWeek(eventForm.week)}
          onSaveProgress={onSaveProgress}
          onSubmitWeek={onSubmitWeek}
          isAutoSaving={isAutoSaving}
          isFinalWeek={eventForm.isFinalWeek}
          isDraft={!isWeekComplete}
          isSubmitting={isSubmitting}
        />

        {/* Special Week Toggles */}
        <WeeklyEventsToggles
          eventForm={eventForm}
          setEventForm={setEventForm}
          activeContestants={activeContestants}
        />

        {/* Main Content */}
        <WeeklyEventsContent
          eventForm={eventForm}
          setEventForm={setEventForm}
          activeContestants={activeContestants}
          contestants={contestants}
          scoringRules={scoringRules}
          pointsPreview={pointsPreview}
          evictedThisWeek={evictedThisWeek}
        />
      </CardContent>
    </Card>
  );
};