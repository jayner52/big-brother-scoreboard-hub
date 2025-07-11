import React, { createContext, useContext, useEffect, useState } from 'react';
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

interface PoolContextType {
  activePool: Pool | null;
  setActivePool: (pool: Pool | null) => void;
  refreshPool: () => void;
  loading: boolean;
  userPools: PoolMembership[];
  userPoolsLoading: boolean;
  poolEntries: PoolEntry[];
  createPool: (poolData: any) => Promise<{ success: boolean; data?: Pool; error?: string }>;
  joinPoolByCode: (inviteCode: string) => Promise<{ success: boolean; data?: Pool; error?: string }>;
  updatePool: (poolId: string, updates: any) => Promise<boolean>;
  deletePool: (poolId: string) => Promise<boolean>;
  leavePool: (poolId: string) => Promise<{ success: boolean; error?: string }>;
  transferOwnership: (poolId: string, newOwnerId: string) => Promise<{ success: boolean; error?: string }>;
  getPoolPaymentStatus: (poolId: string) => Promise<boolean>;
  getEligibleAdminsForTransfer: (poolId: string) => Promise<Array<{ user_id: string; display_name: string }>>;
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
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

export const PoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePool, setActivePoolState] = useState<Pool | null>(null);
  const [userPools, setUserPools] = useState<PoolMembership[]>([]);
  const [userPoolsLoading, setUserPoolsLoading] = useState(false);
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  

  const setActivePool = (pool: Pool | null) => {
    setActivePoolState(pool);
    if (pool) {
      localStorage.setItem('activePoolId', pool.id);
      loadPoolEntries(pool.id);
    } else {
      localStorage.removeItem('activePoolId');
      setPoolEntries([]);
    }
  };

  const refreshPool = async () => {
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
  };

  const loadUserPools = async () => {
    try {
      setUserPoolsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserPools([]);
        return;
      }

      const { data: memberships, error } = await supabase
        .from('pool_memberships')
        .select(`
          *,
          pool:pools(*)
        `)
        .eq('user_id', user.id)
        .eq('active', true);

      if (error) throw error;
      setUserPools((memberships || []) as PoolMembership[]);
      
      // Load entries for all user pools after loading pools
      if (memberships && memberships.length > 0) {
        const poolIds = memberships.map(p => p.pool_id);
        const { data: entriesData, error: entriesError } = await supabase
          .from('pool_entries')
          .select('*')
          .in('pool_id', poolIds)
          .order('total_points', { ascending: false });

        if (!entriesError && entriesData) {
          setPoolEntries(entriesData);
        }
      }
    } catch (error) {
      console.error('Error loading user pools:', error);
      setUserPools([]);
    } finally {
      setUserPoolsLoading(false);
    }
  };

  const loadPoolEntries = async (poolId: string) => {
    try {
      const { data, error } = await supabase
        .from('pool_entries')
        .select('*')
        .eq('pool_id', poolId)
        .order('total_points', { ascending: false });

      if (error) throw error;
      setPoolEntries(data || []);
    } catch (error) {
      console.error('Error loading pool entries:', error);
    }
  };

  const loadAllUserPoolEntries = async () => {
    try {
      if (userPools.length === 0) return;
      
      const poolIds = userPools.map(p => p.pool_id);
      const { data, error } = await supabase
        .from('pool_entries')
        .select('*')
        .in('pool_id', poolIds)
        .order('total_points', { ascending: false });

      if (error) throw error;
      setPoolEntries(data || []);
    } catch (error) {
      console.error('Error loading all pool entries:', error);
    }
  };

  const createPool = async (poolData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: pool, error } = await supabase
        .from('pools')
        .insert({ ...poolData, owner_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Create membership for the owner
      const { error: membershipError } = await supabase
        .from('pool_memberships')
        .insert({
          user_id: user.id,
          pool_id: pool.id,
          role: 'owner'
        });

      if (membershipError) throw membershipError;

      // Seed the pool with defaults
      await supabase.rpc('seed_new_pool_defaults', { target_pool_id: pool.id });

      await refreshPools();
      return { success: true, data: pool };
    } catch (error: any) {
      console.error('Error creating pool:', error);
      return { success: false, error: error.message };
    }
  };

  const joinPoolByCode = async (inviteCode: string) => {
    try {
      console.log('🔧 JOIN POOL - Starting join process with code:', inviteCode);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('🔧 JOIN POOL - User not authenticated');
        return { success: false, error: 'You must be logged in to join a pool' };
      }

      console.log('🔧 JOIN POOL - User authenticated:', user.id);

      // Look for pool with the invite code
      const { data: pool, error: poolError } = await supabase
        .from('pools')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (poolError || !pool) {
        console.error('🔧 JOIN POOL - Pool not found:', poolError);
        return { success: false, error: 'Invalid invite code' };
      }

      console.log('🔧 JOIN POOL - Pool found:', pool.name);

      // Check if user is already a member
      const { data: existingMembership } = await supabase
        .from('pool_memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('pool_id', pool.id)
        .eq('active', true)
        .single();

      if (existingMembership) {
        console.log('🔧 JOIN POOL - User already a member');
        await refreshPools();
        return { success: true, data: pool };
      }

      // Check if new participants are allowed
      if (!pool.allow_new_participants) {
        console.error('🔧 JOIN POOL - New participants not allowed');
        return { success: false, error: 'This pool is not currently accepting new participants' };
      }

      // Check registration deadline
      if (pool.registration_deadline) {
        const deadline = new Date(pool.registration_deadline);
        if (new Date() > deadline) {
          console.error('🔧 JOIN POOL - Registration deadline passed');
          return { success: false, error: 'Registration deadline has passed for this pool' };
        }
      }

      // Create the membership
      const { error: membershipError } = await supabase
        .from('pool_memberships')
        .insert({
          user_id: user.id,
          pool_id: pool.id,
          role: 'member'
        });

      if (membershipError) {
        console.error('🔧 JOIN POOL - Membership creation failed:', membershipError);
        return { success: false, error: 'Failed to join pool. Please try again.' };
      }

      console.log('🔧 JOIN POOL - Successfully joined pool');
      await refreshPools();
      return { success: true, data: pool };
    } catch (error: any) {
      console.error('🔧 JOIN POOL - Unexpected error:', error);
      return { success: false, error: error.message || 'Failed to join pool' };
    }
  };

  const updatePool = async (poolId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('pools')
        .update(updates)
        .eq('id', poolId);

      if (error) throw error;

      if (activePool?.id === poolId) {
        await refreshPool();
      }
      await refreshPools();
      return true;
    } catch (error) {
      console.error('Error updating pool:', error);
      return false;
    }
  };

  const deletePool = async (poolId: string) => {
    try {
      const { error } = await supabase
        .from('pools')
        .delete()
        .eq('id', poolId);

      if (error) throw error;

      if (activePool?.id === poolId) {
        setActivePool(null);
      }
      await refreshPools();
      return true;
    } catch (error) {
      console.error('Error deleting pool:', error);
      return false;
    }
  };

  const leavePool = async (poolId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user is owner
      const userRole = getUserRole(poolId);
      if (userRole === 'owner') {
        // Check if pool has collected money
        const hasCollectedMoney = await getPoolPaymentStatus(poolId);
        if (hasCollectedMoney) {
          throw new Error('Cannot leave pool with collected funds. Pool must be completed or funds returned.');
        }
      }

      // Check if this is user's only pool
      const activePools = userPools.filter(p => p.active);
      if (activePools.length <= 1) {
        throw new Error('You must be in at least one pool. Join another pool first.');
      }

      const { error } = await supabase
        .from('pool_memberships')
        .update({ active: false })
        .eq('pool_id', poolId)
        .eq('user_id', user.id);

      if (error) throw error;

      // If leaving active pool, switch to another available pool
      if (activePool?.id === poolId) {
        const remainingPools = userPools.filter(p => p.pool_id !== poolId && p.active);
        if (remainingPools.length > 0) {
          setActivePool(remainingPools[0].pool!);
        } else {
          setActivePool(null);
        }
      }
      
      await refreshPools();
      return { success: true };
    } catch (error) {
      console.error('Error leaving pool:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to leave pool' };
    }
  };

  const transferOwnership = async (poolId: string, newOwnerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Verify current user is owner
      const userRole = getUserRole(poolId);
      if (userRole !== 'owner') {
        throw new Error('Only pool owners can transfer ownership');
      }

      // Verify new owner is an admin
      const { data: newOwnerMembership, error: membershipError } = await supabase
        .from('pool_memberships')
        .select('role')
        .eq('pool_id', poolId)
        .eq('user_id', newOwnerId)
        .eq('active', true)
        .single();

      if (membershipError || !newOwnerMembership || newOwnerMembership.role !== 'admin') {
        throw new Error('New owner must be an admin of the pool');
      }

      // Update pool owner
      const { error: poolError } = await supabase
        .from('pools')
        .update({ owner_id: newOwnerId })
        .eq('id', poolId);

      if (poolError) throw poolError;

      // Update old owner to member role
      const { error: oldOwnerError } = await supabase
        .from('pool_memberships')
        .update({ role: 'member' })
        .eq('pool_id', poolId)
        .eq('user_id', user.id);

      if (oldOwnerError) throw oldOwnerError;

      // Update new owner role
      const { error: newOwnerError } = await supabase
        .from('pool_memberships')
        .update({ role: 'owner' })
        .eq('pool_id', poolId)
        .eq('user_id', newOwnerId);

      if (newOwnerError) throw newOwnerError;

      await refreshPools();
      return { success: true };
    } catch (error) {
      console.error('Error transferring ownership:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to transfer ownership' };
    }
  };

  const getPoolPaymentStatus = async (poolId: string): Promise<boolean> => {
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
  };

  const getEligibleAdminsForTransfer = async (poolId: string) => {
    try {
      const { data, error } = await supabase
        .from('pool_memberships')
        .select(`
          user_id
        `)
        .eq('pool_id', poolId)
        .eq('role', 'admin')
        .eq('active', true);

      if (error) throw error;
      
      // Get profiles separately to avoid complex join issues
      const profilePromises = data.map(async (membership) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', membership.user_id)
          .single();
        
        return {
          user_id: membership.user_id,
          display_name: profile?.display_name || 'Unknown User'
        };
      });
      
      return await Promise.all(profilePromises);
    } catch (error) {
      console.error('Error getting eligible admins:', error);
      return [];
    }
  };

  const getUserPaymentStatus = async (poolId: string, userId: string): Promise<boolean> => {
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
  };

  const refreshPools = async () => {
    await loadUserPools();
    await loadAllUserPoolEntries();
  };

  const getUserRole = (poolId: string) => {
    const membership = userPools.find(p => p.pool_id === poolId);
    return membership?.role || null;
  };

  const canManagePool = (poolId?: string) => {
    const targetPoolId = poolId || activePool?.id;
    if (!targetPoolId) return false;
    const role = getUserRole(targetPoolId);
    return role === 'owner' || role === 'admin';
  };

  const isPoolOwner = (poolId?: string) => {
    const targetPoolId = poolId || activePool?.id;
    if (!targetPoolId) return false;
    const role = getUserRole(targetPoolId);
    return role === 'owner';
  };

  const canViewFinancials = (poolId?: string) => {
    return canManagePool(poolId);
  };

  const canManageRoles = (poolId?: string) => {
    return isPoolOwner(poolId);
  };

  const canManageWeeklyEvents = (poolId?: string) => {
    return canManagePool(poolId);
  };

  const canManageBonusQuestions = (poolId?: string) => {
    return canManagePool(poolId);
  };

  useEffect(() => {
    const loadSavedPool = async () => {
      const savedPoolId = localStorage.getItem('activePoolId');
      if (savedPoolId) {
        try {
          const { data: poolData } = await supabase
            .from('pools')
            .select('*')
            .eq('id', savedPoolId)
            .single();
          
          if (poolData) {
            setActivePoolState(poolData);
            loadPoolEntries(poolData.id);
          }
        } catch (error) {
          console.error('Error loading saved pool:', error);
          localStorage.removeItem('activePoolId');
        }
      }
      await loadUserPools();
      setLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in, reload their pools
          await loadUserPools();
        } else if (event === 'SIGNED_OUT') {
          // User signed out, clear pools and active pool
          setUserPools([]);
          setActivePool(null);
        }
      }
    );

    loadSavedPool();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <PoolContext.Provider value={{ 
      activePool, 
      setActivePool, 
      refreshPool, 
      loading,
      userPools,
      userPoolsLoading,
      poolEntries,
      createPool,
      joinPoolByCode,
      updatePool,
      deletePool,
      leavePool,
      transferOwnership,
      getPoolPaymentStatus,
      getEligibleAdminsForTransfer,
      getUserPaymentStatus,
      refreshPools,
      getUserRole,
      canManagePool,
      isPoolOwner,
      canViewFinancials,
      canManageRoles,
      canManageWeeklyEvents,
      canManageBonusQuestions,
      loadAllUserPoolEntries
    }}>
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
