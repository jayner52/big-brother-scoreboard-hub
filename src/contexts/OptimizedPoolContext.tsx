import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Pool } from '@/types/pool';
import { supabase } from '@/integrations/supabase/client';

interface PoolMembership {
  id: string;
  pool_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  active: boolean;
  joined_at: string;
  pool?: Pool;
}

interface PoolEntry {
  id: string;
  pool_id: string;
  user_id: string;
  participant_name: string;
  team_name: string;
  player_1: string;
  player_2: string;
  player_3: string;
  player_4: string;
  player_5: string;
  total_points: number;
  weekly_points: number;
  bonus_points: number;
  current_rank: number | null;
  payment_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

interface CachedData {
  userPools: PoolMembership[];
  poolEntries: PoolEntry[];
  timestamp: number;
  activePoolId?: string;
}

interface PoolContextType {
  activePool: Pool | null;
  setActivePool: (pool: Pool | null) => void;
  clearActivePool: () => void;
  forceShowPoolSelection: boolean;
  setForceShowPoolSelection: (force: boolean) => void;
  refreshPool: () => void;
  loading: boolean;
  userPools: PoolMembership[];
  userPoolsLoading: boolean;
  poolEntries: PoolEntry[];
  createPool: (poolData: any) => Promise<{ success: boolean; data?: Pool; error?: string }>;
  joinPoolByCode: (inviteCode: string) => Promise<{ success: boolean; data?: Pool; error?: string }>;
  updatePool: (poolId: string, updates: any) => Promise<boolean>;
  deletePool: (poolId: string, adminConfirmsRefunds?: boolean) => Promise<boolean>;
  leavePool: (poolId: string) => Promise<{ success: boolean; error?: string }>;
  getPoolPaymentStatus: (poolId: string) => Promise<boolean>;
  getUserPaymentStatus: (poolId: string, userId: string) => Promise<boolean>;
  refreshPools: () => Promise<void>;
  getUserRole: (poolId: string) => 'owner' | 'admin' | 'member' | null;
  canManagePool: (poolId?: string) => boolean;
  isPoolOwner: (poolId?: string) => boolean;
  canViewFinancials: (poolId?: string) => boolean;
  canManageRoles: (poolId?: string) => boolean;
  canManageWeeklyEvents: (poolId?: string) => boolean;
  canManageBonusQuestions: (poolId?: string) => boolean;
  loadAllUserPoolEntries: () => Promise<void>;
  error: string | null;
  retryLoading: () => void;
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const LOADING_TIMEOUT = 15000; // 15 seconds

export const OptimizedPoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePool, setActivePoolState] = useState<Pool | null>(null);
  const [userPools, setUserPools] = useState<PoolMembership[]>([]);
  const [userPoolsLoading, setUserPoolsLoading] = useState(false);
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedData, setCachedData] = useState<CachedData | null>(null);
  const [subscriptionChannel, setSubscriptionChannel] = useState<any>(null);
  
  // Anti-infinite loop protection
  const [isLoadingPools, setIsLoadingPools] = useState(false);
  const [authStateChangeCount, setAuthStateChangeCount] = useState(0);
  const [lastAuthStateChange, setLastAuthStateChange] = useState(0);
  
  // Pool selection debugging and control
  const [forceShowPoolSelection, setForceShowPoolSelection] = useState(false);
  const [userHasChosenPoolThisSession, setUserHasChosenPoolThisSession] = useState(false);

  // Memoized permission checks
  const getUserRole = useCallback((poolId: string) => {
    const membership = userPools.find(p => p.pool_id === poolId);
    return membership?.role || null;
  }, [userPools]);

  const canManagePool = useCallback((poolId?: string) => {
    const targetPoolId = poolId || activePool?.id;
    if (!targetPoolId) return false;
    const role = getUserRole(targetPoolId);
    return role === 'owner' || role === 'admin';
  }, [activePool?.id, getUserRole]);

  const isPoolOwner = useCallback((poolId?: string) => {
    const targetPoolId = poolId || activePool?.id;
    if (!targetPoolId) return false;
    return getUserRole(targetPoolId) === 'owner';
  }, [activePool?.id, getUserRole]);

  const canViewFinancials = useCallback((poolId?: string) => {
    return canManagePool(poolId);
  }, [canManagePool]);

  const canManageRoles = useCallback((poolId?: string) => {
    return isPoolOwner(poolId);
  }, [isPoolOwner]);

  const canManageWeeklyEvents = useCallback((poolId?: string) => {
    return canManagePool(poolId);
  }, [canManagePool]);

  const canManageBonusQuestions = useCallback((poolId?: string) => {
    return canManagePool(poolId);
  }, [canManagePool]);

  // Check if cached data is still valid
  const isCacheValid = useCallback((cache: CachedData | null): boolean => {
    if (!cache) return false;
    return Date.now() - cache.timestamp < CACHE_DURATION;
  }, []);

  // Simplified pool loading to avoid RLS issues and infinite loops
  const loadUserPoolsOptimized = useCallback(async (useCache = true) => {
    // Prevent concurrent loading calls
    if (isLoadingPools) {
      console.log('⚠️ Pool loading already in progress, skipping...');
      return;
    }

    try {
      setIsLoadingPools(true);
      setError(null);
      setUserPoolsLoading(true);
      console.log('🔄 Loading user pools...');

      // Check cache first
      if (useCache && cachedData && isCacheValid(cachedData)) {
        console.log('📋 Using cached data');
        setUserPools(cachedData.userPools);
        setPoolEntries(cachedData.poolEntries);
        setUserPoolsLoading(false);
        setIsLoadingPools(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No user found');
        setUserPools([]);
        setPoolEntries([]);
        setUserPoolsLoading(false);
        setIsLoadingPools(false);
        return;
      }

      // Simplified query - separate queries to avoid RLS complexity
      console.log('📡 Fetching pool memberships...');
      
      // First get memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('pool_memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true);

      if (membershipError) {
        console.error('❌ Membership error:', membershipError);
        throw membershipError;
      }

      if (!memberships || memberships.length === 0) {
        console.log('❌ No pool memberships found');
        setUserPools([]);
        setPoolEntries([]);
        setUserPoolsLoading(false);
        setIsLoadingPools(false);
        return;
      }

      console.log(`📊 Found ${memberships.length} pool memberships`);

      // Then get pools for those memberships
      const poolIds = memberships.map(m => m.pool_id);
      const { data: pools, error: poolsError } = await supabase
        .from('pools')
        .select('*')
        .in('id', poolIds);

      if (poolsError) {
        console.error('❌ Pools error:', poolsError);
        throw poolsError;
      }

      console.log(`📊 Found ${pools?.length || 0} pools`);

      // Map pools to memberships with proper typing
      const poolMemberships: PoolMembership[] = memberships.map(membership => ({
        ...membership,
        role: membership.role as 'owner' | 'admin' | 'member',
        pool: pools?.find(p => p.id === membership.pool_id)
      }));

      // Get pool entries separately (simplified query)
      const { data: entries, error: entriesError } = await supabase
        .from('pool_entries')
        .select('*')
        .in('pool_id', poolIds)
        .is('deleted_at', null)
        .order('total_points', { ascending: false });

      if (entriesError) {
        console.error('❌ Entries error:', entriesError);
        // Don't fail for entries - continue without them
      }

      const allEntries = entries || [];
      console.log(`📊 Found ${allEntries.length} pool entries`);

      // Cache the results
      const newCachedData: CachedData = {
        userPools: poolMemberships,
        poolEntries: allEntries,
        timestamp: Date.now(),
        activePoolId: activePool?.id
      };
      setCachedData(newCachedData);

      setUserPools(poolMemberships);
      setPoolEntries(allEntries);
      
      console.log('✅ Successfully loaded user pools and entries');
      
    } catch (error: any) {
      console.error('Error loading user pools:', error);
      setError(error.message || 'Failed to load pools');
      setUserPools([]);
      setPoolEntries([]);
    } finally {
      setUserPoolsLoading(false);
      setIsLoadingPools(false);
    }
  }, [cachedData, isCacheValid, activePool?.id, isLoadingPools]);

  // Optimized pool-specific subscription
  const setupPoolSubscription = useCallback((poolId: string) => {
    // Clean up existing subscription
    if (subscriptionChannel) {
      supabase.removeChannel(subscriptionChannel);
    }

    // Create new pool-specific subscription
    const channel = supabase
      .channel(`pool-${poolId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pool_entries', filter: `pool_id=eq.${poolId}` },
        () => {
          // Refresh entries for this pool only
          loadPoolEntriesOptimized(poolId);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pools', filter: `id=eq.${poolId}` },
        () => {
          // Refresh the active pool
          refreshPool();
        }
      )
      .subscribe();

    setSubscriptionChannel(channel);
  }, [subscriptionChannel]);

  const loadPoolEntriesOptimized = useCallback(async (poolId: string) => {
    try {
      const { data, error } = await supabase
        .from('pool_entries')
        .select('*')
        .eq('pool_id', poolId)
        .is('deleted_at', null)
        .order('total_points', { ascending: false });

      if (error) throw error;
      
      // Update only entries for this pool
      setPoolEntries(prev => {
        const otherPoolEntries = prev.filter(e => e.pool_id !== poolId);
        return [...otherPoolEntries, ...(data || [])];
      });
    } catch (error) {
      console.error('Error loading pool entries:', error);
    }
  }, []);

  const setActivePool = useCallback((pool: Pool | null) => {
    console.log('🎯 DEBUG: setActivePool called with:', pool?.name || 'null', new Date().toISOString());
    setActivePoolState(pool);
    setUserHasChosenPoolThisSession(true);
    
    if (pool) {
      localStorage.setItem('activePoolId', pool.id);
      setupPoolSubscription(pool.id);
      loadPoolEntriesOptimized(pool.id);
    } else {
      localStorage.removeItem('activePoolId');
      if (subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel);
        setSubscriptionChannel(null);
      }
    }
  }, [setupPoolSubscription, loadPoolEntriesOptimized, subscriptionChannel]);

  const clearActivePool = useCallback(() => {
    console.log('🧹 DEBUG: clearActivePool called', new Date().toISOString());
    setActivePoolState(null);
    setUserHasChosenPoolThisSession(false);
    localStorage.removeItem('activePoolId');
    if (subscriptionChannel) {
      supabase.removeChannel(subscriptionChannel);
      setSubscriptionChannel(null);
    }
  }, [subscriptionChannel]);

  const refreshPool = useCallback(async () => {
    if (!activePool) return;
    
    try {
      const { data: poolData } = await supabase
        .from('pools')
        .select('*')
        .eq('id', activePool.id)
        .single();
      
      if (poolData) {
        setActivePoolState(poolData);
      }
    } catch (error) {
      console.error('Error refreshing pool:', error);
    }
  }, [activePool]);

  const retryLoading = useCallback(() => {
    setError(null);
    loadUserPoolsOptimized(false); // Force refresh without cache
  }, [loadUserPoolsOptimized]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    activePool,
    setActivePool,
    clearActivePool,
    forceShowPoolSelection,
    setForceShowPoolSelection,
    refreshPool,
    loading,
    userPools,
    userPoolsLoading,
    poolEntries,
    createPool: async (poolData: any) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: pool, error } = await supabase
          .from('pools')
          .insert({ ...poolData, owner_id: user.id })
          .select()
          .single();

        if (error) throw error;

        const { error: membershipError } = await supabase
          .from('pool_memberships')
          .insert({
            user_id: user.id,
            pool_id: pool.id,
            role: 'owner'
          });

        if (membershipError) throw membershipError;

        await supabase.rpc('seed_new_pool_defaults', { target_pool_id: pool.id });
        await loadUserPoolsOptimized(false);
        return { success: true, data: pool };
      } catch (error: any) {
        console.error('Error creating pool:', error);
        return { success: false, error: error.message };
      }
    },
    joinPoolByCode: async (inviteCode: string) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'You must be logged in to join a pool' };

        const { data: pool, error: poolError } = await supabase
          .from('pools')
          .select('*')
          .eq('invite_code', inviteCode.toUpperCase())
          .single();

        if (poolError || !pool) {
          return { success: false, error: 'Invalid invite code' };
        }

        const { data: existingMembership } = await supabase
          .from('pool_memberships')
          .select('*')
          .eq('user_id', user.id)
          .eq('pool_id', pool.id)
          .eq('active', true)
          .single();

        if (existingMembership) {
          await loadUserPoolsOptimized(false);
          return { success: true, data: pool };
        }

        if (!pool.allow_new_participants) {
          return { success: false, error: 'This pool is not currently accepting new participants' };
        }

        if (pool.registration_deadline) {
          const deadline = new Date(pool.registration_deadline);
          if (new Date() > deadline) {
            return { success: false, error: 'Registration deadline has passed for this pool' };
          }
        }

        const { error: membershipError } = await supabase
          .from('pool_memberships')
          .insert({
            user_id: user.id,
            pool_id: pool.id,
            role: 'member'
          });

        if (membershipError) {
          return { success: false, error: 'Failed to join pool. Please try again.' };
        }

        await loadUserPoolsOptimized(false);
        return { success: true, data: pool };
      } catch (error: any) {
        return { success: false, error: error.message || 'Failed to join pool' };
      }
    },
    updatePool: async (poolId: string, updates: any) => {
      try {
        const { error } = await supabase
          .from('pools')
          .update(updates)
          .eq('id', poolId);

        if (error) throw error;

        if (activePool?.id === poolId) {
          await refreshPool();
        }
        await loadUserPoolsOptimized(false);
        return true;
      } catch (error) {
        console.error('Error updating pool:', error);
        return false;
      }
    },
    deletePool: async (poolId: string, adminConfirmsRefunds = false) => {
      try {
        // Check if the user is an admin or the owner
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
    
        const role = getUserRole(poolId);
        if (role !== 'owner' && role !== 'admin') {
          throw new Error('You do not have permission to delete this pool.');
        }
    
        // Fetch all pool entries for the pool to be deleted
        const { data: poolEntries, error: poolEntriesError } = await supabase
          .from('pool_entries')
          .select('*')
          .eq('pool_id', poolId);
    
        if (poolEntriesError) {
          console.error('Error fetching pool entries:', poolEntriesError);
          throw new Error('Failed to fetch pool entries for deletion.');
        }
    
        // Determine if refunds are required based on payment status
        let refundsRequired = false;
        if (poolEntries && poolEntries.length > 0) {
          refundsRequired = poolEntries.some(entry => entry.payment_confirmed);
        }
    
        // If refunds are required but adminConfirmsRefunds is false, return an error
        if (refundsRequired && !adminConfirmsRefunds) {
          throw new Error('This pool has confirmed payments. You must confirm that refunds have been issued before deleting the pool.');
        }
    
        // Proceed with deletion if no refunds are required or admin has confirmed refunds
        // Delete pool entries
        const { error: deletePoolEntriesError } = await supabase
          .from('pool_entries')
          .delete()
          .eq('pool_id', poolId);
    
        if (deletePoolEntriesError) {
          console.error('Error deleting pool entries:', deletePoolEntriesError);
          throw new Error('Failed to delete pool entries.');
        }
    
        // Delete pool memberships
        const { error: deleteMembershipsError } = await supabase
          .from('pool_memberships')
          .delete()
          .eq('pool_id', poolId);
    
        if (deleteMembershipsError) {
          console.error('Error deleting pool memberships:', deleteMembershipsError);
          throw new Error('Failed to delete pool memberships.');
        }
    
        // Finally, delete the pool
        const { error: deletePoolError } = await supabase
          .from('pools')
          .delete()
          .eq('id', poolId);
    
        if (deletePoolError) {
          console.error('Error deleting pool:', deletePoolError);
          throw new Error('Failed to delete the pool.');
        }
    
        // Optionally, refresh the pool list
        await loadUserPoolsOptimized(false);
        setActivePoolState(null);
        return true;
      } catch (error: any) {
        console.error('Error deleting pool:', error);
        return false;
      }
    },
    leavePool: async (poolId: string) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
    
        // Check if the user is the owner
        const role = getUserRole(poolId);
        if (role === 'owner') {
          return { success: false, error: 'Pool owners cannot leave the pool. You must delete the pool instead.' };
        }
    
        // Delete the pool membership
        const { error: deleteMembershipError } = await supabase
          .from('pool_memberships')
          .delete()
          .eq('pool_id', poolId)
          .eq('user_id', user.id);
    
        if (deleteMembershipError) {
          console.error('Error deleting pool membership:', deleteMembershipError);
          return { success: false, error: 'Failed to leave pool. Please try again.' };
        }
    
        // Optionally, refresh the pool list
        await loadUserPoolsOptimized(false);
        return { success: true };
      } catch (error: any) {
        console.error('Error leaving pool:', error);
        return { success: false, error: error.message || 'Failed to leave pool' };
      }
    },
    getPoolPaymentStatus: async (poolId: string): Promise<boolean> => {
      try {
        const { data, error } = await supabase
          .from('pool_entries')
          .select('payment_confirmed')
          .eq('pool_id', poolId)
          .eq('payment_confirmed', true);

        if (error) throw error;
        return data.length > 0;
      } catch (error) {
        console.error('Error checking pool payment status:', error);
        return false;
      }
    },
    getUserPaymentStatus: async (poolId: string, userId: string): Promise<boolean> => {
      try {
        const { data, error } = await supabase
          .from('pool_entries')
          .select('payment_confirmed')
          .eq('pool_id', poolId)
          .eq('user_id', userId)
          .single();

        if (error) return false;
        return data?.payment_confirmed || false;
      } catch (error) {
        console.error('Error checking user payment status:', error);
        return false;
      }
    },
    refreshPools: async () => {
      await loadUserPoolsOptimized(false);
    },
    loadAllUserPoolEntries: async () => {
      await loadUserPoolsOptimized(false);
    },
    getUserRole,
    canManagePool,
    isPoolOwner,
    canViewFinancials,
    canManageRoles,
    canManageWeeklyEvents,
    canManageBonusQuestions,
    error,
    retryLoading
  }), [
    activePool, loading, userPools, userPoolsLoading, poolEntries, error,
    setActivePool, clearActivePool, forceShowPoolSelection, refreshPool, getUserRole, canManagePool, isPoolOwner,
    canViewFinancials, canManageRoles, canManageWeeklyEvents, canManageBonusQuestions,
    loadUserPoolsOptimized, retryLoading
  ]);

  // Auto-select active pool logic - only restore saved pools, don't auto-select
  useEffect(() => {
    const timestamp = new Date().toISOString();
    const savedPoolId = localStorage.getItem('activePoolId');
    
    console.log('🔄 DEBUG Pool Selection Effect:', {
      timestamp,
      userPoolsLength: userPools.length,
      userPoolsLoading,
      activePool: activePool?.name || null,
      loading,
      forceShowPoolSelection,
      userHasChosenPoolThisSession,
      savedPoolId,
      availablePoolNames: userPools.map(p => p.pool?.name).join(', ')
    });

    // If force show is enabled, clear active pool and return
    if (forceShowPoolSelection) {
      console.log('🚨 DEBUG: Force show pool selection is enabled - clearing active pool');
      if (activePool) {
        setActivePoolState(null);
        setUserHasChosenPoolThisSession(false);
      }
      setLoading(false);
      return;
    }

    if (userPools.length > 0 && !userPoolsLoading) {
      console.log('✅ DEBUG: User has pools, checking conditions...');
      
      // Only restore a previously saved pool if user hasn't chosen one this session
      if (savedPoolId && !userHasChosenPoolThisSession) {
        const savedPool = userPools.find(p => p.pool_id === savedPoolId)?.pool;
        if (savedPool && !activePool) {
          console.log('🎯 DEBUG: Restoring saved pool from localStorage:', savedPool.name);
          setActivePoolState(savedPool); // Use direct state setter to avoid triggering session flag
          setLoading(false);
          return;
        } else if (savedPoolId && !savedPool) {
          console.log('⚠️ DEBUG: Saved pool ID not found in user pools, clearing localStorage');
          localStorage.removeItem('activePoolId');
        }
      }
      
      // If no saved pool or user needs to choose, leave activePool as null to show pool selection screen
      console.log('🎯 DEBUG: No saved pool to restore - leaving activePool null for pool selection');
      setLoading(false);
    } else if (userPools.length === 0 && !userPoolsLoading) {
      console.log('❌ DEBUG: No pools available - clearing active pool');
      // No pools available - clear active pool and stop loading
      setActivePoolState(null);
      setLoading(false);
    }
  }, [userPools, userPoolsLoading, activePool, forceShowPoolSelection, userHasChosenPoolThisSession]);

  // Enhanced auth state handling with anti-infinite loop protection
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const now = Date.now();
      console.log('🔐 Auth state change:', event, session?.user?.email || 'no session');
      
      // Anti-infinite loop protection
      if (now - lastAuthStateChange < 1000) { // Less than 1 second since last change
        setAuthStateChangeCount(prev => prev + 1);
        if (authStateChangeCount > 5) {
          console.error('🚨 Too many auth state changes detected, preventing infinite loop');
          return;
        }
      } else {
        setAuthStateChangeCount(0); // Reset counter after 1 second gap
      }
      setLastAuthStateChange(now);
      
      if (event === 'SIGNED_IN') {
        console.log('🚀 User signed in - loading pools immediately');
        // User just signed in - use setTimeout to break potential loop
        setLoading(true);
        setTimeout(() => {
          loadUserPoolsOptimized(false);
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out - clearing all data');
        // User signed out - clear everything
        setUserPools([]);
        setPoolEntries([]);
        setActivePoolState(null);
        localStorage.removeItem('activePoolId');
        setLoading(false);
        setIsLoadingPools(false);
        if (subscriptionChannel) {
          supabase.removeChannel(subscriptionChannel);
          setSubscriptionChannel(null);
        }
      }
    });

    console.log('🔄 Initial pool context setup');
    // Initial load with small delay to avoid race conditions
    setTimeout(() => {
      loadUserPoolsOptimized();
    }, 50);

    return () => subscription.unsubscribe();
  }, [loadUserPoolsOptimized, lastAuthStateChange, authStateChangeCount]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel);
      }
    };
  }, [subscriptionChannel]);

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
