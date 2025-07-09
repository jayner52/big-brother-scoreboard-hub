import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';

export const useAllContestants = (poolId?: string) => {
  return useQuery({
    queryKey: ['allContestants', poolId],
    queryFn: async () => {
      if (!poolId) return [];
      
      const { data, error } = await supabase
        .from('contestants')
        .select(`
          *,
          contestant_groups (
            group_name
          )
        `)
        .eq('pool_id', poolId)
        .order('name');

      if (error) throw error;

      return (data || []).map(contestant => ({
        ...contestant,
        isActive: contestant.is_active,
        group: contestant.contestant_groups
      })) as ContestantWithBio[];
    },
    enabled: !!poolId
  });
};