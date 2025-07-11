import { supabase } from '@/integrations/supabase/client';
import { GroupOperation, GroupData, HouseguestData } from './types';

export const clearContestantGroupAssignments = async (poolId: string) => {
  console.log('🔧 Clearing contestant group assignments...');
  const { error } = await supabase
    .from('contestants')
    .update({ group_id: null })
    .eq('pool_id', poolId);
  
  if (error) {
    console.error('🔧 Failed to clear group assignments:', error);
    throw error;
  }
};

export const fetchActiveHouseguests = async (poolId: string): Promise<HouseguestData[]> => {
  const { data: houseguests, error } = await supabase
    .from('contestants')
    .select('id, name, sort_order')
    .eq('pool_id', poolId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return houseguests || [];
};

export const fetchExistingGroups = async (poolId: string): Promise<GroupData[]> => {
  const { data: existingGroups } = await supabase
    .from('contestant_groups')
    .select('id, group_name, sort_order')
    .eq('pool_id', poolId);

  return existingGroups || [];
};

export const deleteRegularGroups = async (regularGroupIds: string[]) => {
  if (regularGroupIds.length > 0) {
    console.log('🔧 Deleting existing regular groups:', regularGroupIds.length);
    const { error } = await supabase
      .from('contestant_groups')
      .delete()
      .in('id', regularGroupIds);
    
    if (error) throw error;
  }
};

export const createGroups = async (groupOperations: GroupOperation[]): Promise<GroupData[]> => {
  const { data: newGroups, error } = await supabase
    .from('contestant_groups')
    .insert(groupOperations)
    .select('id, group_name, sort_order');

  if (error) throw error;
  if (!newGroups) throw new Error('Failed to create groups');

  return newGroups;
};

export const assignHouseguestsToGroup = async (groupId: string, houseguestIds: string[]) => {
  if (houseguestIds.length > 0) {
    const { error } = await supabase
      .from('contestants')
      .update({ group_id: groupId })
      .in('id', houseguestIds);
    
    if (error) throw error;
  }
};

export const updatePoolPicksPerTeam = async (poolId: string, picksPerTeam: number) => {
  const { error } = await supabase
    .from('pools')
    .update({ picks_per_team: picksPerTeam })
    .eq('id', poolId);

  if (error) {
    console.error('🔧 Error updating picks_per_team:', error);
    throw error;
  }
};

export const updateGroupNames = async (poolId: string, groupNames: string[]): Promise<boolean> => {
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
    return true;
  } catch (error) {
    console.error('🔧 Error saving group names:', error);
    return false;
  }
};