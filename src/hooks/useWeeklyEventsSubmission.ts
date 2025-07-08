import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { calculatePoints } from '@/utils/weeklyEventsUtils';
import { useAutoPointsRecalculation } from './useAutoPointsRecalculation';

export const useWeeklyEventsSubmission = (
  contestants: ContestantWithBio[],
  scoringRules: DetailedScoringRule[],
  poolId: string
) => {
  const { toast } = useToast();
  const { triggerRecalculation } = useAutoPointsRecalculation();

  const handleSubmitWeek = async (eventForm: WeeklyEventForm, loadData: () => void) => {
    try {
      // First delete existing data for this week to avoid duplicates
      await Promise.all([
        supabase.from('weekly_events').delete().eq('week_number', eventForm.week).eq('pool_id', poolId),
        supabase.from('special_events').delete().eq('week_number', eventForm.week).eq('pool_id', poolId)
      ]);

      // Create weekly events entries
      const events = [];
      
      // Add HOH winner
      if (eventForm.hohWinner && eventForm.hohWinner !== 'no-winner') {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.hohWinner)?.id,
          event_type: 'hoh_winner',
          points_awarded: calculatePoints('hoh_winner', undefined, scoringRules),
          pool_id: poolId
        });
      }

      // Add POV winner
      if (eventForm.povWinner && eventForm.povWinner !== 'no-winner') {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.povWinner)?.id,
          event_type: 'pov_winner',
          points_awarded: calculatePoints('pov_winner', undefined, scoringRules),
          pool_id: poolId
        });
      }

      // Add POV used on someone (1 point)
      if (eventForm.povUsed && eventForm.povUsedOn) {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.povUsedOn)?.id,
          event_type: 'pov_used_on',
          points_awarded: 1,
          pool_id: poolId
        });
      }

      // Add nominees
      eventForm.nominees.filter(n => n).forEach((nominee, index) => {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === nominee)?.id,
          event_type: 'nominee',
          points_awarded: calculatePoints('nominee', undefined, scoringRules),
          pool_id: poolId
        });
      });

      // Add replacement nominee
      if (eventForm.replacementNominee) {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.replacementNominee)?.id,
          event_type: 'replacement_nominee',
          points_awarded: calculatePoints('replacement_nominee', undefined, scoringRules),
          pool_id: poolId
        });
      }

      // Add evicted contestant
      if (eventForm.evicted && eventForm.evicted !== 'no-eviction') {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.evicted)?.id,
          event_type: 'evicted',
          points_awarded: 0, // No points for being evicted
          pool_id: poolId
        });
      }

    // Add survival points for non-evicted contestants
    const currentWeekEvicted = [eventForm.evicted, eventForm.secondEvicted, eventForm.thirdEvicted]
      .filter(name => name && name !== 'no-eviction');
    
    // Get all evicted contestants from database to determine who's active
    const { data: allEvictedData } = await supabase
      .from('weekly_events')
      .select('contestants!inner(name)')
      .eq('event_type', 'evicted')
      .eq('pool_id', poolId);
    
    const allEvictedNames = allEvictedData?.map(event => (event.contestants as any).name) || [];
    const currentlyEvicted = [...allEvictedNames, ...currentWeekEvicted];
    
    const survivingContestants = contestants.filter(c => !currentlyEvicted.includes(c.name));
      
    survivingContestants.forEach(contestant => {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestant.id,
          event_type: 'survival',
          points_awarded: calculatePoints('survival', undefined, scoringRules),
          pool_id: poolId
        });
      });

      // Add BB Arena winner points
      if (eventForm.aiArenaWinner) {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.aiArenaWinner)?.id,
          event_type: 'bb_arena_winner',
          points_awarded: calculatePoints('bb_arena_winner', undefined, scoringRules),
          pool_id: poolId
        });
      }

      // Add jury points if jury phase starts this week
      if (eventForm.isJuryPhase) {
        survivingContestants.forEach(contestant => {
          events.push({
            week_number: eventForm.week,
            contestant_id: contestant.id,
            event_type: 'jury_member',
            points_awarded: calculatePoints('jury_member', undefined, scoringRules),
            pool_id: poolId
          });
        });
      }

      // Handle Final Week events BEFORE filtering valid events
      if (eventForm.isFinalWeek) {
        // Add final week specific events
        if (eventForm.winner) {
          events.push({
            week_number: eventForm.week,
            contestant_id: contestants.find(c => c.name === eventForm.winner)?.id,
            event_type: 'winner',
            points_awarded: calculatePoints('winner', undefined, scoringRules),
            pool_id: poolId
          });
        }

        if (eventForm.runnerUp) {
          events.push({
            week_number: eventForm.week,
            contestant_id: contestants.find(c => c.name === eventForm.runnerUp)?.id,
            event_type: 'runner_up',
            points_awarded: calculatePoints('runner_up', undefined, scoringRules),
            pool_id: poolId
          });
        }

        if (eventForm.americasFavorite) {
          events.push({
            week_number: eventForm.week,
            contestant_id: contestants.find(c => c.name === eventForm.americasFavorite)?.id,
            event_type: 'americas_favorite',
            points_awarded: calculatePoints('americas_favorite', undefined, scoringRules),
            pool_id: poolId
          });
        }
      }

      // Filter out events with missing contestant_id
      const validEvents = events.filter(e => e.contestant_id);
      
      console.log('🔍 All events created:', events);
      console.log('🔍 Valid events for insertion:', validEvents);
      
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
          points_awarded: calculatePoints(se.eventType, se.customPoints, scoringRules),
          pool_id: poolId
        }))
        .filter(se => se.contestant_id);

      // Handle special houseguest revival automatically
      for (const se of specialEvents) {
        if (se.event_type === 'came_back_after_evicted' && se.contestant_id) {
          console.log('🔄 WeeklyEvents - Auto-reviving houseguest:', se.contestant_id);
          const { error: revivalError } = await supabase
            .from('contestants')
            .update({ is_active: true })
            .eq('id', se.contestant_id)
            .eq('pool_id', poolId);
          
          if (revivalError) {
            console.error('❌ WeeklyEvents - Revival error:', revivalError);
          } else {
            console.log('✅ WeeklyEvents - Houseguest revived successfully');
          }
        }
      }


      // Update evicted contestant statuses
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

      // Update final week contestant statuses
      if (eventForm.isFinalWeek) {
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
      }

      // Update or insert into weekly_results table
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

      // Show different success messages for final week vs regular week
      if (eventForm.isFinalWeek) {
        toast({
          title: "🏆 Final Week Submitted!",
          description: `Season finale results recorded successfully. Ready for season completion.`,
        });
        
        // For final week, reload data and trigger recalculation but don't advance
        loadData();
        await triggerRecalculation(`Final week ${eventForm.week} events submitted`);
        return; // Exit early to prevent week advancement
      } else {
        toast({
          title: "Success!",
          description: `Week ${eventForm.week} events recorded successfully`,
        });

        // Only advance week for non-final weeks
        const completedWeek = eventForm.week;
        
        try {
          // Get all completed weeks to calculate the proper next week
          const { data: allWeeklyResults } = await supabase
            .from('weekly_results')
            .select('week_number, is_draft')
            .eq('is_draft', false)
            .eq('pool_id', poolId)
            .order('week_number', { ascending: true });
          
          const completedWeeks = allWeeklyResults?.map(w => w.week_number) || [];
          const nextWeek = Math.max(...completedWeeks, completedWeek) + 1;
          
          console.log(`Advancing from Week ${completedWeek} to Week ${nextWeek}`);
          
          // Try to update current game week with retry
          let retryCount = 0;
          const maxRetries = 3;
          let weekUpdateError = null;
          
          while (retryCount < maxRetries) {
            const { error } = await supabase.rpc('update_current_game_week', { 
              new_week_number: nextWeek 
            });
            
            if (!error) {
              weekUpdateError = null;
              break;
            }
            
            weekUpdateError = error;
            retryCount++;
            console.warn(`Week advancement attempt ${retryCount} failed:`, error);
            
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
          
          if (weekUpdateError) {
            console.error('Failed to update current game week after retries:', weekUpdateError);
            toast({
              title: "Week Advancement Failed",
              description: `Week ${completedWeek} submitted successfully, but failed to advance to Week ${nextWeek}. Please refresh and check current week.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Week Completed!",
              description: `Week ${completedWeek} completed! Advanced to Week ${nextWeek}`,
            });
            console.log(`✅ Successfully advanced: Week ${completedWeek} → Week ${nextWeek}`);
          }
          
        } catch (error) {
          console.error('Unexpected error during week advancement:', error);
          toast({
            title: "Week Advancement Error",
            description: `Week ${completedWeek} submitted but week advancement failed. Please refresh the page.`,
            variant: "destructive",
          });
        }
      }

      // Reload data and trigger automatic recalculation
      loadData();
      await triggerRecalculation(`Week ${eventForm.week} events submitted`);

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