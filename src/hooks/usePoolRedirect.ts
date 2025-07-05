import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';

export const usePoolRedirect = () => {
  const navigate = useNavigate();
  const { userPools, loading } = usePool();

  useEffect(() => {
    const checkAuthAndPools = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If not authenticated, go to auth page
      if (!session) {
        navigate('/auth');
        return;
      }

      // Wait for pools to load
      if (loading) return;

      // If user has no pools, redirect to welcome page
      if (userPools.length === 0) {
        navigate('/welcome');
        return;
      }
      
      // If user has pools, redirect to dashboard
      navigate('/dashboard');
    };

    checkAuthAndPools();
  }, [navigate, userPools, loading]);

  return { hasAccess: userPools.length > 0 && !loading };
};