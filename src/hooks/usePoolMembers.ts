import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PoolMember } from '@/components/chat/UserMentionDropdown';

export const usePoolMembers = (poolId?: string) => {
  const [poolMembers, setPoolMembers] = useState<PoolMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!poolId) {
      setPoolMembers([]);
      setLoading(false);
      return;
    }

    const loadPoolMembers = async () => {
      try {
        const { data } = await supabase
          .from('pool_memberships')
          .select(`
            user_id,
            profiles!inner(display_name)
          `)
          .eq('pool_id', poolId)
          .eq('active', true);

        const members = (data || []).map(m => ({
          id: m.user_id,
          name: (m.profiles as any)?.display_name || 'Unknown User',
          email: '' // Could add email if needed
        }));

        setPoolMembers(members);
      } catch (error) {
        console.error('Error loading pool members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPoolMembers();
  }, [poolId]);

  return { poolMembers, loading };
};