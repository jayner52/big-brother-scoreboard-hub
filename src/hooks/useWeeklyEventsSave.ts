import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyEventForm } from '@/types/admin';

export const useWeeklyEventsSave = (eventForm: WeeklyEventForm, currentWeek: number) => {
  const { toast } = useToast();
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Auto-save whenever form changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveCurrentWeekDraft();
    }, 2000); // Save after 2 seconds of no changes

    return () => clearTimeout(timeoutId);
  }, [eventForm]);

  const saveCurrentWeekDraft = async () => {
    // Only save if there's meaningful data
    if (!eventForm.hohWinner && !eventForm.povWinner && eventForm.nominees.every(n => !n)) {
      return;
    }

    setIsAutoSaving(true);
    try {
      const { data: existingWeek } = await supabase
        .from('weekly_results')
        .select('id')
        .eq('week_number', eventForm.week)
        .single();

      const weekData = {
        week_number: eventForm.week,
        hoh_winner: eventForm.hohWinner || null,
        pov_winner: eventForm.povWinner || null,
        nominees: eventForm.nominees.filter(n => n),
        pov_used: eventForm.povUsed,
        pov_used_on: eventForm.povUsedOn || null,
        replacement_nominee: eventForm.replacementNominee || null,
        evicted_contestant: eventForm.evicted !== 'no-eviction' ? eventForm.evicted : null,
        is_double_eviction: eventForm.isDoubleEviction,
        is_triple_eviction: eventForm.isTripleEviction,
        jury_phase_started: eventForm.isJuryPhase,
        is_draft: true, // Mark as draft
        // Store AI Arena state in draft
        ai_arena_enabled: eventForm.aiArenaEnabled || false,
        ai_arena_winner: eventForm.aiArenaWinner || null,
        second_hoh_winner: eventForm.secondHohWinner || null,
        second_pov_winner: eventForm.secondPovWinner || null,
        second_nominees: eventForm.secondNominees.filter(n => n),
        second_pov_used: eventForm.secondPovUsed,
        second_pov_used_on: eventForm.secondPovUsedOn || null,
        second_replacement_nominee: eventForm.secondReplacementNominee || null,
        second_evicted_contestant: eventForm.secondEvicted || null,
        third_hoh_winner: eventForm.thirdHohWinner || null,
        third_pov_winner: eventForm.thirdPovWinner || null,
        third_evicted_contestant: eventForm.thirdEvicted || null
      };

      if (existingWeek) {
        // Update existing draft
        await supabase
          .from('weekly_results')
          .update(weekData)
          .eq('id', existingWeek.id);
      } else {
        // Create new draft
        await supabase
          .from('weekly_results')
          .insert(weekData);
      }

    } catch (error) {
      console.error('Error auto-saving week:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  return {
    isAutoSaving,
    saveCurrentWeekDraft
  };
};