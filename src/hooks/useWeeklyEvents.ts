import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyEventForm } from '@/types/admin';
import { useWeekAwareContestants } from '@/hooks/useWeekAwareContestants';
import { useWeeklyEventsData } from '@/hooks/useWeeklyEventsData';
import { useWeeklyEventsSubmission } from '@/hooks/useWeeklyEventsSubmission';
import { getPointsPreview, calculatePoints } from '@/utils/weeklyEventsUtils';
import { usePool } from '@/contexts/PoolContext';

export const useWeeklyEvents = () => {
  const { activePool } = usePool();
  const {
    contestants: globalContestants,
    scoringRules,
    loading,
    currentGameWeek,
    editingWeek,
    loadData
  } = useWeeklyEventsData(activePool?.id);

  const [eventForm, setEventForm] = useState<WeeklyEventForm | null>(null);
  
  // Get week-aware contestants for the current editing week
  const { allContestants: weekAwareContestants } = useWeekAwareContestants(eventForm?.week || editingWeek || 1);
  
  const { handleSubmitWeek } = useWeeklyEventsSubmission(weekAwareContestants, scoringRules, activePool?.id || '');

  // Load week data when editingWeek changes or on initial load
  useEffect(() => {
    if (!loading && globalContestants.length > 0 && editingWeek) {
      console.log('🔄 Loading week data for week:', editingWeek);
      // Import the loadWeekData function
      const loadWeekData = async () => {
        try {
          const { data: weekData } = await supabase
            .from('weekly_results')
            .select('*')
            .eq('week_number', editingWeek)
            .eq('pool_id', activePool?.id)
            .maybeSingle();

          const { data: specialEventsData } = await supabase
            .from('special_events')
            .select('*')
            .eq('week_number', editingWeek)
            .eq('pool_id', activePool?.id);

          // Get special events from both sources
          const dbSpecialEvents = (specialEventsData || []).map(event => {
            const contestant = globalContestants.find(c => c.id === event.contestant_id);
            return {
              contestant: contestant?.name || '',
              eventType: event.event_type,
              description: event.description || '',
              customPoints: event.points_awarded || 0
            };
          });

          // Parse draft special events from JSON if they exist
          let draftSpecialEvents: any[] = [];
          if (weekData?.draft_special_events) {
            try {
              const parsedEvents = JSON.parse(weekData.draft_special_events);
              console.log('Parsed draft special events:', parsedEvents);
              
              // Map the saved format to the expected form format with proper field preservation
              draftSpecialEvents = parsedEvents.map((event: any, index: number) => ({
                id: event.id || `draft-event-${index}`, // Preserve or generate stable ID
                contestant: event.contestant || '',
                eventType: event.eventType || event.event_type || '',
                description: event.description || '',
                customPoints: event.customPoints !== undefined ? event.customPoints : event.points_awarded,
                customDescription: event.customDescription || '',
                customEmoji: event.customEmoji || '✨'
              }));
              
              console.log('Mapped draft special events:', draftSpecialEvents);
            } catch (error) {
              console.error('Error parsing draft special events:', error);
            }
          }

          // Combine both sources, prioritizing draft events for draft weeks
          const specialEvents = weekData?.is_draft ? draftSpecialEvents : dbSpecialEvents;

          console.log('🔍 Loading week data for week', editingWeek, 'weekData:', weekData);
          
          // Determine if this is a final week based on final week data
          const isFinalWeek = !!(weekData?.winner || weekData?.runner_up || weekData?.americas_favorite_player);
          console.log('🏁 Week data analysis:', { 
            week: editingWeek, 
            hasWinner: !!weekData?.winner,
            hasRunnerUp: !!weekData?.runner_up,
            hasAfp: !!weekData?.americas_favorite_player,
            isFinalWeek 
          });

          const formData: WeeklyEventForm = {
            week: editingWeek,
            nominees: weekData?.nominees || ['', ''],
            hohWinner: weekData?.hoh_winner || '',
            povWinner: weekData?.pov_winner || '',
            povUsed: weekData?.pov_used || false,
            povUsedOn: weekData?.pov_used_on || '',
            replacementNominee: weekData?.replacement_nominee || '',
            evicted: weekData?.evicted_contestant || '',
            isDoubleEviction: weekData?.is_double_eviction || false,
            isTripleEviction: weekData?.is_triple_eviction || false,
            isFinalWeek: isFinalWeek, // Use calculated final week status
            isJuryPhase: weekData?.jury_phase_started || false,
            aiArenaEnabled: weekData?.ai_arena_enabled || false,
            aiArenaWinner: weekData?.ai_arena_winner || '',
            secondHohWinner: weekData?.second_hoh_winner || '',
            secondNominees: weekData?.second_nominees || ['', ''],
            secondPovWinner: weekData?.second_pov_winner || '',
            secondPovUsed: weekData?.second_pov_used || false,
            secondPovUsedOn: weekData?.second_pov_used_on || '',
            secondReplacementNominee: weekData?.second_replacement_nominee || '',
            secondEvicted: weekData?.second_evicted_contestant || '',
            thirdHohWinner: weekData?.third_hoh_winner || '',
            thirdNominees: ['', ''],
            thirdPovWinner: weekData?.third_pov_winner || '',
            thirdPovUsed: false,
            thirdPovUsedOn: '',
            thirdReplacementNominee: '',
            thirdEvicted: weekData?.third_evicted_contestant || '',
            maxNominees: 4,
            specialEvents,
            winner: weekData?.winner || '',
            runnerUp: weekData?.runner_up || '',
            americasFavorite: weekData?.americas_favorite_player || ''
          };

          console.log('🔍 Setting form data:', formData);
          setEventForm(formData);
        } catch (error) {
          console.error('Error loading week data:', error);
        }
      };

      loadWeekData();
    }
  }, [editingWeek, loading, globalContestants]);

  // Get evicted contestants for current week context
  const { evictedContestants: allEvictedUpToThisWeek } = useWeekAwareContestants(eventForm?.week || 1);

  const getFormPointsPreview = () => {
    if (!eventForm) return {};
    
    // Calculate regular points
    let pointsPreview = getPointsPreview(eventForm, weekAwareContestants, allEvictedUpToThisWeek, scoringRules);
    
    // Add final week points if it's final week
    if (eventForm.isFinalWeek) {
      const winnerPoints = scoringRules.find(rule => rule.category === 'final_placement' && rule.subcategory === 'winner')?.points || 50;
      const runnerUpPoints = scoringRules.find(rule => rule.category === 'final_placement' && rule.subcategory === 'runner_up')?.points || 25;
      const afpPoints = scoringRules.find(rule => 
        (rule.category === 'special_achievements' && rule.subcategory === 'americas_favorite') ||
        (rule.category === 'final_placement' && rule.subcategory === 'americas_favorite') ||
        (rule.category === 'bonus_achievements' && rule.subcategory === 'americas_favorite')
      )?.points || 15;
      
      if (eventForm.winner) {
        pointsPreview[eventForm.winner] = (pointsPreview[eventForm.winner] || 0) + winnerPoints;
      }
      if (eventForm.runnerUp) {
        pointsPreview[eventForm.runnerUp] = (pointsPreview[eventForm.runnerUp] || 0) + runnerUpPoints;
      }
      if (eventForm.americasFavorite) {
        pointsPreview[eventForm.americasFavorite] = (pointsPreview[eventForm.americasFavorite] || 0) + afpPoints;
      }
    }
    
    return pointsPreview;
  };

  const calculateEventPoints = (eventType: string, customPoints?: number) => {
    return calculatePoints(eventType, customPoints, scoringRules);
  };

  const submitWeek = async () => {
    if (!eventForm) return;
    
    console.log('🚀 Submitting week:', eventForm.week, 'isFinalWeek:', eventForm.isFinalWeek);
    
    await handleSubmitWeek(eventForm, async () => {
      // Only handle post-submission logic for NON-final weeks
      if (eventForm.isFinalWeek) {
        console.log('🏁 Final week submitted - staying on current week for season completion');
        // For final week, just reload data but don't reset form or advance week
        loadData();
        return;
      }
      
      // For regular weeks, find next sequential week to edit
      const { data: completedWeeks } = await supabase
        .from('weekly_results')
        .select('week_number')
        .eq('pool_id', activePool?.id)
        .eq('is_draft', false)
        .order('week_number', { ascending: false });
      
      const highestCompletedWeek = completedWeeks?.[0]?.week_number || 0;
      const nextWeek = highestCompletedWeek + 1;
      
      console.log('📈 Regular week completed - advancing to week', nextWeek);
      
      // Reset form for next sequential week
      setEventForm({
        week: nextWeek,
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
      });
      
      loadData();
    });
  };

  return {
    contestants: weekAwareContestants,
    scoringRules,
    loading,
    currentGameWeek,
    editingWeek,
    eventForm,
    setEventForm,
    getPointsPreview: getFormPointsPreview,
    handleSubmitWeek: submitWeek,
    calculatePoints: calculateEventPoints,
    loadData
  };
};
