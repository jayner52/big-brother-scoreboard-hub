import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';

export const useActiveContestantsFiltered = (poolId?: string) => {
  const [activeContestants, setActiveContestants] = useState<ContestantWithBio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (poolId) {
      loadActiveContestants();
    }
  }, [poolId]);

  const loadActiveContestants = async () => {
    if (!poolId) return;
    
    console.log('🔍 Loading ACTIVE contestants only for pool:', poolId);
    
    try {
      // CRITICAL FIX: Only load active contestants for competition dropdowns
      const { data, error } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', poolId)
        .eq('is_active', true) // Only active contestants
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        const mappedContestants = data.map(c => ({
          id: c.id,
          name: c.name,
          isActive: c.is_active,
          group_id: c.group_id,
          sort_order: c.sort_order,
          bio: c.bio,
          photo_url: c.photo_url,
          hometown: c.hometown,
          age: c.age,
          occupation: c.occupation
        }));

        console.log('🔍 Active contestants loaded:', mappedContestants.length);
        setActiveContestants(mappedContestants);
      }
    } catch (error) {
      console.error('Error loading active contestants:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    activeContestants,
    loading,
    reload: loadActiveContestants
  };
};