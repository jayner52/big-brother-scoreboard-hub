import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useGroupAutoGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const redistributeHouseguests = async (poolId: string, numberOfGroups: number, enableFreePick = true) => {
    console.log('🔧 Auto-generating groups:', { poolId, numberOfGroups, enableFreePick });
    
    if (!poolId || numberOfGroups < 1) {
      console.error('Invalid parameters for group generation');
      return false;
    }

    setIsGenerating(true);
    
    try {
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
        return false;
      }

      console.log('🔧 Found houseguests:', houseguests.length);

      // 2. Create/update contestant groups (A, B, C, D, etc.) + Free Pick
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const groupOperations = [];

      // Delete existing groups first
      await supabase
        .from('contestant_groups')
        .delete()
        .eq('pool_id', poolId);

      // Create regular groups
      for (let i = 0; i < numberOfGroups; i++) {
        const groupName = `Group ${alphabet[i]}`;
        groupOperations.push({
          pool_id: poolId,
          group_name: groupName,
          sort_order: i + 1
        });
      }

      // Add Free Pick group if enabled
      if (enableFreePick) {
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

      // 3. Distribute houseguests evenly across REGULAR groups only (not Free Pick)
      const regularGroups = newGroups.filter(g => g.group_name !== 'Free Pick');
      const houseguestsPerGroup = Math.floor(houseguests.length / regularGroups.length);
      const remainder = houseguests.length % regularGroups.length;

      let currentIndex = 0;
      const updateOperations = [];

      for (let i = 0; i < regularGroups.length; i++) {
        const group = regularGroups[i];
        const groupSize = houseguestsPerGroup + (i < remainder ? 1 : 0);
        
        console.log(`🔧 Assigning ${groupSize} houseguests to ${group.group_name}`);

        for (let j = 0; j < groupSize && currentIndex < houseguests.length; j++) {
          const houseguest = houseguests[currentIndex];
          updateOperations.push({
            id: houseguest.id,
            group_id: group.id
          });
          currentIndex++;
        }
      }

      // Update houseguests with their new group assignments
      for (const update of updateOperations) {
        await supabase
          .from('contestants')
          .update({ group_id: update.group_id })
          .eq('id', update.id);
      }

      // 4. CRITICAL: Update picks_per_team in pool table immediately
      const calculatedPicksPerTeam = numberOfGroups + (enableFreePick ? 1 : 0);
      const { error: poolUpdateError } = await supabase
        .from('pools')
        .update({ picks_per_team: calculatedPicksPerTeam })
        .eq('id', poolId);

      if (poolUpdateError) {
        console.error('🔧 Error updating picks_per_team:', poolUpdateError);
        throw poolUpdateError;
      }

      console.log('🔧 Successfully redistributed all houseguests and updated picks_per_team to', calculatedPicksPerTeam);

      toast({
        title: "Groups Auto-Generated",
        description: `Created ${numberOfGroups} groups and distributed ${houseguests.length} houseguests evenly`,
      });

      return true;

    } catch (error) {
      console.error('🔧 Error auto-generating groups:', error);
      toast({
        title: "Error",
        description: "Failed to auto-generate draft groups",
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