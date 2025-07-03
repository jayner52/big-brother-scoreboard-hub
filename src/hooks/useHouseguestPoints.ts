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
      // Get all data in parallel to reduce loading time
      const [contestantsResult, weeklyEventsResult, specialEventsResult] = await Promise.all([
        supabase.from('contestants').select('id, name'),
        supabase.from('weekly_events').select('contestant_id, points_awarded'),
        supabase.from('special_events').select('contestant_id, points_awarded')
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
    } finally {
      setLoading(false);
    }
  };

  return { houseguestPoints, loading, refreshPoints: loadHouseguestPoints };
};