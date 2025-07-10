import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, DetailedScoringRule } from '@/types/admin';

// Optimized version with single batch query and proper memoization
export const useOptimizedWeeklyEventsData = (poolId?: string) => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<ContestantWithBio[]>([]);
  const [scoringRules, setScoringRules] = useState<DetailedScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentGameWeek, setCurrentGameWeek] = useState(1);
  const [editingWeek, setEditingWeek] = useState(1);

  // Memoize scoring rules to prevent unnecessary re-renders
  const memoizedScoringRules = useMemo(() => scoringRules, [scoringRules]);

  // Memoize active contestants
  const activeContestants = useMemo(
    () => contestants.filter(c => c.isActive),
    [contestants]
  );

  const loadData = useCallback(async () => {
    if (!poolId) return;
    
    try {
      setLoading(true);
      
      // Single batch query instead of multiple sequential queries
      const [
        { data: contestantsData, error: contestantsError },
        { data: rulesData, error: rulesError },
        { data: currentWeekData, error: weekError },
        { data: weeklyData, error: weeklyError }
      ] = await Promise.all([
        supabase
          .from('contestants')
          .select('*')
          .eq('pool_id', poolId)
          .order('name'),
        supabase
          .from('detailed_scoring_rules')
          .select('*')
          .eq('is_active', true)
          .order('category', { ascending: true }),
        supabase
          .from('current_game_week')
          .select('week_number')
          .single(),
        supabase
          .from('weekly_results')
          .select('week_number, is_draft, winner, runner_up, americas_favorite_player')
          .eq('pool_id', poolId)
          .order('week_number', { ascending: true })
      ]);

      if (contestantsError) throw contestantsError;
      if (rulesError) throw rulesError;
      if (weekError && weekError.code !== 'PGRST116') throw weekError; // Ignore "no rows" error
      if (weeklyError) throw weeklyError;

      // Process contestants data
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

      // Process scoring rules
      if (rulesData) {
        const mappedRules = rulesData.map(r => ({
          ...r,
          created_at: new Date(r.created_at)
        }));
        setScoringRules(mappedRules);
      }

      // Set current game week
      const gameWeek = currentWeekData?.week_number || 1;
      setCurrentGameWeek(gameWeek);
      
      // Determine editing week
      if (weeklyData && weeklyData.length > 0) {
        const firstDraftWeek = weeklyData.find(w => w.is_draft === true);
        if (firstDraftWeek) {
          setEditingWeek(firstDraftWeek.week_number);
        } else {
          const highestWeek = Math.max(...weeklyData.map(w => w.week_number));
          const highestWeekData = weeklyData.find(w => w.week_number === highestWeek);
          
          const isFinalWeek = highestWeekData && 
            (highestWeekData.winner || highestWeekData.runner_up || highestWeekData.americas_favorite_player);
          
          if (isFinalWeek) {
            setEditingWeek(highestWeek);
          } else {
            setEditingWeek(highestWeek + 1);
          }
        }
      } else {
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
  }, [poolId, toast]);

  useEffect(() => {
    if (poolId) {
      loadData();
    }
  }, [loadData]);

  return {
    contestants,
    activeContestants,
    scoringRules: memoizedScoringRules,
    loading,
    currentGameWeek,
    editingWeek,
    loadData
  };
};