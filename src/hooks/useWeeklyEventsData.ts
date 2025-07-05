import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, DetailedScoringRule } from '@/types/admin';

export const useWeeklyEventsData = (poolId?: string) => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<ContestantWithBio[]>([]);
  const [scoringRules, setScoringRules] = useState<DetailedScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentGameWeek, setCurrentGameWeek] = useState(1);
  const [editingWeek, setEditingWeek] = useState(1);

  const loadData = async () => {
    if (!poolId) return;
    
    try {
      // Load contestants for this pool only
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', poolId)
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
      
      // Fix 4: Get next editing week - find first incomplete week or highest + 1
      const { data: weeklyData } = await supabase
        .from('weekly_results')
        .select('week_number, is_draft')
        .eq('pool_id', poolId)
        .order('week_number', { ascending: true });
      
      if (weeklyData && weeklyData.length > 0) {
        // Find the first draft week or create the next sequential week
        const firstDraftWeek = weeklyData.find(w => w.is_draft === true);
        if (firstDraftWeek) {
          setEditingWeek(firstDraftWeek.week_number);
        } else {
          // All weeks are complete, set next week after highest
          const highestWeek = Math.max(...weeklyData.map(w => w.week_number));
          setEditingWeek(highestWeek + 1);
        }
      } else {
        // No weeks exist, start with week 1
        setEditingWeek(1);
      }

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
    if (poolId) {
      loadData();
    }
  }, [poolId]);

  return {
    contestants,
    scoringRules,
    loading,
    currentGameWeek,
    editingWeek,
    loadData
  };
};