import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { useWeeklyEvents } from '@/hooks/useWeeklyEvents';
import { CompetitionWinners } from './weekly-events/CompetitionWinners';
import { NomineesSection } from './weekly-events/NomineesSection';
import { PovUsageSection } from './weekly-events/PovUsageSection';
import { EvictionSection } from './weekly-events/EvictionSection';
import { SpecialEventsSection } from './weekly-events/SpecialEventsSection';
import { PointsPreview } from './weekly-events/PointsPreview';

export const WeeklyEventsPanel: React.FC = () => {
  const {
    contestants,
    scoringRules,
    loading,
    eventForm,
    setEventForm,
    getPointsPreview,
    handleSubmitWeek,
  } = useWeeklyEvents();

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
          </CardTitle>
          <CardDescription className="text-purple-100">
            Record all events for the week and automatically calculate points
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
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

          {/* Special Events */}
          <SpecialEventsSection
            eventForm={eventForm}
            setEventForm={setEventForm}
            activeContestants={activeContestants}
            scoringRules={scoringRules}
          />

          {/* Points Preview */}
          <PointsPreview pointsPreview={pointsPreview} />

          <Button 
            onClick={handleSubmitWeek} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            size="lg"
          >
            Submit Week {eventForm.week} Events & Calculate Points
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};