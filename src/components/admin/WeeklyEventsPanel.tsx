import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWeeklyEvents } from '@/hooks/useWeeklyEvents';
import { useWeeklyEventsSave } from '@/hooks/useWeeklyEventsSave';
import { useWeekDataLoader } from '@/hooks/useWeekDataLoader';
import { CompetitionWinners } from './weekly-events/CompetitionWinners';
import { NomineesSection } from './weekly-events/NomineesSection';
import { PovUsageSection } from './weekly-events/PovUsageSection';
import { EvictionSection } from './weekly-events/EvictionSection';
import { SpecialEventsSection } from './weekly-events/SpecialEventsSection';
import { PointsPreview } from './weekly-events/PointsPreview';
import { DoubleEvictionToggle } from './weekly-events/DoubleEvictionToggle';
import { TripleEvictionToggle } from './weekly-events/TripleEvictionToggle';
import { FinalWeekToggle } from './weekly-events/FinalWeekToggle';
import { FinalWeekSection } from './weekly-events/FinalWeekSection';
import { SecondEvictionSection } from './weekly-events/SecondEvictionSection';
import { ThirdEvictionSection } from './weekly-events/ThirdEvictionSection';
import { JuryPhaseToggle } from './weekly-events/JuryPhaseToggle';
import { WeekNavigator } from './weekly-events/WeekNavigator';
import { WeekControls } from './weekly-events/WeekControls';
import { useScoringRules } from '@/hooks/useScoringRules';

export const WeeklyEventsPanel: React.FC = () => {
  const {
    contestants,
    scoringRules,
    loading,
    currentWeek,
    eventForm,
    setEventForm,
    getPointsPreview,
    handleSubmitWeek,
    loadData
  } = useWeeklyEvents();
  
  const { getWinnerPoints, getRunnerUpPoints } = useScoringRules();
  const { isAutoSaving, saveCurrentWeekDraft } = useWeeklyEventsSave(eventForm, currentWeek);
  const { loadWeekData, clearWeekData, isLoading: isLoadingWeek } = useWeekDataLoader(contestants);
  const [isWeekComplete, setIsWeekComplete] = useState(false);

  const handleWeekChange = async (newWeek: number) => {
    const weekData = await loadWeekData(newWeek);
    setEventForm(weekData);
    
    // Check if week is complete (not a draft)
    const { data: weekResult } = await supabase
      .from('weekly_results')
      .select('is_draft')
      .eq('week_number', newWeek)
      .maybeSingle();
    
    setIsWeekComplete(!weekResult?.is_draft);
  };

  const handleMarkComplete = (complete: boolean) => {
    setIsWeekComplete(complete);
  };

  const handleClearWeek = async () => {
    await clearWeekData(eventForm.week);
    // Reset form to defaults
    setEventForm(prev => ({
      ...prev,
      nominees: ['', ''],
      hohWinner: '',
      povWinner: '',
      povUsed: false,
      povUsedOn: '',
      replacementNominee: '',
      evicted: '',
      isDoubleEviction: false,
      isTripleEviction: false,
      isJuryPhase: false,
      specialEvents: []
    }));
    setIsWeekComplete(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading weekly events panel...</div>;
  }

  const activeContestants = contestants.filter(c => c.isActive);
  const pointsPreview = getPointsPreview();
  const evictedThisWeek = [eventForm.evicted, eventForm.secondEvicted, eventForm.thirdEvicted]
    .filter(evicted => evicted && evicted !== 'no-eviction');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Week {eventForm.week} Events
            </div>
            <WeekNavigator
              currentWeek={eventForm.week}
              onWeekChange={handleWeekChange}
              isLoading={isLoadingWeek}
            />
          </CardTitle>
          <CardDescription className="text-purple-100">
            Record all events for the week and automatically calculate points
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Week Controls */}
          <WeekControls
            weekNumber={eventForm.week}
            isComplete={isWeekComplete}
            onMarkComplete={handleMarkComplete}
            onClearWeek={handleClearWeek}
            onSaveProgress={saveCurrentWeekDraft}
            onSubmitWeek={handleSubmitWeek}
            isAutoSaving={isAutoSaving}
          />

          {/* Special Week Toggles - Horizontal Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Final Week Section (replaces regular week content) */}
          {eventForm.isFinalWeek ? (
            <FinalWeekSection
              eventForm={eventForm}
              setEventForm={setEventForm}
              activeContestants={activeContestants}
            />
          ) : (
            <>
              {/* Regular Week Content */}
              <div className={eventForm.isDoubleEviction ? "border rounded-lg p-4 bg-blue-50 border-blue-200" : ""}>
                {eventForm.isDoubleEviction && (
                  <h3 className="text-lg font-semibold mb-4 text-blue-800">First Eviction</h3>
                )}
                
                {/* Competition Winners */}
                <CompetitionWinners
                  eventForm={eventForm}
                  setEventForm={setEventForm}
                  activeContestants={activeContestants}
                />

                {/* Nominees */}
                <NomineesSection
                  eventForm={eventForm}
                  setEventForm={setEventForm}
                  activeContestants={activeContestants}
                />

                {/* POV Usage and Replacement */}
                <PovUsageSection
                  eventForm={eventForm}
                  setEventForm={setEventForm}
                  activeContestants={activeContestants}
                />

                {/* Evicted Contestant */}
                <EvictionSection
                  eventForm={eventForm}
                  setEventForm={setEventForm}
                  activeContestants={activeContestants}
                />
              </div>

              {/* Second Eviction (only shown for double eviction weeks) */}
              {eventForm.isDoubleEviction && (
                <SecondEvictionSection
                  eventForm={eventForm}
                  setEventForm={setEventForm}
                  activeContestants={activeContestants}
                />
              )}

              {/* Third Eviction (only shown for triple eviction weeks) */}
              {eventForm.isTripleEviction && (
                <ThirdEvictionSection
                  eventForm={eventForm}
                  setEventForm={setEventForm}
                  activeContestants={activeContestants}
                />
              )}

              {/* Special Events */}
              <SpecialEventsSection
                eventForm={eventForm}
                setEventForm={setEventForm}
                activeContestants={activeContestants}
                scoringRules={scoringRules}
              />
            </>
          )}

          {/* Points Preview */}
          <PointsPreview 
            pointsPreview={pointsPreview} 
            contestants={contestants}
            evictedThisWeek={evictedThisWeek}
          />
        </CardContent>
      </Card>
    </div>
  );
};