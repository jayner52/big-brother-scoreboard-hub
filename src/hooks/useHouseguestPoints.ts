import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useHouseguestPoints = () => {
  const [houseguestPoints, setHouseguestPoints] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHouseguestPoints();
  }, []);

  const loadHouseguestPoints = async () => {
    try {
      // Get all contestants
      const { data: contestants } = await supabase
        .from('contestants')
        .select('*');

      if (!contestants) return;

      // Calculate points for each contestant
      const pointsMap: Record<string, number> = {};
      
      for (const contestant of contestants) {
        // Get weekly events points
        const { data: weeklyEvents } = await supabase
          .from('weekly_events')
          .select('points_awarded')
          .eq('contestant_id', contestant.id);

        // Get special events points
        const { data: specialEvents } = await supabase
          .from('special_events')
          .select('points_awarded')
          .eq('contestant_id', contestant.id);

        const weeklyPoints = weeklyEvents?.reduce((sum, event) => sum + (event.points_awarded || 0), 0) || 0;
        const specialPoints = specialEvents?.reduce((sum, event) => sum + (event.points_awarded || 0), 0) || 0;
        
        pointsMap[contestant.name] = weeklyPoints + specialPoints;
      }

      setHouseguestPoints(pointsMap);
    } catch (error) {
      console.error('Error loading houseguest points:', error);
    } finally {
      setLoading(false);
    }
  };

  return { houseguestPoints, loading, refreshPoints: loadHouseguestPoints };
};