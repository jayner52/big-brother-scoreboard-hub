import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useWeeklyEvents } from '@/hooks/useWeeklyEvents';
import { useWeeklyEventsSave } from '@/hooks/useWeeklyEventsSave';
import { useWeekManagement } from '@/hooks/useWeekManagement';
import { useAIPopulate } from '@/hooks/useAIPopulate';
import { WeekControls } from './weekly-events/WeekControls';
import { WeeklyEventsHeader } from './weekly-events/WeeklyEventsHeader';
import { WeeklyEventsToggles } from './weekly-events/WeeklyEventsToggles';
import { WeeklyEventsContent } from './weekly-events/WeeklyEventsContent';

import { useScoringRules } from '@/hooks/useScoringRules';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trophy, Sparkles } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';

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
  
  const { getWinnerPoints, getRunnerUpPoints } = useScoringRules();
  const { activePool, updatePool } = usePool();
  const { toast } = useToast();
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
  }, editingWeek);
  
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

  const handleCompleteSeasonWithConfetti = async () => {
    if (!activePool) return;
    
    try {
      const success = await updatePool(activePool.id, {
        finale_week_enabled: true,
        season_locked: true,
        draft_locked: true
      });

      if (success) {
        toast({
          title: "🏆 Season Complete! 🏆",
          description: "Pool has been locked and final standings are displayed. Congratulations to all participants!",
        });
      } else {
        throw new Error('Failed to complete season');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete the season",
        variant: "destructive",
      });
    }
  };

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

          {/* Finale Week Controls */}
          {eventForm?.isFinalWeek && activePool && (
            <div className="border-t pt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      Season Finale
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Complete the season and lock all pool settings
                    </p>
                  </div>
                  {activePool.season_locked ? (
                    <div className="text-green-600 font-medium">✓ Season Complete</div>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                          <Trophy className="h-4 w-4 mr-2" />
                          Complete Season
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Complete Big Brother Season?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-2">
                            <p>This will:</p>
                            <ul className="list-disc ml-4 space-y-1">
                              <li>Lock the pool permanently (no more changes)</li>
                              <li>Enable finale week mode</li>
                              <li>Display final standings to all participants</li>
                              <li>Show congratulations message</li>
                            </ul>
                            <p className="font-medium text-orange-600">
                              ⚠️ This action cannot be undone!
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCompleteSeasonWithConfetti}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                          >
                            Complete Season 🏆
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};