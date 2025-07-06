import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Pool, PoolMembership, PoolEntry, ScoringRules, WeeklyResults, Contestant } from '@/types/pool';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PoolOperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

interface PoolContextType {
  // Current pool state
  activePool: Pool | null;
  setActivePool: (pool: Pool | null) => void;
  
  // User's pools
  userPools: PoolMembership[];
  loadUserPools: () => Promise<void>;
  refreshPools: () => Promise<void>;
  
  // Pool management with consistent return types
  createPool: (poolData: Partial<Pool>) => Promise<PoolOperationResult<Pool>>;
  joinPoolByCode: (inviteCode: string) => Promise<PoolOperationResult<Pool>>;
  updatePool: (poolId: string, updates: Partial<Pool>) => Promise<PoolOperationResult>;
  deletePool: (poolId: string) => Promise<PoolOperationResult>;
  leavePool: (poolId: string) => Promise<PoolOperationResult>;
  
  // Pool membership
  getUserRole: (poolId?: string) => 'owner' | 'admin' | 'member' | null;
  canManagePool: (poolId?: string) => boolean;
  
  // Pool-specific data
  poolEntries: PoolEntry[];
  
  // State flags
  loading: boolean;
  error: string | null;
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

export const PoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePool, setActivePoolState] = useState<Pool | null>(null);
  const [userPools, setUserPools] = useState<PoolMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  
  // Use refs to track subscriptions
  const poolsChannelRef = useRef<RealtimeChannel | null>(null);
  const membershipsChannelRef = useRef<RealtimeChannel | null>(null);
  const activePoolIdRef = useRef<string | null>(null);

  // Update ref when activePool changes
  useEffect(() => {
    activePoolIdRef.current = activePool?.id || null;
  }, [activePool]);

  // Load pool entries for the active pool
  const loadPoolEntries = useCallback(async (poolId: string) => {
    try {
      const { data: entries, error } = await supabase
        .from('pool_entries')
        .select('*')
        .eq('pool_id', poolId)
        .order('total_points', { ascending: false });
      
      if (error) {
        console.error('Error loading pool entries:', error);
        return;
      }
      
      setPoolEntries((entries || []).map(entry => ({
        ...entry,
        bonus_answers: entry.bonus_answers as Record<string, any>,
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      })));
    } catch (error) {
      console.error('Error loading pool entries:', error);
    }
  }, []);

  // Enhanced setActivePool that loads pool-specific data
  const setActivePool = useCallback((pool: Pool | null) => {
    console.log('Setting active pool:', pool?.name || 'null');
    setActivePoolState(pool);
    
    if (pool) {
      // Load pool entries when active pool changes
      loadPoolEntries(pool.id);
    } else {
      setPoolEntries([]);
    }
  }, [loadPoolEntries]);

  // Load user's pools
  const loadUserPools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserPools([]);
        setActivePool(null);
        return;
      }

      const { data: memberships, error: fetchError } = await supabase
        .from('pool_memberships')
        .select(`
          *,
          pool:pools(*)
        `)
        .eq('user_id', user.id)
        .eq('active', true)
        .order('joined_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Failed to load pools: ${fetchError.message}`);
      }

      const poolMemberships = (memberships || []).map(m => ({
        ...m,
        role: m.role as 'owner' | 'admin' | 'member',
        pool: m.pool as Pool
      })) as PoolMembership[];

      setUserPools(poolMemberships);

      // Maintain active pool if it still exists in user's pools
      const currentActiveId = activePoolIdRef.current;
      if (currentActiveId) {
        const stillHasPool = poolMemberships.some(m => m.pool?.id === currentActiveId);
        if (!stillHasPool) {
          // User no longer has access to active pool
          setActivePool(poolMemberships[0]?.pool || null);
        } else {
          // Update active pool data with fresh data
          const updatedPool = poolMemberships.find(m => m.pool?.id === currentActiveId)?.pool;
          if (updatedPool) {
            setActivePool(updatedPool);
          }
        }
      } else if (poolMemberships.length > 0) {
        // No active pool set, use first pool
        setActivePool(poolMemberships[0].pool!);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pools';
      console.error('Error loading user pools:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // Remove activePool dependency to prevent recreation

  // Set up real-time subscriptions
  useEffect(() => {
    let isMounted = true;

    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      // Subscribe to pool changes for user's pools
      const poolsChannel = supabase
        .channel('user-pools-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pools',
          },
          async (payload) => {
            console.log('Pool changed:', payload);
            // Only reload if this affects a pool the user is a member of
            const affectedPoolId = (payload.new as any)?.id || (payload.old as any)?.id;
            if (affectedPoolId && isMounted) {
              const { data: membership } = await supabase
                .from('pool_memberships')
                .select('id')
                .eq('pool_id', affectedPoolId)
                .eq('user_id', user.id)
                .eq('active', true)
                .single();
              
              if (membership) {
                loadUserPools();
              }
            }
          }
        )
        .subscribe();

      // Subscribe to membership changes for the user
      const membershipsChannel = supabase
        .channel('user-memberships-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pool_memberships',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Membership changed:', payload);
            if (isMounted) {
              loadUserPools();
            }
          }
        )
        .subscribe();

      poolsChannelRef.current = poolsChannel;
      membershipsChannelRef.current = membershipsChannel;
    };

    setupSubscriptions();

    return () => {
      isMounted = false;
      if (poolsChannelRef.current) {
        supabase.removeChannel(poolsChannelRef.current);
      }
      if (membershipsChannelRef.current) {
        supabase.removeChannel(membershipsChannelRef.current);
      }
    };
  }, [loadUserPools]);

  // Initialize on mount and auth changes
  useEffect(() => {
    loadUserPools();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadUserPools();
      } else if (event === 'SIGNED_OUT') {
        setUserPools([]);
        setActivePool(null);
        setError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserPools]);

  const createPool = useCallback(async (poolData: Partial<Pool>): Promise<PoolOperationResult<Pool>> => {
    try {
      // Validate required fields
      if (!poolData.name?.trim()) {
        return { success: false, error: 'Pool name is required' };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'You must be logged in to create a pool' };
      }

      // Ensure we have a fresh session
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Session refresh error:', refreshError);
        return { success: false, error: 'Authentication error. Please try logging in again.' };
      }

      // Create pool with validated data
      const poolToCreate = {
        owner_id: user.id,
        name: poolData.name.trim(),
        description: poolData.description?.trim() || null,
        entry_fee_amount: poolData.entry_fee_amount || 25,
        entry_fee_currency: poolData.entry_fee_currency || 'CAD',
        payment_method_1: poolData.payment_method_1 || 'E-transfer',
        payment_details_1: poolData.payment_details_1 || 'email@example.com',
        payment_method_2: poolData.payment_method_2 || null,
        payment_details_2: poolData.payment_details_2 || null,
        draft_open: poolData.draft_open !== false,
        draft_locked: false,
        enable_bonus_questions: poolData.enable_bonus_questions !== false,
        picks_per_team: poolData.picks_per_team || 5,
        has_buy_in: poolData.has_buy_in !== false,
        buy_in_description: poolData.buy_in_description || null,
        jury_phase_started: false,
        jury_start_week: null,
        jury_start_timestamp: null,
        registration_deadline: poolData.registration_deadline || null,
      };

      console.log('Creating pool:', poolToCreate);

      // Create pool with retry logic
      let pool: Pool | null = null;
      let lastError: any = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data, error } = await supabase
          .from('pools')
          .insert(poolToCreate)
          .select()
          .single();
          
        if (error) {
          lastError = error;
          console.error(`Create pool attempt ${attempt} failed:`, error);
          
          // Retry on RLS errors
          if (error.message?.includes('row-level security policy') && attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
            continue;
          }
          break;
        }
        
        pool = data;
        break;
      }

      if (!pool) {
        const errorMsg = lastError?.message || 'Failed to create pool';
        return { success: false, error: errorMsg };
      }

      // Create owner membership
      const { error: membershipError } = await supabase
        .from('pool_memberships')
        .insert({
          user_id: user.id,
          pool_id: pool.id,
          role: 'owner'
        });

      if (membershipError) {
        console.error('Failed to create membership:', membershipError);
        // Pool was created, so we'll return success but log the issue
      }

      // Seed the pool with defaults
      const { error: seedError } = await supabase.rpc('seed_new_pool_defaults', {
        target_pool_id: pool.id
      });
      
      if (seedError) {
        console.error('Failed to seed pool defaults:', seedError);
        // Non-critical error, pool is still usable
      }

      // CRITICAL: Always populate Season 26 houseguests automatically
      try {
        const { populateSeason26Houseguests } = await import('@/data/season26Houseguests');
        const s26Result = await populateSeason26Houseguests(pool.id);
        
        if (s26Result.success) {
          console.log('✅ Season 26 houseguests populated automatically:', s26Result.count);
        } else {
          console.warn('⚠️ Season 26 population failed:', s26Result.error);
        }
      } catch (s26Error) {
        console.error('❌ Error auto-populating Season 26:', s26Error);
        // Non-critical error, pool is still usable
      }

      // Reload pools to include the new one
      await loadUserPools();
      
      return { success: true, data: pool };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create pool';
      console.error('Error creating pool:', err);
      return { success: false, error: errorMessage };
    }
  }, [loadUserPools]);

  const joinPoolByCode = useCallback(async (inviteCode: string): Promise<PoolOperationResult<Pool>> => {
    try {
      if (!inviteCode?.trim()) {
        return { success: false, error: 'Invite code is required' };
      }

      const { data, error } = await supabase.rpc('join_pool_by_invite', {
        invite_code_param: inviteCode.trim()
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const result = data as { success: boolean; error?: string; pool_id?: string; pool_name?: string };

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to join pool' };
      }

      // Reload pools and find the newly joined pool
      await loadUserPools();
      
      // After reload, find the pool we just joined
      const joinedMembership = userPools.find(m => m.pool_id === result.pool_id);
      const joinedPool = joinedMembership?.pool;
      
      if (!joinedPool) {
        // This shouldn't happen, but handle it gracefully
        return { success: true, error: 'Joined pool but could not load pool details' };
      }

      return { success: true, data: joinedPool };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join pool';
      console.error('Error joining pool:', err);
      return { success: false, error: errorMessage };
    }
  }, [loadUserPools, userPools]);

  const updatePool = useCallback(async (poolId: string, updates: Partial<Pool>): Promise<PoolOperationResult> => {
    try {
      if (!poolId) {
        return { success: false, error: 'Pool ID is required' };
      }

      const { error } = await supabase
        .from('pools')
        .update(updates)
        .eq('id', poolId);

      if (error) {
        return { success: false, error: error.message };
      }

      await loadUserPools();
      return { success: true };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update pool';
      console.error('Error updating pool:', err);
      return { success: false, error: errorMessage };
    }
  }, [loadUserPools]);

  const deletePool = useCallback(async (poolId: string): Promise<PoolOperationResult> => {
    try {
      if (!poolId) {
        return { success: false, error: 'Pool ID is required' };
      }

      const { error } = await supabase
        .from('pools')
        .delete()
        .eq('id', poolId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Clear active pool if it was deleted
      if (activePool?.id === poolId) {
        setActivePool(null);
      }

      await loadUserPools();
      return { success: true };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete pool';
      console.error('Error deleting pool:', err);
      return { success: false, error: errorMessage };
    }
  }, [activePool, loadUserPools]);

  const leavePool = useCallback(async (poolId: string): Promise<PoolOperationResult> => {
    try {
      if (!poolId) {
        return { success: false, error: 'Pool ID is required' };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'You must be logged in to leave a pool' };
      }

      const { error } = await supabase
        .from('pool_memberships')
        .update({ active: false })
        .eq('pool_id', poolId)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // If user left the active pool, switch to another pool
      if (activePool?.id === poolId) {
        const remainingPools = userPools.filter(p => p.pool_id !== poolId);
        setActivePool(remainingPools[0]?.pool || null);
      }

      await loadUserPools();
      return { success: true };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave pool';
      console.error('Error leaving pool:', err);
      return { success: false, error: errorMessage };
    }
  }, [activePool, userPools, loadUserPools]);

  const getUserRole = useCallback((poolId?: string): 'owner' | 'admin' | 'member' | null => {
    const targetPoolId = poolId || activePool?.id;
    if (!targetPoolId) return null;
    
    const membership = userPools.find(p => p.pool_id === targetPoolId);
    return membership?.role || null;
  }, [userPools, activePool]);

  const canManagePool = useCallback((poolId?: string): boolean => {
    const role = getUserRole(poolId);
    return role === 'owner' || role === 'admin';
  }, [getUserRole]);

  const refreshPools = useCallback(async () => {
    await loadUserPools();
  }, [loadUserPools]);

  const contextValue: PoolContextType = {
    activePool,
    setActivePool,
    userPools,
    loadUserPools,
    refreshPools,
    createPool,
    joinPoolByCode,
    updatePool,
    deletePool,
    leavePool,
    getUserRole,
    canManagePool,
    poolEntries,
    loading,
    error,
  };

  return (
    <PoolContext.Provider value={contextValue}>
      {children}
    </PoolContext.Provider>
  );
};

export const usePool = () => {
  const context = useContext(PoolContext);
  if (context === undefined) {
    throw new Error('usePool must be used within a PoolProvider');
  }
  return context;
};