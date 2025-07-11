import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  console.log('useAuth hook called, React available:', typeof useState);
  
  try {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      console.log('useAuth useEffect running');
      
      // Check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Got session:', session);
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch((error) => {
        console.error('Error getting session:', error);
        setLoading(false);
      });

      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('Auth state changed:', event, session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    }, []);

    return { user, loading };
  } catch (error) {
    console.error('useState error in useAuth:', error);
    return { user: null, loading: false };
  }
};