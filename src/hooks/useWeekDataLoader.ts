import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyEventForm, ContestantWithBio } from '@/types/admin';

export const useWeekDataLoader = (contestants: ContestantWithBio[]) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const loadWeekData = async (weekNumber: number): Promise<WeeklyEventForm> => {
    setIsLoading(true);
    try {
      // Load existing week data from weekly_results
      const { data: weekData } = await supabase
        .from('weekly_results')
        .select('*')
        .eq('week_number', weekNumber)
        .maybeSingle();

      // Load special events for this week
      const { data: specialEventsData } = await supabase
        .from('special_events')
        .select('*')
        .eq('week_number', weekNumber);

      // Map special events to form format
      const specialEvents = (specialEventsData || []).map(event => {
        const contestant = contestants.find(c => c.id === event.contestant_id);
        return {
          contestant: contestant?.name || '',
          eventType: event.event_type,
          description: event.description || '',
          customPoints: event.points_awarded || 0
        };
      });

      // Create form data with loaded values or defaults
      const formData: WeeklyEventForm = {
        week: weekNumber,
        nominees: weekData?.nominees || ['', ''],
        hohWinner: weekData?.hoh_winner || '',
        povWinner: weekData?.pov_winner || '',
        povUsed: weekData?.pov_used || false,
        povUsedOn: weekData?.pov_used_on || '',
        replacementNominee: weekData?.replacement_nominee || '',
        evicted: weekData?.evicted_contestant || '',
        isDoubleEviction: weekData?.is_double_eviction || false,
        isTripleEviction: weekData?.is_triple_eviction || false,
        isFinalWeek: false,
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

      return formData;
    } catch (error) {
      console.error('Error loading week data:', error);
      toast({
        title: "Error",
        description: "Failed to load week data",
        variant: "destructive",
      });
      
      // Return default form
      return {
        week: weekNumber,
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
        aiArenaEnabled: false,
        aiArenaWinner: '',
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
      };
    } finally {
      setIsLoading(false);
    }
  };

  const clearWeekData = async (weekNumber: number) => {
    try {
      // Delete all data for this week
      await Promise.all([
        supabase.from('weekly_results').delete().eq('week_number', weekNumber),
        supabase.from('weekly_events').delete().eq('week_number', weekNumber),
        supabase.from('special_events').delete().eq('week_number', weekNumber)
      ]);

      toast({
        title: "Success",
        description: `Week ${weekNumber} data cleared`,
      });
    } catch (error) {
      console.error('Error clearing week data:', error);
      toast({
        title: "Error",
        description: "Failed to clear week data",
        variant: "destructive",
      });
    }
  };

  return {
    loadWeekData,
    clearWeekData,
    isLoading
  };
};