import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Save } from 'lucide-react';
import { useWeeklyEvents } from '@/hooks/useWeeklyEvents';
import { useWeeklyEventsSave } from '@/hooks/useWeeklyEventsSave';
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
import { EnhancedHistoricalWeekSelector } from './weekly-events/EnhancedHistoricalWeekSelector';
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

  if (loading) {
    return <div className="text-center py-8">Loading weekly events panel...</div>;
  }

  const activeContestants = contestants.filter(c => c.isActive);
  const pointsPreview = getPointsPreview();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Week {eventForm.week} Events
            {isAutoSaving && (
              <div className="flex items-center gap-1 ml-auto text-purple-200">
                <Save className="h-4 w-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-purple-100">
            Record all events for the week and automatically calculate points
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Historical Week Management */}
          <EnhancedHistoricalWeekSelector
            onLoadWeek={(weekData) => setEventForm(weekData)}
            currentWeek={currentWeek}
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
          <PointsPreview pointsPreview={pointsPreview} />

          <div className="flex gap-4">
            <Button 
              onClick={saveCurrentWeekDraft}
              variant="outline"
              className="flex-1"
              disabled={isAutoSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
            <Button 
              onClick={handleSubmitWeek} 
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              size="lg"
            >
              Submit & Close Week {eventForm.week}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};