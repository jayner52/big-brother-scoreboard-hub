import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DetailedScoringRule } from '@/types/admin';

export const useScoringRules = (poolId?: string) => {
  const [scoringRules, setScoringRules] = useState<DetailedScoringRule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadScoringRules = async () => {
    // CRITICAL: Pool ID is now REQUIRED for proper isolation
    if (!poolId) {
      console.warn('useScoringRules: No poolId provided - cannot load scoring rules');
      setScoringRules([]);
      setLoading(false);
      return;
    }

    try {
      // ALWAYS filter by pool_id - no more global rules
      const { data, error } = await supabase
        .from('detailed_scoring_rules')
        .select('*')
        .eq('is_active', true)
        .eq('pool_id', poolId) // REQUIRED: Pool-specific filtering
        .order('category', { ascending: true });

      if (error) throw error;
      
      // Transform database data to match DetailedScoringRule interface
      const transformedData = (data || []).map(item => ({
        ...item,
        created_at: new Date(item.created_at)
      }));
      
      setScoringRules(transformedData);
    } catch (error) {
      console.error('Error loading scoring rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPointsForEvent = (subcategory: string): number => {
    const rule = scoringRules.find(r => r.subcategory === subcategory);
    return rule?.points || 0;
  };

  const getWinnerPoints = () => getPointsForEvent('winner');
  const getRunnerUpPoints = () => getPointsForEvent('runner_up');
  const getHohPoints = () => getPointsForEvent('hoh_winner');
  const getPovPoints = () => getPointsForEvent('pov_winner');
  const getNomineePoints = () => getPointsForEvent('nominee');
  const getSurvivalPoints = () => getPointsForEvent('survival');

  useEffect(() => {
    loadScoringRules();
  }, [poolId]);

  return {
    scoringRules,
    loading,
    getPointsForEvent,
    getWinnerPoints,
    getRunnerUpPoints,
    getHohPoints,
    getPovPoints,
    getNomineePoints,
    getSurvivalPoints,
    refreshRules: loadScoringRules
  };
};