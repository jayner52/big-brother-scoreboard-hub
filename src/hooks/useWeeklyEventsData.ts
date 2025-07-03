import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, DetailedScoringRule } from '@/types/admin';

export const useWeeklyEventsData = () => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<ContestantWithBio[]>([]);
  const [scoringRules, setScoringRules] = useState<DetailedScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentGameWeek, setCurrentGameWeek] = useState(1);
  const [editingWeek, setEditingWeek] = useState(1);

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

      // Get current game week
      const { data: currentWeekData } = await supabase
        .from('current_game_week')
        .select('week_number')
        .single();
      
      const gameWeek = currentWeekData?.week_number || 1;
      setCurrentGameWeek(gameWeek);
      
      // Get next editing week (highest existing week + 1)
      const { data: weeklyData } = await supabase
        .from('weekly_results')
        .select('week_number')
        .order('week_number', { ascending: false })
        .limit(1);
      
      const nextWeek = weeklyData?.[0]?.week_number ? weeklyData[0].week_number + 1 : 1;
      setEditingWeek(nextWeek);

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

  useEffect(() => {
    loadData();
  }, []);

  return {
    contestants,
    scoringRules,
    loading,
    currentGameWeek,
    editingWeek,
    loadData
  };
};