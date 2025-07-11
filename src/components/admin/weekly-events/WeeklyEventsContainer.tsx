import React, { useState } from 'react';
import { useWeeklyEvents } from '@/hooks/useWeeklyEvents';
import { useWeeklyEventsSave } from '@/hooks/useWeeklyEventsSave';
import { useWeekManagement } from '@/hooks/useWeekManagement';
import { useWeekAwareContestants } from '@/hooks/useWeekAwareContestants';
import { usePool } from '@/contexts/PoolContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WeeklyEventsInstructions } from './WeeklyEventsInstructions';
import { WeeklyEventsForm } from './WeeklyEventsForm';

export const WeeklyEventsContainer: React.FC = () => {
  const {
    contestants,
    scoringRules,
    loading,
    currentGameWeek,
    editingWeek,
    eventForm,
    setEventForm,
    getPointsPreview,
    handleSubmitWeek,
    loadData
  } = useWeeklyEvents();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { activePool } = usePool();
  const { isAutoSaving, saveCurrentWeekDraft } = useWeeklyEventsSave(eventForm || {
    week: editingWeek,
    nominees: ['', ''],
    hohWinner: '',
    povWinner: '',
    povUsed: false,
    povUsedOn: '',
    replacementNominee: '',
    evicted: '',
    isDoubleEviction: false,
    isTripleEviction: false,
    isFinalWeek: false,
    isJuryPhase: false,
    secondHohWinner: '',
    secondNominees: ['', ''],
    secondPovWinner: '',
    secondPovUsed: false,
    secondPovUsedOn: '',
    secondReplacementNominee: '',
    secondEvicted: '',
    thirdHohWinner: '',
    thirdNominees: ['', ''],
    thirdPovWinner: '',
    thirdPovUsed: false,
    thirdPovUsedOn: '',
    thirdReplacementNominee: '',
    thirdEvicted: '',
    maxNominees: 4,
    specialEvents: [],
    winner: '',
    runnerUp: '',
    americasFavorite: ''
  }, editingWeek, activePool?.id);
  
  const {
    isWeekComplete,
    isLoadingWeek,
    handleWeekChange,
    handleMarkComplete,
    handleClearWeek
  } = useWeekManagement(contestants, setEventForm, eventForm);

  // Get week-aware evicted contestants for this specific week
  const { evictedContestants } = useWeekAwareContestants(eventForm?.week || 1);

  if (loading || !eventForm) {
    return <div className="text-center py-8">Loading weekly events panel...</div>;
  }

  const pointsPreview = getPointsPreview();
  const evictedThisWeek = evictedContestants;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await handleSubmitWeek();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <WeeklyEventsInstructions />
        
        <WeeklyEventsForm
          eventForm={eventForm}
          setEventForm={setEventForm}
          currentGameWeek={currentGameWeek}
          isWeekComplete={isWeekComplete}
          isLoadingWeek={isLoadingWeek}
          isAutoSaving={isAutoSaving}
          isSubmitting={isSubmitting}
          contestants={contestants}
          scoringRules={scoringRules}
          pointsPreview={pointsPreview}
          evictedThisWeek={evictedThisWeek}
          onWeekChange={handleWeekChange}
          onMarkComplete={handleMarkComplete}
          onClearWeek={handleClearWeek}
          onSaveProgress={saveCurrentWeekDraft}
          onSubmitWeek={handleSubmit}
        />
      </div>
    </TooltipProvider>
  );
};