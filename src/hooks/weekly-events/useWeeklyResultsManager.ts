import { supabase } from '@/integrations/supabase/client';
import { WeeklyEventForm } from '@/types/admin';

export const useWeeklyResultsManager = () => {
  const createOrUpdateWeeklyResults = async (
    eventForm: WeeklyEventForm,
    poolId: string
  ) => {
    console.log('🔍 Creating week data record for week', eventForm.week, 'with form data:', eventForm);
    
    const weekData = {
      week_number: eventForm.week,
      pool_id: poolId,
      hoh_winner: (eventForm.hohWinner && eventForm.hohWinner !== 'no-winner') ? eventForm.hohWinner : null,
      pov_winner: (eventForm.povWinner && eventForm.povWinner !== 'no-winner') ? eventForm.povWinner : null,
      nominees: eventForm.nominees.filter(n => n),
      pov_used: eventForm.povUsed,
      pov_used_on: eventForm.povUsedOn || null,
      replacement_nominee: eventForm.replacementNominee || null,
      evicted_contestant: (eventForm.evicted && eventForm.evicted !== 'no-eviction') ? eventForm.evicted : null,
      is_double_eviction: eventForm.isDoubleEviction,
      is_triple_eviction: eventForm.isTripleEviction,
      jury_phase_started: eventForm.isJuryPhase,
      is_draft: false, // Mark as final when submitted
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

    // Add final week specific data if this is the final week
    if (eventForm.isFinalWeek) {
      Object.assign(weekData, {
        winner: eventForm.winner || null,
        runner_up: eventForm.runnerUp || null,
        americas_favorite_player: eventForm.americasFavorite || null
      });
    }

    // Check if week already exists
    const { data: existingWeek } = await supabase
      .from('weekly_results')
      .select('id')
      .eq('week_number', eventForm.week)
      .eq('pool_id', poolId)
      .single();

    if (existingWeek) {
      // Update existing week
      const { error: updateError } = await supabase
        .from('weekly_results')
        .update(weekData)
        .eq('week_number', eventForm.week)
        .eq('pool_id', poolId);
      
      if (updateError) throw updateError;
    } else {
      // Insert new week
      const { error: insertError } = await supabase
        .from('weekly_results')
        .insert(weekData);
      
      if (insertError) throw insertError;
    }
  };

  const updateEvictedContestantStatuses = async (
    eventForm: WeeklyEventForm,
    poolId: string
  ) => {
    const evictedNames = [eventForm.evicted, eventForm.secondEvicted, eventForm.thirdEvicted]
      .filter(name => name && name !== 'no-eviction');
    
    for (const evictedName of evictedNames) {
      const { error: contestantError } = await supabase
        .from('contestants')
        .update({ is_active: false })
        .eq('name', evictedName)
        .eq('pool_id', poolId);

      if (contestantError) throw contestantError;
    }
  };

  const updateFinalWeekContestantStatuses = async (
    eventForm: WeeklyEventForm,
    poolId: string
  ) => {
    if (!eventForm.isFinalWeek) return;

    // Update winner
    if (eventForm.winner) {
      await supabase
        .from('contestants')
        .update({ final_placement: 1 })
        .eq('name', eventForm.winner)
        .eq('pool_id', poolId);
    }

    // Update runner-up
    if (eventForm.runnerUp) {
      await supabase
        .from('contestants')
        .update({ final_placement: 2 })
        .eq('name', eventForm.runnerUp)
        .eq('pool_id', poolId);
    }

    // Update America's Favorite
    if (eventForm.americasFavorite) {
      await supabase
        .from('contestants')
        .update({ americas_favorite: true })
        .eq('name', eventForm.americasFavorite)
        .eq('pool_id', poolId);
    }
  };

  return { 
    createOrUpdateWeeklyResults, 
    updateEvictedContestantStatuses, 
    updateFinalWeekContestantStatuses 
  };
};