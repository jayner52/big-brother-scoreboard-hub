import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAIContestantGeneration = (
  loadContestants: () => Promise<void>
) => {
  const { toast } = useToast();

  const handleAIProfilesGenerated = async (profiles: any[]) => {
    console.log('Generated profiles received:', profiles.length, 'contestants');
    console.log('Sample profile data:', profiles[0]);
    
    // Validate input
    if (!profiles || profiles.length === 0) {
      toast({
        title: "Error",
        description: "No profiles received from AI generation",
        variant: "destructive",
      });
      return;
    }
    
    const newContestants = [];
    const failedSaves = [];
    let validationErrors = [];
    
    // Pre-validate all profiles before attempting database inserts
    for (const profile of profiles) {
      const missingFields = [];
      if (!profile.name || profile.name.trim() === '') missingFields.push('name');
      if (!profile.age || profile.age < 18 || profile.age > 80) missingFields.push('age');
      if (!profile.hometown || profile.hometown.trim() === '') missingFields.push('hometown');
      if (!profile.occupation || profile.occupation.trim() === '') missingFields.push('occupation');
      
      if (missingFields.length > 0) {
        validationErrors.push(`${profile.name || 'Unknown'}: missing ${missingFields.join(', ')}`);
      }
    }
    
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      toast({
        title: "Validation Error",
        description: `${validationErrors.length} profiles have missing data. Check console for details.`,
        variant: "destructive",
      });
      return;
    }
    
    console.log('Starting database inserts for', profiles.length, 'contestants...');
    
    // Clear existing contestants before full cast generation to avoid duplicates
    if (profiles.length > 1) {
      console.log('Clearing existing contestants before full cast generation...');
      try {
        const { error: deleteError } = await supabase
          .from('contestants')
          .delete()
          .eq('season_number', 26);
        
        if (deleteError) {
          console.error('Failed to clear existing contestants:', deleteError);
        } else {
          console.log('✅ Existing contestants cleared successfully');
        }
      } catch (error) {
        console.error('Error clearing existing contestants:', error);
      }
    }

    // Attempt to save each profile with detailed error handling
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      try {
        console.log(`[${i + 1}/${profiles.length}] Inserting contestant: ${profile.name}`);
        
        const insertData = {
          name: profile.name.trim(),
          age: parseInt(profile.age),
          hometown: profile.hometown.trim(),
          occupation: profile.occupation.trim(),
          bio: profile.bio || '',
          photo_url: profile.photo || profile.photo_url || null,
          season_number: 26,
          data_source: 'bigbrother_fandom',
          ai_generated: false,
          generation_metadata: {
            generated_date: new Date().toISOString(),
            source: 'bigbrother.fandom.com',
            data_source: 'real_contestant_data',
            batch_id: Date.now()
          },
          is_active: true,
          sort_order: i + 1
        };
        
        console.log('Insert data:', insertData);
        
        // Use upsert to handle potential duplicates
        const { data, error } = await supabase
          .from('contestants')
          .upsert(insertData, { 
            onConflict: 'name,season_number',
            ignoreDuplicates: false 
          })
          .select()
          .single();

        if (error) {
          console.error(`Database upsert failed for ${profile.name}:`, {
            error: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          
          // Try regular insert as fallback
          console.log(`Trying regular insert for ${profile.name}...`);
          const { data: insertData2, error: insertError } = await supabase
            .from('contestants')
            .insert(insertData)
            .select()
            .single();
            
          if (insertError) {
            throw new Error(`Database error: ${insertError.message}`);
          }
          
          console.log(`✅ Successfully inserted (fallback): ${profile.name} (ID: ${insertData2.id})`);
          newContestants.push(insertData2);
        } else {
          console.log(`✅ Successfully upserted: ${profile.name} (ID: ${data.id})`);
          newContestants.push(data);
        }
      } catch (error) {
        console.error(`❌ Failed to save ${profile.name}:`, error);
        failedSaves.push({ 
          name: profile.name, 
          error: error.message,
          index: i + 1
        });
      }
    }

    console.log(`Insert complete: ${newContestants.length} successful, ${failedSaves.length} failed`);

    // Reload contestants data only if we have successful saves
    if (newContestants.length > 0) {
      console.log('Reloading contestants list...');
      try {
        await loadContestants();
        console.log('✅ Contestants list reloaded successfully');
      } catch (error) {
        console.error('❌ Failed to reload contestants:', error);
      }
    }

    // Show appropriate success/error messages
    if (newContestants.length === profiles.length) {
      // Complete success
      toast({
        title: "Success!",
        description: `Successfully added all ${newContestants.length} contestants`,
      });
    } else if (newContestants.length > 0) {
      // Partial success
      toast({
        title: "Partial Success",
        description: `Added ${newContestants.length}/${profiles.length} contestants. ${failedSaves.length} failed - check console for details.`,
        variant: "destructive",
      });
      console.log('Failed saves details:', failedSaves);
    } else {
      // Complete failure
      toast({
        title: "Save Failed",
        description: `Failed to save any contestants to database. Check console for details.`,
        variant: "destructive",
      });
      console.error('All saves failed:', failedSaves);
    }
  };

  return {
    handleAIProfilesGenerated
  };
};