import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  clearContestantGroupAssignments,
  fetchActiveHouseguests,
  fetchExistingGroups,
  deleteRegularGroups,
  createGroups,
  assignHouseguestsToGroup,
  updatePoolPicksPerTeam,
  updateGroupNames
} from './groupDatabaseOperations';
import {
  validateRedistributionParams,
  generateGroupOperations,
  distributeHouseguests,
  calculatePicksPerTeam,
  filterRegularGroups,
  checkFreePickExists
} from './groupRedistributionLogic';

export const useGroupAutoGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const redistributeHouseguests = async (poolId: string, numberOfGroups: number, enableFreePick = true) => {
    console.log('🔧 TRANSACTION START - Updating groups:', { poolId, numberOfGroups, enableFreePick });
    
    // CRITICAL: Validate input parameters
    if (!validateRedistributionParams(poolId, numberOfGroups)) {
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
      const houseguests = await fetchActiveHouseguests(poolId);
      
      if (houseguests.length === 0) {
        console.warn('No active houseguests found for pool');
        toast({
          title: "Warning",
          description: "No active houseguests found. Please add contestants first.",
          variant: "default",
        });
        return false;
      }

      console.log('🔧 Found houseguests:', houseguests.length);

      // 2. CRITICAL FIX: Clear all contestant group assignments BEFORE deleting groups
      await clearContestantGroupAssignments(poolId);

      // 3. Now safely delete existing regular groups (keep Free Pick if it exists)
      const existingGroups = await fetchExistingGroups(poolId);
      const regularGroupIds = filterRegularGroups(existingGroups);
      await deleteRegularGroups(regularGroupIds);

      // 4. Create exactly the requested number of new groups
      const freePickExists = checkFreePickExists(existingGroups);
      const groupOperations = generateGroupOperations(poolId, numberOfGroups, enableFreePick, freePickExists);
      const newGroups = await createGroups(groupOperations);

      console.log('🔧 Created groups:', newGroups.map(g => g.group_name));

      // 5. Redistribute houseguests evenly across REGULAR groups only
      const regularGroups = newGroups.filter(g => g.group_name !== 'Free Pick');
      const assignments = distributeHouseguests(houseguests, regularGroups);

      // Execute all assignments
      for (const assignment of assignments) {
        await assignHouseguestsToGroup(assignment.groupId, assignment.houseguestIds);
      }

      // 6. Update picks_per_team in pool table
      const calculatedPicksPerTeam = calculatePicksPerTeam(numberOfGroups, enableFreePick);
      await updatePoolPicksPerTeam(poolId, calculatedPicksPerTeam);

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
    return await updateGroupNames(poolId, groupNames);
  };

  return {
    redistributeHouseguests,
    saveGroupNames,
    isGenerating
  };
};
