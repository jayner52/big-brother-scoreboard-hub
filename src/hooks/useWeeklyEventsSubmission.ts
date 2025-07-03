import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { calculatePoints } from '@/utils/weeklyEventsUtils';

export const useWeeklyEventsSubmission = (
  contestants: ContestantWithBio[],
  scoringRules: DetailedScoringRule[]
) => {
  const { toast } = useToast();

  const handleSubmitWeek = async (eventForm: WeeklyEventForm, loadData: () => void) => {
    try {
      // First delete existing data for this week to avoid duplicates
      await Promise.all([
        supabase.from('weekly_events').delete().eq('week_number', eventForm.week),
        supabase.from('special_events').delete().eq('week_number', eventForm.week)
      ]);

      // Create weekly events entries
      const events = [];
      
      // Add HOH winner
      if (eventForm.hohWinner && eventForm.hohWinner !== 'no-winner') {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.hohWinner)?.id,
          event_type: 'hoh_winner',
          points_awarded: calculatePoints('hoh_winner', undefined, scoringRules)
        });
      }

      // Add POV winner
      if (eventForm.povWinner && eventForm.povWinner !== 'no-winner') {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.povWinner)?.id,
          event_type: 'pov_winner',
          points_awarded: calculatePoints('pov_winner', undefined, scoringRules)
        });
      }

      // Add POV used on someone (1 point)
      if (eventForm.povUsed && eventForm.povUsedOn) {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.povUsedOn)?.id,
          event_type: 'pov_used_on',
          points_awarded: 1
        });
      }

      // Add nominees
      eventForm.nominees.filter(n => n).forEach((nominee, index) => {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === nominee)?.id,
          event_type: 'nominee',
          points_awarded: calculatePoints('nominee', undefined, scoringRules)
        });
      });

      // Add replacement nominee
      if (eventForm.replacementNominee) {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.replacementNominee)?.id,
          event_type: 'replacement_nominee',
          points_awarded: calculatePoints('replacement_nominee', undefined, scoringRules)
        });
      }

      // Add evicted contestant
      if (eventForm.evicted && eventForm.evicted !== 'no-eviction') {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.evicted)?.id,
          event_type: 'evicted',
          points_awarded: 0 // No points for being evicted
        });
      }

    // Add survival points for non-evicted contestants
    const currentWeekEvicted = [eventForm.evicted, eventForm.secondEvicted, eventForm.thirdEvicted]
      .filter(name => name && name !== 'no-eviction');
    
    // Get all evicted contestants from database to determine who's active
    const { data: allEvictedData } = await supabase
      .from('weekly_events')
      .select('contestants!inner(name)')
      .eq('event_type', 'evicted');
    
    const allEvictedNames = allEvictedData?.map(event => (event.contestants as any).name) || [];
    const currentlyEvicted = [...allEvictedNames, ...currentWeekEvicted];
    
    const survivingContestants = contestants.filter(c => !currentlyEvicted.includes(c.name));
      
    survivingContestants.forEach(contestant => {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestant.id,
          event_type: 'survival',
          points_awarded: calculatePoints('survival', undefined, scoringRules)
        });
      });

      // Add BB Arena winner points
      if (eventForm.aiArenaWinner) {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.aiArenaWinner)?.id,
          event_type: 'bb_arena_winner',
          points_awarded: calculatePoints('bb_arena_winner', undefined, scoringRules)
        });
      }

      // Add jury points if jury phase starts this week
      if (eventForm.isJuryPhase) {
        survivingContestants.forEach(contestant => {
          events.push({
            week_number: eventForm.week,
            contestant_id: contestant.id,
            event_type: 'jury_member',
            points_awarded: calculatePoints('jury_member', undefined, scoringRules)
          });
        });
      }

      // Filter out events with missing contestant_id
      const validEvents = events.filter(e => e.contestant_id);
      
      if (validEvents.length > 0) {
        const { error: eventsError } = await supabase
          .from('weekly_events')
          .insert(validEvents);

        if (eventsError) throw eventsError;
      }

      // Insert special events
      const specialEvents = eventForm.specialEvents
        .filter(se => se.contestant && se.eventType)
        .map(se => ({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === se.contestant)?.id,
          event_type: se.eventType,
          description: se.description,
          points_awarded: calculatePoints(se.eventType, se.customPoints, scoringRules)
        }))
        .filter(se => se.contestant_id);

      if (specialEvents.length > 0) {
        const { error: specialError } = await supabase
          .from('special_events')
          .insert(specialEvents);

        if (specialError) throw specialError;
      }

      // Update evicted contestant statuses
      const evictedNames = [eventForm.evicted, eventForm.secondEvicted, eventForm.thirdEvicted]
        .filter(name => name && name !== 'no-eviction');
      
      for (const evictedName of evictedNames) {
        const { error: contestantError } = await supabase
          .from('contestants')
          .update({ is_active: false })
          .eq('name', evictedName);

        if (contestantError) throw contestantError;
      }

      // Update or insert into weekly_results table
      const weekData = {
        week_number: eventForm.week,
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

      // Check if week already exists
      const { data: existingWeek } = await supabase
        .from('weekly_results')
        .select('id')
        .eq('week_number', eventForm.week)
        .single();

      if (existingWeek) {
        // Update existing week
        const { error: updateError } = await supabase
          .from('weekly_results')
          .update(weekData)
          .eq('week_number', eventForm.week);
        
        if (updateError) throw updateError;
      } else {
        // Insert new week
        const { error: insertError } = await supabase
          .from('weekly_results')
          .insert(weekData);
        
        if (insertError) throw insertError;
      }

      toast({
        title: "Success!",
        description: `Week ${eventForm.week} events recorded successfully`,
      });

      // Fix 4: Update current game week to advance to next week dynamically
      try {
        const { error: weekUpdateError } = await supabase.rpc('update_current_game_week', { 
          new_week_number: eventForm.week + 1 
        });
        if (weekUpdateError) {
          console.error('Error updating current game week:', weekUpdateError);
          throw weekUpdateError;
        }
        console.log(`Successfully advanced current game week to ${eventForm.week + 1}`);
      } catch (error) {
        console.error('Failed to update current game week:', error);
        toast({
          title: "Warning",
          description: "Week submitted but failed to advance current game week",
          variant: "destructive",
        });
      }

      // Reload data
      loadData();

    } catch (error) {
      console.error('Error submitting week:', error);
      toast({
        title: "Error",
        description: "Failed to record weekly events",
        variant: "destructive",
      });
    }
  };

  return {
    handleSubmitWeek
  };
};