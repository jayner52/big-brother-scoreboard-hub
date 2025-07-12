import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantGroup, BonusQuestion, Pool } from '@/types/pool';

interface UseOptimizedPoolDataProps {
  poolId?: string;
}

interface CachedPoolData {
  pool: Pool | null;
  contestantGroups: ContestantGroup[];
  bonusQuestions: BonusQuestion[];
  timestamp: number;
}

const POOL_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for pool data

export const useOptimizedPoolData = ({ poolId }: UseOptimizedPoolDataProps = {}) => {
  const { toast } = useToast();
  const [activePool, setActivePool] = useState<Pool | null>(null);
  const [contestantGroups, setContestantGroups] = useState<ContestantGroup[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<Map<string, CachedPoolData>>(new Map());

  const isCacheValid = useCallback((cachedData: CachedPoolData): boolean => {
    return Date.now() - cachedData.timestamp < POOL_CACHE_DURATION;
  }, []);

  const loadPoolDataOptimized = useCallback(async (useCache = true) => {
    if (!poolId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Check cache first
      if (useCache) {
        const cachedData = cache.get(poolId);
        if (cachedData && isCacheValid(cachedData)) {
          setActivePool(cachedData.pool);
          setContestantGroups(cachedData.contestantGroups);
          setBonusQuestions(cachedData.bonusQuestions);
          setLoading(false);
          return;
        }
      }

      // Single optimized query with all pool data
      const [poolResult, groupsResult, questionsResult] = await Promise.all([
        supabase
          .from('pools')
          .select('*')
          .eq('id', poolId)
          .single(),
        
        supabase
          .from('contestant_groups')
          .select(`
            *,
            contestants (*)
          `)
          .eq('pool_id', poolId)
          .order('sort_order'),
        
        supabase
          .from('bonus_questions')
          .select('*')
          .eq('pool_id', poolId)
          .eq('is_active', true)
          .order('sort_order')
      ]);

      if (poolResult.error) throw poolResult.error;
      if (groupsResult.error) throw groupsResult.error;
      if (questionsResult.error) throw questionsResult.error;

      const pool = poolResult.data;
      
      const mappedGroups = groupsResult.data?.map(g => ({
        id: g.id,
        group_name: g.group_name,
        sort_order: g.sort_order,
        contestants: g.contestants?.map((c: any) => ({
          id: c.id,
          name: c.name,
          isActive: c.is_active,
          group_id: c.group_id,
          sort_order: c.sort_order
        })) || []
      })) || [];
      
      const mappedQuestions = questionsResult.data?.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type as 'player_select' | 'dual_player_select' | 'yes_no' | 'number' | 'creature_select',
        sort_order: q.sort_order,
        is_active: q.is_active,
        correct_answer: q.correct_answer,
        points_value: q.points_value,
        answer_revealed: q.answer_revealed
      })) || [];

      // Cache the results
      const newCache = new Map(cache);
      newCache.set(poolId, {
        pool,
        contestantGroups: mappedGroups,
        bonusQuestions: mappedQuestions,
        timestamp: Date.now()
      });
      setCache(newCache);

      setActivePool(pool);
      setContestantGroups(mappedGroups);
      setBonusQuestions(mappedQuestions);

    } catch (error: any) {
      console.error('Error loading pool data:', error);
      setError(error.message || 'Failed to load pool data');
      toast({
        title: "Error",
        description: "Failed to load pool information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [poolId, cache, isCacheValid, toast]);

  const refreshPoolData = useCallback(() => {
    loadPoolDataOptimized(false); // Force refresh without cache
  }, [loadPoolDataOptimized]);

  const retryLoading = useCallback(() => {
    setError(null);
    refreshPoolData();
  }, [refreshPoolData]);

  // Memoized return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    activePool,
    contestantGroups,
    bonusQuestions,
    loading,
    error,
    refreshPoolData,
    retryLoading
  }), [activePool, contestantGroups, bonusQuestions, loading, error, refreshPoolData, retryLoading]);

  useEffect(() => {
    loadPoolDataOptimized();
  }, [loadPoolDataOptimized]);

  return returnValue;
};