import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DetailedScoringRule } from '@/types/admin';

export const useScoringRules = () => {
  const [scoringRules, setScoringRules] = useState<DetailedScoringRule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadScoringRules = async () => {
    try {
      const { data, error } = await supabase
        .from('detailed_scoring_rules')
        .select('*')
        .eq('is_active', true)
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
  }, []);

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