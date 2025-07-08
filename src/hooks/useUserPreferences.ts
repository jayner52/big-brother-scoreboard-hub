import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserPreferences {
  email_opt_in: boolean;
  terms_accepted_at: string | null;
  terms_version: string;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      setPreferences(data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (prefs: Partial<UserPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...prefs,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // If email opt-in is true, add to email list
      if (prefs.email_opt_in) {
        await addToEmailList(user.id, user.email!);
      }

      setPreferences(prev => ({ ...prev, ...prefs } as UserPreferences));
      
      return { success: true };
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const addToEmailList = async (userId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('email_list')
        .upsert({
          user_id: userId,
          email,
          status: 'active',
          source: 'signup'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding to email list:', error);
      // Don't throw here as it's not critical for signup
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  return {
    preferences,
    loading,
    savePreferences,
    loadPreferences
  };
};