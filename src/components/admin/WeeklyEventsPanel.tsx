import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useWeeklyEvents } from '@/hooks/useWeeklyEvents';
import { useWeeklyEventsSave } from '@/hooks/useWeeklyEventsSave';
import { useWeekManagement } from '@/hooks/useWeekManagement';
import { WeekControls } from './weekly-events/WeekControls';
import { WeeklyEventsHeader } from './weekly-events/WeeklyEventsHeader';
import { WeeklyEventsToggles } from './weekly-events/WeeklyEventsToggles';
import { WeeklyEventsContent } from './weekly-events/WeeklyEventsContent';
import { usePool } from '@/contexts/PoolContext';

export const WeeklyEventsPanel: React.FC = () => {
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

  if (loading || !eventForm) {
    return <div className="text-center py-8">Loading weekly events panel...</div>;
  }

  const activeContestants = contestants.filter(c => c.isActive);
  const pointsPreview = getPointsPreview();
  const evictedThisWeek = [eventForm.evicted, eventForm.secondEvicted, eventForm.thirdEvicted]
    .filter(evicted => evicted && evicted !== 'no-eviction');

  return (
    <div className="space-y-6">
      <Card>
        <WeeklyEventsHeader
          week={eventForm.week}
          currentGameWeek={currentGameWeek}
          onWeekChange={handleWeekChange}
          isLoadingWeek={isLoadingWeek}
        />
        
        <CardContent className="p-6 space-y-6">

          {/* Week Controls */}
          <WeekControls
            weekNumber={eventForm.week}
            isComplete={isWeekComplete}
            onMarkComplete={handleMarkComplete}
            onClearWeek={() => handleClearWeek(eventForm.week)}
            onSaveProgress={saveCurrentWeekDraft}
            onSubmitWeek={handleSubmitWeek}
            isAutoSaving={isAutoSaving}
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
    </div>
  );
};