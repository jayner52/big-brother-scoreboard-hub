import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAIContestantGeneration = (
  loadContestants: () => Promise<void>
) => {
  const { toast } = useToast();

  const handleAIProfilesGenerated = async (profiles: any[]) => {
    console.log('Generated profiles received:', profiles.length, 'contestants');
    console.log('Sample profile data:', profiles[0]);
    
    // Validate exactly 16 contestants for BB26
    if (profiles.length !== 16) {
      toast({
        title: "Error",
        description: `Expected exactly 16 contestants, got ${profiles.length}`,
        variant: "destructive",
      });
      return;
    }
    
    const newContestants = [];
    const failedSaves = [];
    
    for (const profile of profiles) {
      try {
        // Validate required fields
        if (!profile.name || !profile.age || !profile.hometown || !profile.occupation) {
          throw new Error(`Missing required fields for ${profile.name || 'Unknown'}`);
        }

        console.log(`Saving contestant: ${profile.name}`);
        
        const { data, error } = await supabase
          .from('contestants')
          .insert({
            name: profile.name,
            age: profile.age,
            hometown: profile.hometown,
            occupation: profile.occupation,
            bio: profile.bio,
            photo_url: profile.photo, // Correctly map 'photo' to 'photo_url'
            season_number: 26,
            data_source: 'ai_generated',
            ai_generated: true,
            generation_metadata: {
              generated_date: new Date().toISOString(),
              model_used: 'improved_api',
              data_source: 'real_contestant_data'
            },
            is_active: true,
            sort_order: newContestants.length + 1
          })
          .select()
          .single();

        if (error) {
          console.error(`Database error for ${profile.name}:`, error);
          throw error;
        }
        
        console.log(`Successfully saved: ${profile.name}`);
        newContestants.push(data);
      } catch (error) {
        console.error(`Error saving AI profile for ${profile.name}:`, error);
        failedSaves.push({ name: profile.name, error: error.message });
      }
    }

    // Show results
    if (newContestants.length > 0) {
      await loadContestants();
      console.log('Cast loaded:', newContestants.length, 'new contestants added');
    }

    if (failedSaves.length > 0) {
      console.error('Failed saves:', failedSaves);
      toast({
        title: "Partial Success",
        description: `Saved ${newContestants.length}/${profiles.length} contestants. ${failedSaves.length} failed.`,
        variant: "destructive",
      });
    } else if (newContestants.length > 0) {
      toast({
        title: "Success!",
        description: `Added ${newContestants.length} contestant(s)`,
      });
    } else {
      toast({
        title: "Error",
        description: "No contestants were saved to the database",
        variant: "destructive",
      });
    }
  };

  return {
    handleAIProfilesGenerated
  };
};