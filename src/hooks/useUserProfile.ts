
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  background_color?: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = (user: SupabaseUser | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Profile fetched:', data);
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    console.log('Refreshing profile for user:', user?.id);
    fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    refreshProfile,
  };
};
