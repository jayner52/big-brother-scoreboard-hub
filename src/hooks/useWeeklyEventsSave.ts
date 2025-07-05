import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyEventForm } from '@/types/admin';

export const useWeeklyEventsSave = (eventForm: WeeklyEventForm, currentWeek: number, poolId?: string) => {
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
    // Only save if there's meaningful data (any field has content)
    const hasData = eventForm.hohWinner || eventForm.povWinner || eventForm.nominees.some(n => n) || 
                   eventForm.evicted || eventForm.secondEvicted || eventForm.thirdEvicted ||
                   eventForm.replacementNominee || eventForm.povUsedOn || 
                   eventForm.specialEvents.length > 0;
    
    if (!hasData) {
      return;
    }

    setIsAutoSaving(true);
    console.log('Saving week data:', { week: eventForm.week, hohWinner: eventForm.hohWinner, povWinner: eventForm.povWinner });
    
    try {
      const { data: existingWeek, error: queryError } = await supabase
        .from('weekly_results')
        .select('id')
        .eq('week_number', eventForm.week)
        .eq('pool_id', poolId)
        .maybeSingle();

      if (queryError) {
        console.error('Error querying existing week:', queryError);
        toast({
          title: "Error",
          description: "Failed to check existing week data",
          variant: "destructive"
        });
        return;
      }

      const weekData = {
        week_number: eventForm.week,
        pool_id: poolId,
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
        third_evicted_contestant: eventForm.thirdEvicted || null,
        // Store special events in draft data as JSON
        draft_special_events: eventForm.specialEvents.length > 0 ? JSON.stringify(eventForm.specialEvents) : null
      };

      if (existingWeek) {
        // Update existing draft
        const { error: updateError } = await supabase
          .from('weekly_results')
          .update(weekData)
          .eq('id', existingWeek.id);
        
        if (updateError) {
          console.error('Error updating week:', updateError);
          toast({
            title: "Error",
            description: "Failed to update week data",
            variant: "destructive"
          });
          return;
        }
        console.log('Successfully updated week:', eventForm.week);
      } else {
        // Create new draft
        const { error: insertError } = await supabase
          .from('weekly_results')
          .insert(weekData);
          
        if (insertError) {
          console.error('Error inserting week:', insertError);
          toast({
            title: "Error", 
            description: "Failed to save week data",
            variant: "destructive"
          });
          return;
        }
        console.log('Successfully created new week:', eventForm.week);
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