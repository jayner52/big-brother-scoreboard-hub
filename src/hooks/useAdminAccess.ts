
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAccess = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Use a more direct approach to avoid RLS recursion issues
      // Check if the user has admin role in pool_memberships or is a pool owner
      const { data: poolMemberships, error: membershipError } = await supabase
        .from('pool_memberships')
        .select('role, pool_id')
        .eq('user_id', user.id)
        .eq('active', true);

      if (membershipError) {
        console.error('Error checking pool memberships:', membershipError);
        setIsAdmin(false);
        return;
      }

      // Check if user is admin/owner in any pool
      const hasAdminAccess = poolMemberships?.some(membership => 
        ['owner', 'admin'].includes(membership.role)
      ) || false;

      setIsAdmin(hasAdminAccess);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  return { isAdmin, loading, checkAdminStatus };
};
