import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAIContestantGeneration = (
  loadContestants: () => Promise<void>
) => {
  const { toast } = useToast();

  const handleAIProfilesGenerated = async (profiles: any[]) => {
    console.log('🔥 AI PROFILES GENERATED CALLBACK TRIGGERED');
    console.log('🔥 Profiles received:', profiles.length, 'contestants');
    console.log('🔥 Sample profile data:', profiles[0]);
    
    // Validate input
    if (!profiles || profiles.length === 0) {
      console.log('🔥 ERROR: No profiles received');
      toast({
        title: "Error",
        description: "No profiles received from AI generation",
        variant: "destructive",
      });
      return;
    }

    // The new edge function handles all database operations internally
    // So we just need to reload the contestants and show success
    console.log('🔥 RELOADING CONTESTANTS LIST...');
    try {
      console.log('🔥 BEFORE RELOAD - Checking database...');
      
      // Check database state before reload
      const { data: beforeData, error: beforeError } = await supabase
        .from('contestants')
        .select('*', { count: 'exact' })
        .eq('pool_id', null);
      
      console.log('🔥 Default contestants (pool_id = null):', { count: beforeData?.length, error: beforeError });
      
      const { data: poolData, error: poolError } = await supabase
        .from('contestants')
        .select('*', { count: 'exact' })
        .not('pool_id', 'is', null);
      
      console.log('🔥 Pool contestants (pool_id != null):', { count: poolData?.length, error: poolError });
      
      await loadContestants();
      console.log('🔥 CONTESTANTS LIST RELOADED SUCCESSFULLY');
      
      // Check database state after reload
      const { data: afterData, error: afterError } = await supabase
        .from('contestants')
        .select('*', { count: 'exact' })
        .not('pool_id', 'is', null);
      
      console.log('🔥 AFTER RELOAD - Pool contestants:', { count: afterData?.length, error: afterError });
      
      toast({
        title: "Success!",
        description: `Successfully processed ${profiles.length} contestants`,
      });
    } catch (error) {
      console.error('🔥 FAILED TO RELOAD CONTESTANTS:', error);
      toast({
        title: "Warning",
        description: "Contestants may have been added but failed to reload the list. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  return {
    handleAIProfilesGenerated
  };
};