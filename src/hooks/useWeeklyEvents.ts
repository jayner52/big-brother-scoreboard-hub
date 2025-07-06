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
    contestants,
    scoringRules,
    loading,
    currentGameWeek,
    editingWeek,
    loadData
  } = useWeeklyEventsData(activePool?.id);

  const { handleSubmitWeek } = useWeeklyEventsSubmission(contestants, scoringRules, activePool?.id || '');
  
  const [eventForm, setEventForm] = useState<WeeklyEventForm | null>(null);

  // Load week data when editingWeek changes or on initial load
  useEffect(() => {
    if (!loading && contestants.length > 0 && editingWeek) {
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
            const contestant = contestants.find(c => c.id === event.contestant_id);
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
              
              // Map the saved format to the expected form format
              draftSpecialEvents = parsedEvents.map((event: any) => ({
                contestant: event.contestant || '',
                eventType: event.eventType || event.event_type || '',
                description: event.description || '',
                customPoints: event.customPoints || event.points_awarded || 0
              }));
              
              console.log('Mapped draft special events:', draftSpecialEvents);
            } catch (error) {
              console.error('Error parsing draft special events:', error);
            }
          }

          // Combine both sources, prioritizing draft events for draft weeks
          const specialEvents = weekData?.is_draft ? draftSpecialEvents : dbSpecialEvents;

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
            isFinalWeek: weekData?.finale_week_enabled || false,
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
            winner: '',
            runnerUp: '',
            americasFavorite: ''
          };

          setEventForm(formData);
        } catch (error) {
          console.error('Error loading week data:', error);
        }
      };

      loadWeekData();
    }
  }, [editingWeek, loading, contestants]);

  // Get evicted contestants for current week context
  const { evictedContestants: allEvictedUpToThisWeek } = useWeekAwareContestants(eventForm?.week || 1);

  const getFormPointsPreview = () => {
    if (!eventForm) return {};
    return getPointsPreview(eventForm, contestants, allEvictedUpToThisWeek, scoringRules);
  };

  const calculateEventPoints = (eventType: string, customPoints?: number) => {
    return calculatePoints(eventType, customPoints, scoringRules);
  };

  const submitWeek = async () => {
    if (!eventForm) return;
    await handleSubmitWeek(eventForm, async () => {
      // Find next sequential week to edit
      const { data: completedWeeks } = await supabase
        .from('weekly_results')
        .select('week_number')
        .eq('pool_id', activePool?.id)
        .eq('is_draft', false)
        .order('week_number', { ascending: false });
      
      const highestCompletedWeek = completedWeeks?.[0]?.week_number || 0;
      const nextWeek = highestCompletedWeek + 1;
      
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
    contestants,
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