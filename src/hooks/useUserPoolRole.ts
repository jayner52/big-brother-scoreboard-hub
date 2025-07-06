import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserPoolRole = (poolId?: string, userId?: string) => {
  const [role, setRole] = useState<string>('member');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!poolId || !userId) {
      setRole('member');
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const getUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('pool_memberships')
          .select('role')
          .eq('pool_id', poolId)
          .eq('user_id', userId)
          .eq('active', true)
          .maybeSingle();

        if (error) throw error;

        const userRole = data?.role || 'member';
        setRole(userRole);
        setIsAdmin(['owner', 'admin'].includes(userRole));
      } catch (error) {
        console.error('Error checking user role:', error);
        setRole('member');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    getUserRole();
  }, [poolId, userId]);

  return { role, isAdmin, loading };
};