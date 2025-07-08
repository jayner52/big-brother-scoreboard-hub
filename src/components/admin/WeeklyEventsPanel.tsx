import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useWeeklyEvents } from '@/hooks/useWeeklyEvents';
import { useWeeklyEventsSave } from '@/hooks/useWeeklyEventsSave';
import { useWeekManagement } from '@/hooks/useWeekManagement';
import { WeekControls } from './weekly-events/WeekControls';
import { WeeklyEventsHeader } from './weekly-events/WeeklyEventsHeader';
import { WeeklyEventsToggles } from './weekly-events/WeeklyEventsToggles';
import { WeeklyEventsContent } from './weekly-events/WeeklyEventsContent';
import { WeekSelector } from './weekly-events/WeekSelector';
import { FinalWeekBanner } from './weekly-events/FinalWeekBanner';
import { usePool } from '@/contexts/PoolContext';
import { InstructionAccordion } from './InstructionAccordion';

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
      <InstructionAccordion 
        title="How to Record Weekly Events" 
        tabKey="weekly_events"
      >
        <div className="space-y-3">
          <p>Record competition results and evictions for each week. Always complete weeks in order.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="font-semibold text-blue-800 mb-2">📋 Standard Week Process:</p>
            <ol className="list-decimal list-inside ml-2 space-y-1 text-sm text-blue-700">
              <li>Set HoH winner and nominees</li>
              <li>Set PoV winner and usage (if applicable)</li>
              <li>Add replacement nominee if PoV used</li>
              <li>Set evicted houseguest</li>
              <li>Add any special events or competitions</li>
              <li>Review points preview before submitting</li>
            </ol>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded p-3">
            <p className="font-semibold text-purple-800 mb-2">🏆 Final Week & Prize Distribution Process:</p>
            <ol className="list-decimal list-inside ml-2 space-y-1 text-sm text-purple-700">
              <li>Enable "Final Week" toggle</li>
              <li>Set Final HoH winner (Part 3 competition)</li>
              <li>Select season winner (1st place)</li>
              <li>Select runner-up (2nd place)</li>
              <li>Select America's Favorite Player (can be ANY contestant from the season)</li>
              <li><strong>Click "SUBMIT FINAL WEEK RESULTS" button - this does NOT advance to next week</strong></li>
              <li>After submission, scroll down to "Complete Season" section</li>
              <li>System will validate all requirements are met</li>
              <li>Click "Complete Season & Assign Prizes" to finalize the pool</li>
              <li><strong>Prize winners will be automatically notified to submit payment info</strong></li>
              <li>Check Pool Entries tab to manage prize payouts</li>
            </ol>
          </div>

          <p><strong>⚠️ Common mistakes to avoid:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
            <li>Skipping weeks - this will break point calculations</li>
            <li>Forgetting to mark PoV usage when someone uses it</li>
            <li>Not setting replacement nominees when PoV is used</li>
            <li>Missing special events like AI Arena wins</li>
            <li><strong>Final Week: Not clicking "SUBMIT FINAL WEEK RESULTS" after setting winner/runner-up</strong></li>
            <li><strong>Trying to complete season before final week is submitted</strong></li>
            <li><strong>Selecting AFP from only active contestants (AFP can be ANY contestant)</strong></li>
          </ul>

          <p className="text-sm text-gray-600 mt-3">
            💡 <strong>Tip:</strong> The points preview shows exactly what each contestant will earn before you submit. 
            For final week, you'll see winner/runner-up/AFP points added to the preview.
          </p>
        </div>
      </InstructionAccordion>
      
      <Card>
        <WeeklyEventsHeader
          week={eventForm.week}
          currentGameWeek={currentGameWeek}
          onWeekChange={handleWeekChange}
          isLoadingWeek={isLoadingWeek}
        />
        
        <CardContent className="p-3 md:p-6 space-y-4 md:space-y-6">
          {/* Week Selector */}
          <WeekSelector
            currentWeek={eventForm.week}
            onWeekChange={handleWeekChange}
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
            onMarkComplete={handleMarkComplete}
            onClearWeek={() => handleClearWeek(eventForm.week)}
            onSaveProgress={saveCurrentWeekDraft}
            onSubmitWeek={handleSubmitWeek}
            isAutoSaving={isAutoSaving}
            isFinalWeek={eventForm.isFinalWeek}
            isDraft={!isWeekComplete}
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