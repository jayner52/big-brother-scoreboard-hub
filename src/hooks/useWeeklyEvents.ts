import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyEventForm } from '@/types/admin';
import { useWeekAwareContestants } from '@/hooks/useWeekAwareContestants';
import { useWeeklyEventsData } from '@/hooks/useWeeklyEventsData';
import { useWeeklyEventsSubmission } from '@/hooks/useWeeklyEventsSubmission';
import { getPointsPreview, calculatePoints } from '@/utils/weeklyEventsUtils';

export const useWeeklyEvents = () => {
  const {
    contestants,
    scoringRules,
    loading,
    currentGameWeek,
    editingWeek,
    loadData
  } = useWeeklyEventsData();

  const { handleSubmitWeek } = useWeeklyEventsSubmission(contestants, scoringRules);
  
  const [eventForm, setEventForm] = useState<WeeklyEventForm>({
    week: 1,
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

  // Update form week when editingWeek changes
  useEffect(() => {
    setEventForm(prev => ({ ...prev, week: editingWeek }));
  }, [editingWeek]);

  // Get evicted contestants for current week context
  const { evictedContestants: allEvictedUpToThisWeek } = useWeekAwareContestants(eventForm.week);

  const getFormPointsPreview = () => {
    return getPointsPreview(eventForm, contestants, allEvictedUpToThisWeek, scoringRules);
  };

  const calculateEventPoints = (eventType: string, customPoints?: number) => {
    return calculatePoints(eventType, customPoints, scoringRules);
  };

  const submitWeek = async () => {
    await handleSubmitWeek(eventForm, async () => {
      // Find next sequential week to edit
      const { data: completedWeeks } = await supabase
        .from('weekly_results')
        .select('week_number')
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