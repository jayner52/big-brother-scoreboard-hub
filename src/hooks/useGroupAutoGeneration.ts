import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useGroupAutoGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const redistributeHouseguests = async (poolId: string, numberOfGroups: number) => {
    console.log('🔧 Auto-generating groups:', { poolId, numberOfGroups });
    
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

      // 2. Create/update contestant groups (A, B, C, D, etc.)
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const groupOperations = [];

      // Delete existing groups first
      await supabase
        .from('contestant_groups')
        .delete()
        .eq('pool_id', poolId);

      // Create new groups
      for (let i = 0; i < numberOfGroups; i++) {
        const groupName = `Group ${alphabet[i]}`;
        groupOperations.push({
          pool_id: poolId,
          group_name: groupName,
          sort_order: i + 1
        });
      }

      const { data: newGroups, error: groupsError } = await supabase
        .from('contestant_groups')
        .insert(groupOperations)
        .select('id, group_name, sort_order');

      if (groupsError) throw groupsError;
      if (!newGroups) throw new Error('Failed to create groups');

      console.log('🔧 Created groups:', newGroups.map(g => g.group_name));

      // 3. Distribute houseguests evenly across groups
      const houseguestsPerGroup = Math.floor(houseguests.length / numberOfGroups);
      const remainder = houseguests.length % numberOfGroups;

      let currentIndex = 0;
      const updateOperations = [];

      for (let i = 0; i < numberOfGroups; i++) {
        const group = newGroups[i];
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

      console.log('🔧 Successfully redistributed all houseguests');

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

  return {
    redistributeHouseguests,
    isGenerating
  };
};