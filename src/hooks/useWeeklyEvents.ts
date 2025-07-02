import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';

export const useWeeklyEvents = () => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<ContestantWithBio[]>([]);
  const [scoringRules, setScoringRules] = useState<DetailedScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  
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

  const loadData = async () => {
    try {
      // Load contestants
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .order('name');
      
      if (contestantsData) {
        const mapped = contestantsData.map(c => ({
          id: c.id,
          name: c.name,
          isActive: c.is_active,
          group_id: c.group_id,
          sort_order: c.sort_order,
          bio: c.bio,
          photo_url: c.photo_url
        }));
        setContestants(mapped);
      }

      // Load scoring rules
      const { data: rulesData } = await supabase
        .from('detailed_scoring_rules')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });
      
      if (rulesData) {
        const mappedRules = rulesData.map(r => ({
          ...r,
          created_at: new Date(r.created_at)
        }));
        setScoringRules(mappedRules);
      }

      // Get current week number
      const { data: weeklyData } = await supabase
        .from('weekly_results')
        .select('week_number')
        .order('week_number', { ascending: false })
        .limit(1);
      
      const nextWeek = weeklyData?.[0]?.week_number ? weeklyData[0].week_number + 1 : 1;
      setCurrentWeek(nextWeek);
      setEventForm(prev => ({ ...prev, week: nextWeek, nominees: ['', ''], secondNominees: ['', ''] }));

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = (eventType: string, customPoints?: number) => {
    if (eventType === 'custom' && customPoints !== undefined) {
      return customPoints;
    }
    const rule = scoringRules.find(r => 
      r.subcategory === eventType || 
      (r.category === 'competitions' && r.subcategory === eventType) ||
      (r.category === 'weekly' && r.subcategory === eventType) ||
      (r.category === 'final_placement' && r.subcategory === eventType) ||
      (r.category === 'penalties' && r.subcategory === eventType) ||
      (r.category === 'special_events' && r.subcategory === eventType) ||
      (r.category === 'jury' && r.subcategory === eventType)
    );
    return rule?.points || 0;
  };

  const getPointsPreview = () => {
    const preview: Record<string, number> = {};
    
    // HOH points
    if (eventForm.hohWinner && eventForm.hohWinner !== 'no-winner') {
      preview[eventForm.hohWinner] = (preview[eventForm.hohWinner] || 0) + calculatePoints('hoh_winner');
    }
    
    // POV points
    if (eventForm.povWinner && eventForm.povWinner !== 'no-winner') {
      preview[eventForm.povWinner] = (preview[eventForm.povWinner] || 0) + calculatePoints('pov_winner');
    }
    
    // Nominee points (only add if nominee is not empty)
    eventForm.nominees.filter(nominee => nominee).forEach(nominee => {
      preview[nominee] = (preview[nominee] || 0) + calculatePoints('nominee');
    });
    
    // Replacement nominee points
    if (eventForm.replacementNominee) {
      preview[eventForm.replacementNominee] = (preview[eventForm.replacementNominee] || 0) + calculatePoints('replacement_nominee');
    }
    
    // Survival points for all active except evicted
    const activeContestants = contestants.filter(c => c.isActive && 
      (eventForm.evicted === 'no-eviction' || c.name !== eventForm.evicted));
    activeContestants.forEach(contestant => {
      preview[contestant.name] = (preview[contestant.name] || 0) + calculatePoints('survival');
    });
    
    // Jury phase points (if enabled this week)
    if (eventForm.isJuryPhase) {
      activeContestants.forEach(contestant => {
        preview[contestant.name] = (preview[contestant.name] || 0) + calculatePoints('jury_member');
      });
    }
    
    // Special events points
    eventForm.specialEvents.forEach(se => {
      if (se.contestant && se.eventType) {
        preview[se.contestant] = (preview[se.contestant] || 0) + calculatePoints(se.eventType, se.customPoints);
      }
    });
    
    // Double eviction second round points
    if (eventForm.isDoubleEviction) {
      // Second HOH points
      if (eventForm.secondHohWinner && eventForm.secondHohWinner !== 'no-winner') {
        preview[eventForm.secondHohWinner] = (preview[eventForm.secondHohWinner] || 0) + calculatePoints('hoh_winner');
      }
      
      // Second POV points
      if (eventForm.secondPovWinner && eventForm.secondPovWinner !== 'no-winner') {
        preview[eventForm.secondPovWinner] = (preview[eventForm.secondPovWinner] || 0) + calculatePoints('pov_winner');
      }
      
      // Second nominees points
      eventForm.secondNominees.filter(n => n).forEach(nominee => {
        preview[nominee] = (preview[nominee] || 0) + calculatePoints('nominee');
      });
      
      // Second replacement nominee points
      if (eventForm.secondReplacementNominee) {
        preview[eventForm.secondReplacementNominee] = (preview[eventForm.secondReplacementNominee] || 0) + calculatePoints('replacement_nominee');
      }
    }
    
    // Filter out empty entries (those with 0 or no points)
    const filteredPreview: Record<string, number> = {};
    Object.entries(preview).forEach(([name, points]) => {
      if (points > 0 && name.trim()) {
        filteredPreview[name] = points;
      }
    });
    
    return filteredPreview;
  };

  const handleSubmitWeek = async () => {
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
          points_awarded: calculatePoints('hoh_winner')
        });
      }

      // Add POV winner
      if (eventForm.povWinner && eventForm.povWinner !== 'no-winner') {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.povWinner)?.id,
          event_type: 'pov_winner',
          points_awarded: calculatePoints('pov_winner')
        });
      }

      // Add nominees
      eventForm.nominees.filter(n => n).forEach((nominee, index) => {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === nominee)?.id,
          event_type: 'nominee',
          points_awarded: calculatePoints('nominee')
        });
      });

      // Add replacement nominee
      if (eventForm.replacementNominee) {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === eventForm.replacementNominee)?.id,
          event_type: 'replacement_nominee',
          points_awarded: calculatePoints('replacement_nominee')
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

      // Add survival points for non-evicted active contestants
      const evictedId = eventForm.evicted && eventForm.evicted !== 'no-eviction' 
        ? contestants.find(c => c.name === eventForm.evicted)?.id 
        : null;
      const activeContestants = contestants.filter(c => c.isActive && c.id !== evictedId);
      
      activeContestants.forEach(contestant => {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestant.id,
          event_type: 'survival',
          points_awarded: calculatePoints('survival')
        });
      });

      // Add jury points if jury phase starts this week
      if (eventForm.isJuryPhase) {
        activeContestants.forEach(contestant => {
          events.push({
            week_number: eventForm.week,
            contestant_id: contestant.id,
            event_type: 'jury_member',
            points_awarded: calculatePoints('jury_member')
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
          points_awarded: calculatePoints(se.eventType, se.customPoints)
        }))
        .filter(se => se.contestant_id);

      if (specialEvents.length > 0) {
        const { error: specialError } = await supabase
          .from('special_events')
          .insert(specialEvents);

        if (specialError) throw specialError;
      }

      // Update evicted contestant status
      if (eventForm.evicted && eventForm.evicted !== 'no-eviction') {
        const { error: contestantError } = await supabase
          .from('contestants')
          .update({ is_active: false })
          .eq('name', eventForm.evicted);

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

      // Reset form for next week
      setEventForm({
        week: eventForm.week + 1,
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

  useEffect(() => {
    loadData();
  }, []);

  return {
    contestants,
    scoringRules,
    loading,
    currentWeek,
    eventForm,
    setEventForm,
    getPointsPreview,
    handleSubmitWeek,
    calculatePoints,
    loadData
  };
};