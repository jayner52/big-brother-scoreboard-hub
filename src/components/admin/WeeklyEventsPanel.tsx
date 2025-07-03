import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useWeeklyEvents } from '@/hooks/useWeeklyEvents';
import { useWeeklyEventsSave } from '@/hooks/useWeeklyEventsSave';
import { useWeekDataLoader } from '@/hooks/useWeekDataLoader';
import { WeekControls } from './weekly-events/WeekControls';
import { WeeklyEventsHeader } from './weekly-events/WeeklyEventsHeader';
import { WeeklyEventsToggles } from './weekly-events/WeeklyEventsToggles';
import { WeeklyEventsContent } from './weekly-events/WeeklyEventsContent';
import { useScoringRules } from '@/hooks/useScoringRules';
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
  const { isAutoSaving, saveCurrentWeekDraft } = useWeeklyEventsSave(eventForm, editingWeek);
  const { loadWeekData, clearWeekData, isLoading: isLoadingWeek } = useWeekDataLoader(contestants);
  const [isWeekComplete, setIsWeekComplete] = useState(false);
  const [isAIPopulating, setIsAIPopulating] = useState(false);
  const { toast } = useToast();

  const handleWeekChange = async (newWeek: number) => {
    const weekData = await loadWeekData(newWeek);
    setEventForm(weekData);
    
    // Check if week is complete (not a draft)
    const { data: weekResult } = await supabase
      .from('weekly_results')
      .select('is_draft')
      .eq('week_number', newWeek)
      .maybeSingle();
    
    setIsWeekComplete(weekResult && !weekResult.is_draft);
  };

  const handleMarkComplete = async (complete: boolean) => {
    setIsWeekComplete(complete);
    
    // Generate weekly snapshot when week is marked complete
    if (complete && eventForm.week) {
      try {
        await supabase.rpc('generate_weekly_snapshots', {
          week_num: eventForm.week
        });
      } catch (error) {
        console.error('Error generating weekly snapshot:', error);
      }
    }
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

  const handleAIPopulate = async () => {
    setIsAIPopulating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('bb-ai-populate', {
        body: {
          week: eventForm.week,
          season: 'current',
          confidence_threshold: 0.95
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        // Populate form fields only if confidence >= 95%
        const updates: any = {};
        
        if (data.populated_fields.hoh_winner && data.confidence_scores.hoh_winner >= 0.95) {
          updates.hohWinner = data.populated_fields.hoh_winner;
        }
        
        if (data.populated_fields.pov_winner && data.confidence_scores.pov_winner >= 0.95) {
          updates.povWinner = data.populated_fields.pov_winner;
          // Auto-set POV usage based on data
          if (data.populated_fields.pov_used !== undefined) {
            updates.povUsed = data.populated_fields.pov_used;
          }
        }
        
        if (data.populated_fields.evicted && data.confidence_scores.evicted >= 0.95) {
          updates.evicted = data.populated_fields.evicted;
        }
        
        // Handle nominees - support 3 nominees if AI Arena is detected
        const nomineesToUse = data.populated_fields.initial_nominees || data.populated_fields.nominees;
        if (nomineesToUse && data.confidence_scores.nominees >= 0.95) {
          updates.nominees = nomineesToUse; // Keep all nominees (could be 3 for AI Arena)
        }
        
        // Handle AI Arena winner and enable toggle
        if (data.populated_fields.ai_arena_winner && data.confidence_scores.ai_arena_winner >= 0.95) {
          // Enable AI Arena toggle and set winner
          updates.aiArenaEnabled = true;
          updates.aiArenaWinner = data.populated_fields.ai_arena_winner;
        }
        
        // Handle special events (excluding game mechanics)
        if (data.populated_fields.special_events) {
          const filteredSpecialEvents = data.populated_fields.special_events.filter(event => 
            !['hoh_winner', 'pov_winner', 'bb_arena_winner', 'evicted'].includes(event.eventType)
          );
          if (filteredSpecialEvents.length > 0) {
            updates.specialEvents = [...(updates.specialEvents || []), ...filteredSpecialEvents];
          }
        }
        
        // Update form with populated data
        if (Object.keys(updates).length > 0) {
          setEventForm(prev => ({...prev, ...updates}));
          
          toast({
            title: "AI Population Successful!",
            description: `Populated ${Object.keys(updates).length} fields with high confidence data from ${data.sources_used?.length || 0} sources.`,
          });
        } else {
          toast({
            title: "No High-Confidence Data Found",
            description: "AI couldn't find reliable information with 95%+ confidence for this week.",
            variant: "destructive",
          });
        }
      } else {
        throw new Error(data?.message || 'Failed to populate data');
      }
    } catch (error) {
      console.error('AI populate error:', error);
      toast({
        title: "AI Population Failed",
        description: "Failed to populate with AI. Please try again or enter data manually.",
        variant: "destructive",
      });
    } finally {
      setIsAIPopulating(false);
    }
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
            onClearWeek={handleClearWeek}
            onSaveProgress={saveCurrentWeekDraft}
            onSubmitWeek={handleSubmitWeek}
            onAIPopulate={handleAIPopulate}
            isAutoSaving={isAutoSaving}
            isAIPopulating={isAIPopulating}
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