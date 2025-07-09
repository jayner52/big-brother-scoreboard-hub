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
    
    try {
      // Direct query to contestants table with proper RLS
      const { data: contestantsData, error } = await supabase
        .from('contestants')
        .select(`
          id,
          name,
          age,
          hometown,
          occupation,
          bio,
          photo_url,
          is_active,
          group_id,
          sort_order,
          season_number
        `)
        .eq('pool_id', poolId)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading contestants:', error);
        throw error;
      }

      if (contestantsData && contestantsData.length > 0) {
        const mappedContestants = contestantsData.map(c => ({
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
        
        setContestants(mappedContestants);
      } else {
        // If no contestants exist, check if we need to seed from global defaults
        const { data: globalContestants, error: globalError } = await supabase
          .from('contestants')
          .select('*')
          .is('pool_id', null)
          .eq('season_number', 27)
          .order('sort_order', { ascending: true });

        if (globalError) {
          throw globalError;
        }

        if (globalContestants && globalContestants.length > 0) {
          // Try to seed from global defaults using the edge function
          const { data: response, error: seedError } = await supabase.functions.invoke('get-pool-contestants', {
            body: { poolId }
          });

          if (!seedError && response?.success && response?.contestants) {
            const mappedContestants = response.contestants.map(c => ({
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
            
            setContestants(mappedContestants);
            
            if (response.message) {
              toast({
                title: "Success",
                description: response.message,
              });
            }
          } else {
            setContestants([]);
          }
        } else {
          setContestants([]);
        }
      }
    } catch (error) {
      console.error('Error loading contestants:', error);
      toast({
        title: "Error",
        description: "Failed to load contestants",
        variant: "destructive",
      });
      setContestants([]);
    } finally {
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