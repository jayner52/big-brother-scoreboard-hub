import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantWithBio } from '@/types/admin';
import { usePool } from '@/contexts/PoolContext';

interface DebugInfo {
  currentCount: number;
  draftCount: number; 
  weeklyEventsCount: number;
  specialEventsCount: number;
  deleteError?: any;
  deletedCount: number;
  remainingCount: number;
  step?: string;
  [key: string]: any;
}

export const useEnhancedContestantCrud = (
  contestants: ContestantWithBio[],
  setContestants: React.Dispatch<React.SetStateAction<ContestantWithBio[]>>
) => {
  const { toast } = useToast();
  const { activePool } = usePool();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const debugClearAll = async (): Promise<DebugInfo> => {
    console.log('=== CLEAR ALL DEBUG START ===');
    const debug: DebugInfo = {
      currentCount: 0,
      draftCount: 0,
      weeklyEventsCount: 0,
      specialEventsCount: 0,
      deletedCount: 0,
      remainingCount: 0
    };
    
    try {
      // Step 1: Check current contestants
      debug.step = 'Checking current contestants';
      const { data: current, error: currentError } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', activePool?.id);
      
      debug.currentCount = current?.length || 0;
      debug.currentError = currentError;
      console.log('Current contestants:', current?.length);
      
      // Step 2: Check for draft picks that reference these contestants by name
      debug.step = 'Checking draft picks';
      const contestantNames = current?.map(c => c.name) || [];
      
      if (contestantNames.length > 0) {
        const { data: drafts, error: draftError } = await supabase
          .from('pool_entries')
          .select('*')
          .eq('pool_id', activePool?.id)
          .or(`player_1.in.(${contestantNames.map(n => `"${n}"`).join(',')}),player_2.in.(${contestantNames.map(n => `"${n}"`).join(',')}),player_3.in.(${contestantNames.map(n => `"${n}"`).join(',')}),player_4.in.(${contestantNames.map(n => `"${n}"`).join(',')}),player_5.in.(${contestantNames.map(n => `"${n}"`).join(',')}))`);
        
        debug.draftCount = drafts?.length || 0;
        debug.draftError = draftError;
        console.log('Draft picks referencing contestants:', drafts?.length);
      }
      
      // Step 3: Check weekly events
      debug.step = 'Checking weekly events';
      const { data: weeklyEvents, error: weeklyError } = await supabase
        .from('weekly_events')
        .select('*')
        .eq('pool_id', activePool?.id);
      
      debug.weeklyEventsCount = weeklyEvents?.length || 0;
      debug.weeklyError = weeklyError;
      console.log('Weekly events:', weeklyEvents?.length);
      
      // Step 4: Check special events
      debug.step = 'Checking special events';
      const { data: specialEvents, error: specialError } = await supabase
        .from('special_events')
        .select('*')
        .eq('pool_id', activePool?.id);
      
      debug.specialEventsCount = specialEvents?.length || 0;
      debug.specialError = specialError;
      console.log('Special events:', specialEvents?.length);
      
      setDebugInfo(debug);
      console.log('=== CLEAR ALL DEBUG END ===', debug);
      
    } catch (error) {
      console.error('Debug error:', error);
      debug.catchError = error.message;
      setDebugInfo(debug);
    }
    
    return debug;
  };

  const clearAllContestantsEnhanced = async () => {
    if (!activePool?.id) {
      toast({
        title: "Error",
        description: "No active pool found for clearing contestants",
        variant: "destructive",
      });
      return false;
    }

    setIsClearing(true);
    
    try {
      // Step 1: Debug current state
      const debug = await debugClearAll();
      
      if (debug.currentCount === 0) {
        toast({
          title: "Info",
          description: "No contestants found to clear",
        });
        return true;
      }

      // Step 2: Clear related data first to prevent orphaned references
      console.log('🔄 Clearing related data first...');
      
      // Clear draft picks by setting contestant references to null
      if (debug.draftCount > 0) {
        console.log('🔄 Updating draft picks to remove contestant references...');
        const { error: draftUpdateError } = await supabase
          .from('pool_entries')
          .update({ 
            player_1: null,
            player_2: null, 
            player_3: null,
            player_4: null,
            player_5: null
          })
          .eq('pool_id', activePool.id);

        if (draftUpdateError) {
          console.error('Draft update error:', draftUpdateError);
          // Don't fail completely, just warn
          toast({
            title: "Warning",
            description: "Some draft picks may still reference old contestants",
            variant: "destructive",
          });
        }
      }
      
      // Clear weekly events
      if (debug.weeklyEventsCount > 0) {
        console.log('🔄 Clearing weekly events...');
        const { error: weeklyDeleteError } = await supabase
          .from('weekly_events')
          .delete()
          .eq('pool_id', activePool.id);

        if (weeklyDeleteError) {
          console.error('Weekly events delete error:', weeklyDeleteError);
        }
      }
      
      // Clear special events
      if (debug.specialEventsCount > 0) {
        console.log('🔄 Clearing special events...');
        const { error: specialDeleteError } = await supabase
          .from('special_events')
          .delete()
          .eq('pool_id', activePool.id);

        if (specialDeleteError) {
          console.error('Special events delete error:', specialDeleteError);
        }
      }

      // Step 3: Finally clear contestants
      console.log('🔄 Clearing contestants...');
      const { data: deleteData, error: deleteError } = await supabase
        .from('contestants')
        .delete()
        .eq('pool_id', activePool.id)
        .select();

      if (deleteError) {
        console.error('Contestant delete error:', deleteError);
        throw deleteError;
      }

      const deletedCount = deleteData?.length || 0;
      console.log('✅ Successfully deleted', deletedCount, 'contestants');

      // Step 4: Verify deletion
      const { data: remaining } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', activePool.id);

      const remainingCount = remaining?.length || 0;
      console.log('📊 Remaining contestants:', remainingCount);

      // Update UI state
      setContestants([]);
      
      // Show detailed success message
      toast({
        title: "Success!",
        description: `Cleared ${deletedCount} contestants and ${debug.weeklyEventsCount + debug.specialEventsCount} related events`,
      });

      return true;
    } catch (error) {
      console.error('Error clearing contestants:', error);
      toast({
        title: "Error",
        description: `Failed to clear contestants: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsClearing(false);
    }
  };

  const populateWithPhotosEnhanced = async () => {
    if (!activePool?.id) {
      toast({
        title: "Error", 
        description: "No active pool selected",
        variant: "destructive",
      });
      return false;
    }

    setIsClearing(true);
    
    try {
      console.log('📸 Starting enhanced photo population...');
      
      // Check current contestants
      const { data: currentContestants } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', activePool.id);

      if (!currentContestants || currentContestants.length === 0) {
        toast({
          title: "No Contestants Found",
          description: "Please add contestants first before populating photos",
          variant: "destructive",
        });
        return false;
      }

      console.log('📸 Found', currentContestants.length, 'contestants to update');
      
      let successCount = 0;
      let failureCount = 0;
      const failures: string[] = [];

      // Process each contestant with photo enhancement
      for (const contestant of currentContestants) {
        try {
          // Generate photo URL based on contestant name
          const nameForUrl = contestant.name.toLowerCase().replace(/\s+/g, '-');
          const photoUrl = `https://media.cbs.com/2024/07/10/bb26-cast-photos-${nameForUrl}.jpg`;
          
          // Update contestant with photo
          const { error: updateError } = await supabase
            .from('contestants')
            .update({ photo_url: photoUrl })
            .eq('id', contestant.id);

          if (updateError) {
            throw updateError;
          }

          successCount++;
          console.log('✅ Updated photo for:', contestant.name);
          
        } catch (error) {
          console.error('❌ Failed to update photo for:', contestant.name, error);
          failureCount++;
          failures.push(contestant.name);
        }
      }

      // Show results
      if (successCount === currentContestants.length) {
        toast({
          title: "Photos Updated!",
          description: `Successfully updated photos for all ${successCount} contestants`,
        });
      } else {
        toast({
          title: "Partial Success",
          description: `Updated ${successCount}/${currentContestants.length} photos. ${failureCount} failed.`,
          variant: "destructive",
        });
        console.log('❌ Failed contestants:', failures);
      }

      return true;
    } catch (error) {
      console.error('Error populating photos:', error);
      toast({
        title: "Error",
        description: `Failed to populate photos: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsClearing(false);
    }
  };

  return {
    clearAllContestantsEnhanced,
    populateWithPhotosEnhanced,
    debugClearAll,
    debugInfo,
    isClearing
  };
};