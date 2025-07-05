import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';

export const useHouseguestPoints = () => {
  const { activePool } = usePool();
  const [houseguestPoints, setHouseguestPoints] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activePool?.id) {
      loadHouseguestPoints();
    }
  }, [activePool?.id]);

  const loadHouseguestPoints = async () => {
    if (!activePool?.id) return;
    
    try {
      setError(null);
      setLoading(true);
      
      // Optimized query to get all contestant points at once (pool-specific)
      const [contestantsResult, weeklyEventsResult, specialEventsResult] = await Promise.all([
        supabase.from('contestants').select('id, name').eq('pool_id', activePool.id),
        supabase.from('weekly_events').select('contestant_id, points_awarded').eq('pool_id', activePool.id),
        supabase.from('special_events').select('contestant_id, points_awarded').eq('pool_id', activePool.id)
      ]);

      if (contestantsResult.error) throw contestantsResult.error;
      if (weeklyEventsResult.error) throw weeklyEventsResult.error;
      if (specialEventsResult.error) throw specialEventsResult.error;

      const contestants = contestantsResult.data || [];
      const weeklyEvents = weeklyEventsResult.data || [];
      const specialEvents = specialEventsResult.data || [];

      // Calculate points for each contestant efficiently
      const pointsMap: Record<string, number> = {};
      
      contestants.forEach(contestant => {
        const weeklyPoints = weeklyEvents
          .filter(event => event.contestant_id === contestant.id)
          .reduce((sum, event) => sum + (event.points_awarded || 0), 0);
        
        const specialPoints = specialEvents
          .filter(event => event.contestant_id === contestant.id)
          .reduce((sum, event) => sum + (event.points_awarded || 0), 0);
        
        pointsMap[contestant.name] = weeklyPoints + specialPoints;
      });

      setHouseguestPoints(pointsMap);
    } catch (error) {
      console.error('Error loading houseguest points:', error);
      setError(error instanceof Error ? error.message : 'Failed to load points');
    } finally {
      setLoading(false);
    }
  };

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    houseguestPoints,
    loading,
    error,
    refreshPoints: loadHouseguestPoints
  }), [houseguestPoints, loading, error]);
};