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
      console.log('🔥 Querying database for contestants...');
      
      const { data } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', poolId)
        .order('name', { ascending: true });
      
      console.log('🔥 Raw database response:', { count: data?.length, data: data?.slice(0, 2) });
      
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
        
        console.log('🔥 Mapped contestants:', { count: mappedContestants.length, sample: mappedContestants[0] });
        
        // Filter by pool_id for logging
        const defaultContestants = data.filter(c => c.pool_id === null);
        const poolContestants = data.filter(c => c.pool_id !== null);
        
        console.log('🔥 Default contestants (pool_id = null):', defaultContestants.length);
        console.log('🔥 Pool contestants (pool_id != null):', poolContestants.length);
        
        setContestants(mappedContestants);
        console.log('🔥 State updated with contestants');
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