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
    nominees: [],
    hohWinner: '',
    povWinner: '',
    povUsed: false,
    replacementNominee: '',
    evicted: '',
    specialEvents: []
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
      setEventForm(prev => ({ ...prev, week: nextWeek }));

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

  const calculatePoints = (eventType: string) => {
    const rule = scoringRules.find(r => 
      r.subcategory === eventType || 
      (r.category === 'weekly_competition' && eventType.includes(r.subcategory || ''))
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
    
    // Nominee points
    eventForm.nominees.forEach(nominee => {
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
      preview[contestant.name] = (preview[contestant.name] || 0) + calculatePoints('weekly_survival');
    });
    
    // Special events points
    eventForm.specialEvents.forEach(se => {
      if (se.contestant && se.eventType) {
        preview[se.contestant] = (preview[se.contestant] || 0) + calculatePoints(se.eventType);
      }
    });
    
    return preview;
  };

  const handleSubmitWeek = async () => {
    try {
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
      eventForm.nominees.forEach((nominee, index) => {
        events.push({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === nominee)?.id,
          event_type: index === 0 ? 'nominee_1' : 'nominee_2',
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
          event_type: 'weekly_survival',
          points_awarded: calculatePoints('weekly_survival')
        });
      });

      // Insert weekly events
      const { error: eventsError } = await supabase
        .from('weekly_events')
        .insert(events);

      if (eventsError) throw eventsError;

      // Insert special events
      const specialEvents = eventForm.specialEvents
        .filter(se => se.contestant && se.eventType)
        .map(se => ({
          week_number: eventForm.week,
          contestant_id: contestants.find(c => c.name === se.contestant)?.id,
          event_type: se.eventType,
          description: se.description,
          points_awarded: calculatePoints(se.eventType)
        }));

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

      // Insert into legacy weekly_results table for compatibility
      const { error: weeklyError } = await supabase
        .from('weekly_results')
        .insert({
          week_number: eventForm.week,
          hoh_winner: (eventForm.hohWinner && eventForm.hohWinner !== 'no-winner') ? eventForm.hohWinner : null,
          pov_winner: (eventForm.povWinner && eventForm.povWinner !== 'no-winner') ? eventForm.povWinner : null,
          evicted_contestant: (eventForm.evicted && eventForm.evicted !== 'no-eviction') ? eventForm.evicted : null,
        });

      if (weeklyError) throw weeklyError;

      toast({
        title: "Success!",
        description: `Week ${eventForm.week} events recorded successfully`,
      });

      // Reset form for next week
      setEventForm({
        week: eventForm.week + 1,
        nominees: [],
        hohWinner: '',
        povWinner: '',
        povUsed: false,
        replacementNominee: '',
        evicted: '',
        specialEvents: []
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