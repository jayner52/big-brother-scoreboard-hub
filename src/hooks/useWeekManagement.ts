import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyEventForm } from '@/types/admin';
import { useWeekDataLoader } from './useWeekDataLoader';
import { ContestantWithBio } from '@/types/admin';

export const useWeekManagement = (
  contestants: ContestantWithBio[],
  setEventForm: React.Dispatch<React.SetStateAction<WeeklyEventForm>>,
  eventForm: WeeklyEventForm
) => {
  const [isWeekComplete, setIsWeekComplete] = useState(false);
  const { toast } = useToast();
  const { loadWeekData, clearWeekData, isLoading: isLoadingWeek } = useWeekDataLoader(contestants);

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

  const handleClearWeek = async (weekNumber: number) => {
    await clearWeekData(weekNumber);
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

  return {
    isWeekComplete,
    isLoadingWeek,
    handleWeekChange,
    handleMarkComplete,
    handleClearWeek,
    setIsWeekComplete
  };
};