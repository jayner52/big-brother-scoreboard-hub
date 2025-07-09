import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio, ContestantGroup } from '@/types/admin';

export const useContestants = (poolId?: string) => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<ContestantWithBio[]>([]);
  const [groups, setGroups] = useState<ContestantGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContestants = async () => {
    if (!poolId) return;
    
    console.log('🔥 LOADING CONTESTANTS - START', { poolId });
    try {
      // Use edge function to bypass RLS and handle seeding
      const { data: response, error } = await supabase.functions.invoke('get-pool-contestants', {
        body: { poolId }
      });

      if (error) {
        console.error('🔥 Edge function error:', error);
        throw error;
      }

      console.log('🔥 Edge function response:', response);

      if (response?.success && response?.contestants) {
        const finalData = response.contestants;
        console.log('🔥 Final contestant data:', { count: finalData.length });
        
        if (finalData.length > 0) {
          const mappedContestants = finalData.map(c => ({
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
          
          console.log('🔥 Mapped contestants:', { count: mappedContestants.length, sample: mappedContestants[0] });
          setContestants(mappedContestants);
          console.log('🔥 State updated with contestants');
          
          if (response.message) {
            toast({
              title: "Success",
              description: response.message,
            });
          }
        } else {
          console.log('🔥 No contestants found, setting empty state');
          setContestants([]);
        }
      } else {
        throw new Error(response?.error || 'Failed to load contestants');
      }
    } catch (error) {
      console.error('🔥 ERROR LOADING CONTESTANTS:', error);
      toast({
        title: "Error",
        description: "Failed to load contestants",
        variant: "destructive",
      });
    } finally {
      console.log('🔥 LOADING CONTESTANTS - END');
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    if (!poolId) return;
    
    try {
      const { data } = await supabase
        .from('contestant_groups')
        .select('*')
        .eq('pool_id', poolId)
        .order('sort_order', { ascending: true });
      
      if (data) {
        setGroups(data);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  useEffect(() => {
    if (poolId) {
      loadContestants();
      loadGroups();
    }
  }, [poolId]);

  return {
    contestants,
    setContestants,
    groups,
    loading,
    loadContestants,
    loadGroups
  };
};