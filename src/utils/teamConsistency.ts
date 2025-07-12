import { supabase } from '@/integrations/supabase/client';

/**
 * Team Consistency Utilities
 * Ensures teams are represented consistently across all components
 */

export interface TeamConsistencyOptions {
  includeDeleted?: boolean;
  poolId?: string;
  userId?: string;
}

/**
 * Get pool entries with consistent filtering
 */
export const getPoolEntries = async (options: TeamConsistencyOptions = {}) => {
  const { includeDeleted = false, poolId, userId } = options;
  
  let query = supabase.from('pool_entries').select('*');
  
  if (poolId) {
    query = query.eq('pool_id', poolId);
  }
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  // Always filter deleted teams unless explicitly requested
  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }
  
  return query.order('total_points', { ascending: false });
};

/**
 * Validate team data for size consistency
 */
export const validateTeamSize = (teamData: any, picksPerTeam: number): { 
  isValid: boolean; 
  errors: string[]; 
  normalizedData: any;
} => {
  const errors: string[] = [];
  const normalizedData = { ...teamData };
  
  // Check required player fields
  for (let i = 1; i <= picksPerTeam; i++) {
    const playerKey = `player_${i}`;
    if (!teamData[playerKey] || !teamData[playerKey].trim()) {
      errors.push(`Player ${i} is required`);
    }
  }
  
  // Clear any extra player fields beyond current team size
  for (let i = picksPerTeam + 1; i <= 12; i++) {
    const playerKey = `player_${i}`;
    normalizedData[playerKey] = null;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    normalizedData
  };
};

/**
 * Soft delete a team (set deleted_at timestamp)
 */
export const softDeleteTeam = async (entryId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('pool_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', entryId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error soft deleting team:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete team' 
    };
  }
};

/**
 * Restore a soft-deleted team
 */
export const restoreTeam = async (entryId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('pool_entries')
      .update({ deleted_at: null })
      .eq('id', entryId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error restoring team:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to restore team' 
    };
  }
};

/**
 * Update team with proper size handling
 */
export const updateTeamData = async (
  entryId: string, 
  teamData: any, 
  picksPerTeam: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const validation = validateTeamSize(teamData, picksPerTeam);
    
    if (!validation.isValid) {
      return { 
        success: false, 
        error: validation.errors.join(', ') 
      };
    }
    
    const { error } = await supabase
      .from('pool_entries')
      .update({
        ...validation.normalizedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', entryId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating team:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update team' 
    };
  }
};

/**
 * Real-time subscription for team changes
 */
export const subscribeToTeamChanges = (
  poolId: string, 
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel(`team-changes-${poolId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pool_entries',
        filter: `pool_id=eq.${poolId}`
      },
      (payload) => {
        console.log('Team change detected:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};