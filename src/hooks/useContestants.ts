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
      
      // If we have fewer than expected contestants (17 for Season 27), ensure default data is seeded
      if (!poolContestants || poolContestants.length < 17) {
        console.log('🔥 Pool has few contestants, checking if defaults need to be seeded...');
        
        // Check if Season 27 defaults exist (prioritize Season 27)
        const { data: defaultContestants } = await supabase
          .from('contestants')
          .select('*')
          .is('pool_id', null)
          .eq('season_number', 27)
          .order('name', { ascending: true });
        
        console.log('🔥 Season 27 default contestants available:', defaultContestants?.length || 0);
        
        // If Season 27 defaults exist but pool has none, trigger seeding
        if (defaultContestants && defaultContestants.length >= 17 && (!poolContestants || poolContestants.length === 0)) {
          console.log('🔥 Triggering Season 27 pool seeding...');
          try {
            const { error } = await supabase.rpc('seed_new_pool_defaults', { target_pool_id: poolId });
            if (error) {
              console.error('🔥 Pool seeding RPC error:', error);
              throw error;
            }
            console.log('🔥 Pool seeding completed, reloading contestants...');
            
            // Reload after seeding with a short delay
            await new Promise(resolve => setTimeout(resolve, 500));
            const { data: reloadedData, error: reloadError } = await supabase
              .from('contestants')
              .select('*')
              .eq('pool_id', poolId)
              .order('name', { ascending: true });
            
            if (reloadError) {
              console.error('🔥 Reload error:', reloadError);
              throw reloadError;
            }
            
            console.log('🔥 Reloaded contestants after seeding:', reloadedData?.length || 0);
            if (reloadedData && reloadedData.length > 0) {
              poolContestants?.splice(0, poolContestants.length, ...reloadedData);
            }
          } catch (seedError) {
            console.error('🔥 Pool seeding failed:', seedError);
            toast({
              title: "Warning",
              description: "Failed to load Season 27 contestants. You may need to add contestants manually.",
              variant: "destructive",
            });
          }
        } else if (!defaultContestants || defaultContestants.length === 0) {
          console.log('🔥 No Season 27 defaults found - this should not happen!');
          toast({
            title: "Warning", 
            description: "Season 27 contestants not found in database. Please contact support.",
            variant: "destructive",
          });
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