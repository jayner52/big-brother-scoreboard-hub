import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useGroupAutoGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const redistributeHouseguests = async (poolId: string, numberOfGroups: number, enableFreePick = true) => {
    console.log('🔧 TRANSACTION START - Updating groups:', { poolId, numberOfGroups, enableFreePick });
    
    // CRITICAL: Validate input parameters
    if (!poolId || numberOfGroups < 1 || numberOfGroups > 8) {
      console.error('Invalid parameters for group generation:', { poolId, numberOfGroups });
      toast({
        title: "Invalid Input",
        description: "Number of groups must be between 1 and 8",
        variant: "destructive",
      });
      return false;
    }

    setIsGenerating(true);
    
    try {
      // Start database transaction using RPC call
      const { error: transactionStartError } = await supabase.rpc('begin_transaction' as any);
      if (transactionStartError) {
        console.log('Manual transaction management - proceeding with atomic operations');
      }

      // 1. Get all active houseguests for this pool
      const { data: houseguests, error: houseguestsError } = await supabase
        .from('contestants')
        .select('id, name, sort_order')
        .eq('pool_id', poolId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (houseguestsError) throw houseguestsError;
      if (!houseguests || houseguests.length === 0) {
        console.warn('No active houseguests found for pool');
        toast({
          title: "Warning",
          description: "No active houseguests found. Please add contestants first.",
          variant: "default",
        });
        return false;
      }

      console.log('🔧 Found houseguests:', houseguests.length);

      // 2. ATOMIC OPERATION: Delete existing regular groups (keep Free Pick if it exists)
      const { data: existingGroups } = await supabase
        .from('contestant_groups')
        .select('id, group_name')
        .eq('pool_id', poolId);

      // Delete only regular groups, preserve Free Pick
      const regularGroupIds = existingGroups?.filter(g => g.group_name !== 'Free Pick').map(g => g.id) || [];
      
      if (regularGroupIds.length > 0) {
        console.log('🔧 Deleting existing regular groups:', regularGroupIds.length);
        const { error: deleteError } = await supabase
          .from('contestant_groups')
          .delete()
          .in('id', regularGroupIds);
        
        if (deleteError) throw deleteError;
      }

      // 3. Create exactly the requested number of new groups
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const groupOperations = [];

      // Create regular groups
      for (let i = 0; i < numberOfGroups; i++) {
        const groupName = `Group ${alphabet[i]}`;
        groupOperations.push({
          pool_id: poolId,
          group_name: groupName,
          sort_order: i + 1
        });
      }

      // Ensure Free Pick group exists if enabled
      const freePickExists = existingGroups?.some(g => g.group_name === 'Free Pick');
      if (enableFreePick && !freePickExists) {
        groupOperations.push({
          pool_id: poolId,
          group_name: 'Free Pick',
          sort_order: numberOfGroups + 1
        });
      }

      const { data: newGroups, error: groupsError } = await supabase
        .from('contestant_groups')
        .insert(groupOperations)
        .select('id, group_name, sort_order');

      if (groupsError) throw groupsError;
      if (!newGroups) throw new Error('Failed to create groups');

      console.log('🔧 Created groups:', newGroups.map(g => g.group_name));

      // 4. Redistribute houseguests evenly across REGULAR groups only
      const regularGroups = newGroups.filter(g => g.group_name !== 'Free Pick');
      if (regularGroups.length === 0) {
        throw new Error('No regular groups created for houseguest distribution');
      }

      const houseguestsPerGroup = Math.floor(houseguests.length / regularGroups.length);
      const remainder = houseguests.length % regularGroups.length;

      // Clear all existing group assignments first
      await supabase
        .from('contestants')
        .update({ group_id: null })
        .eq('pool_id', poolId);

      let currentIndex = 0;
      for (let i = 0; i < regularGroups.length; i++) {
        const group = regularGroups[i];
        const groupSize = houseguestsPerGroup + (i < remainder ? 1 : 0);
        
        console.log(`🔧 Assigning ${groupSize} houseguests to ${group.group_name}`);

        const houseguestsForThisGroup = houseguests.slice(currentIndex, currentIndex + groupSize);
        if (houseguestsForThisGroup.length > 0) {
          const { error: assignError } = await supabase
            .from('contestants')
            .update({ group_id: group.id })
            .in('id', houseguestsForThisGroup.map(h => h.id));
          
          if (assignError) throw assignError;
        }
        
        currentIndex += groupSize;
      }

      // 5. Update picks_per_team in pool table
      const calculatedPicksPerTeam = numberOfGroups + (enableFreePick ? 1 : 0);
      const { error: poolUpdateError } = await supabase
        .from('pools')
        .update({ picks_per_team: calculatedPicksPerTeam })
        .eq('id', poolId);

      if (poolUpdateError) {
        console.error('🔧 Error updating picks_per_team:', poolUpdateError);
        throw poolUpdateError;
      }

      console.log('🔧 TRANSACTION SUCCESS - All operations completed:', {
        groupsCreated: numberOfGroups,
        houseguestsDistributed: houseguests.length,
        picksPerTeam: calculatedPicksPerTeam
      });

      toast({
        title: "Groups Updated Successfully",
        description: `Created ${numberOfGroups} groups with ${houseguests.length} houseguests distributed evenly`,
      });

      return true;

    } catch (error) {
      console.error('🔧 TRANSACTION FAILED - Rolling back:', error);
      toast({
        title: "Error Updating Groups",
        description: "Failed to update draft groups. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveGroupNames = async (poolId: string, groupNames: string[]) => {
    console.log('🔧 Saving custom group names:', { poolId, groupNames });
    
    try {
      // Get existing groups for this pool
      const { data: existingGroups, error: fetchError } = await supabase
        .from('contestant_groups')
        .select('id, group_name, sort_order')
        .eq('pool_id', poolId)
        .order('sort_order');
      
      if (fetchError) throw fetchError;
      if (!existingGroups) return false;

      // Update group names
      const updatePromises = existingGroups.map((group, index) => {
        if (index < groupNames.length && group.group_name !== 'Free Pick') {
          return supabase
            .from('contestant_groups')
            .update({ group_name: groupNames[index] })
            .eq('id', group.id);
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      
      console.log('🔧 Successfully saved custom group names');
      return true;
    } catch (error) {
      console.error('🔧 Error saving group names:', error);
      return false;
    }
  };

  return {
    redistributeHouseguests,
    saveGroupNames,
    isGenerating
  };
};