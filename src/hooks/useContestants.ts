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
      
      // First try to get pool-specific contestants
      const { data: poolContestants } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', poolId)
        .order('name', { ascending: true });
      
      console.log('🔥 Pool-specific contestants:', poolContestants?.length || 0);
      
      // If we have fewer than expected contestants, ensure default data is seeded
      if (!poolContestants || poolContestants.length < 10) {
        console.log('🔥 Pool has few contestants, checking if defaults need to be seeded...');
        
        // Check if defaults exist
        const { data: defaultContestants } = await supabase
          .from('contestants')
          .select('*')
          .is('pool_id', null)
          .order('name', { ascending: true });
        
        console.log('🔥 Default contestants available:', defaultContestants?.length || 0);
        
        // If defaults exist but pool has none, trigger seeding
        if (defaultContestants && defaultContestants.length > 0 && (!poolContestants || poolContestants.length === 0)) {
          console.log('🔥 Triggering pool seeding...');
          try {
            await supabase.rpc('seed_new_pool_defaults', { target_pool_id: poolId });
            console.log('🔥 Pool seeding completed, reloading contestants...');
            
            // Reload after seeding
            const { data: reloadedData } = await supabase
              .from('contestants')
              .select('*')
              .eq('pool_id', poolId)
              .order('name', { ascending: true });
            
            console.log('🔥 Reloaded contestants after seeding:', reloadedData?.length || 0);
            poolContestants.splice(0, poolContestants.length, ...(reloadedData || []));
          } catch (seedError) {
            console.error('🔥 Pool seeding failed:', seedError);
            toast({
              title: "Warning",
              description: "Failed to load default contestants. You may need to add contestants manually.",
              variant: "destructive",
            });
          }
        }
      }
      
      const finalData = poolContestants || [];
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
      } else {
        console.log('🔥 No contestants found, setting empty state');
        setContestants([]);
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