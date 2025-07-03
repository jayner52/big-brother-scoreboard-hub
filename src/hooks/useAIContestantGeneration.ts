import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAIContestantGeneration = (
  loadContestants: () => Promise<void>
) => {
  const { toast } = useToast();

  const handleAIProfilesGenerated = async (profiles: any[]) => {
    console.log('🎯 Generated profiles received:', profiles.length, 'contestants');
    console.log('📊 Sample profile data:', profiles[0]);
    
    // Validate input
    if (!profiles || profiles.length === 0) {
      toast({
        title: "Error",
        description: "No profiles received from AI generation",
        variant: "destructive",
      });
      return;
    }

    // The new edge function handles all database operations internally
    // So we just need to reload the contestants and show success
    console.log('♻️  Reloading contestants list...');
    try {
      await loadContestants();
      console.log('✅ Contestants list reloaded successfully');
      
      toast({
        title: "Success!",
        description: `Successfully processed ${profiles.length} contestants`,
      });
    } catch (error) {
      console.error('❌ Failed to reload contestants:', error);
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