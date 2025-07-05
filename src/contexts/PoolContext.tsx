import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Pool, PoolMembership, PoolEntry, ScoringRules, WeeklyResults } from '@/types/pool';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface PoolContextType {
  // Current pool state
  activePool: Pool | null;
  setActivePool: (pool: Pool | null) => void;
  
  // User's pools
  userPools: PoolMembership[];
  loadUserPools: () => Promise<void>;
  
  // Pool management
  createPool: (poolData: Partial<Pool>) => Promise<Pool | null>;
  joinPoolByCode: (inviteCode: string) => Promise<{ success: boolean; error?: string; pool?: Pool }>;
  updatePool: (poolId: string, updates: Partial<Pool>) => Promise<boolean>;
  deletePool: (poolId: string) => Promise<boolean>;
  leavePool: (poolId: string) => Promise<boolean>;
  
  // Pool membership
  getUserRole: (poolId?: string) => 'owner' | 'admin' | 'member' | null;
  canManagePool: (poolId?: string) => boolean;
  
  // Legacy compatibility
  contestants: any[];
  poolEntries: PoolEntry[];
  scoringRules: ScoringRules;
  weeklyResults: WeeklyResults[];
  addPoolEntry: (entry: Omit<PoolEntry, 'id' | 'created_at' | 'updated_at' | 'pool_id'>) => void;
  updateContestants: (contestants: any[]) => void;
  addWeeklyResults: (results: WeeklyResults) => void;
  calculateScores: () => void;
  resetPool: () => void;
  
  loading: boolean;
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

const defaultScoringRules: ScoringRules = {
  hoh: 10,
  pov: 5,
  evicted: 20,
  bonus: 5,
  survival: 5,
};

export const PoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePool, setActivePool] = useState<Pool | null>(null);
  const [userPools, setUserPools] = useState<PoolMembership[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Legacy states for compatibility
  const [contestants, setContestants] = useState<any[]>([]);
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [scoringRules] = useState<ScoringRules>(defaultScoringRules);
  const [weeklyResults, setWeeklyResults] = useState<WeeklyResults[]>([]);

  // Load user's pools and set active pool
  const loadUserPools = useCallback(async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session?.user) {
        setUserPools([]);
        setActivePool(null);
        return;
      }

      const { data: memberships, error } = await supabase
        .from('pool_memberships')
        .select(`
          *,
          pool:pools(*)
        `)
        .eq('user_id', session.session.user.id)
        .eq('active', true)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error loading user pools:', error);
        return;
      }

      const poolMemberships = (memberships || []).map(m => ({
        ...m,
        role: m.role as 'owner' | 'admin' | 'member',
        pool: m.pool as Pool
      })) as PoolMembership[];

      setUserPools(poolMemberships);

      // Set active pool to first pool if none is set and user has pools
      if (!activePool && poolMemberships.length > 0) {
        setActivePool(poolMemberships[0].pool!);
      }
    } catch (error) {
      console.error('Error loading user pools:', error);
    } finally {
      setLoading(false);
    }
  }, [activePool]);

  // Initialize on mount and auth changes
  useEffect(() => {
    loadUserPools();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        loadUserPools();
      } else if (event === 'SIGNED_OUT') {
        setUserPools([]);
        setActivePool(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserPools]);

  const createPool = useCallback(async (poolData: Partial<Pool>): Promise<Pool | null> => {
    try {
      console.log('=== POOL CREATION START ===');
      console.log('Input data:', poolData);

      // Test basic connection first
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('pools')
        .select('count')
        .limit(0)
        .single();
      
      if (testError && testError.code !== 'PGRST116') { // PGRST116 is expected for empty result
        console.error('Connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      console.log('✓ Database connection successful');

      // Enhanced authentication validation
      console.log('Checking user authentication...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User fetch error:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        console.error('No user found');
        throw new Error('User not authenticated');
      }
      
      console.log('✓ User authenticated:', user.id);

      // Force a fresh session token to ensure auth is current
      console.log('Refreshing session token...');
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Session refresh error:', refreshError);
        throw new Error(`Session refresh failed: ${refreshError.message}`);
      }

      if (!session?.user || session.user.id !== user.id) {
        console.error('Session validation failed - user mismatch');
        throw new Error('Session validation failed - authentication state inconsistent');
      }

      console.log('✓ Session refreshed and validated');
      console.log('Creating pool for authenticated user:', user.id);

      // Create pool data with proper defaults matching database schema
      const freshPoolData = {
        owner_id: user.id,
        name: poolData.name!,
        description: poolData.description || null,
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
        registration_deadline: null,
      };

      console.log('Creating fresh pool with data:', freshPoolData);

      // Add retry logic for RLS timing issues
      let pool = null;
      let error = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`Pool creation attempt ${attempt} of 3`);
        console.log('Sending request to Supabase...');
        
        const result = await supabase
          .from('pools')
          .insert(freshPoolData)
          .select()
          .single();
          
        console.log(`Attempt ${attempt} result:`, result);
          
        if (result.error) {
          error = result.error;
          console.error(`Attempt ${attempt} failed:`, result.error);
          
          if (result.error.message?.includes('row-level security policy')) {
            // Wait a bit for auth state to sync, then retry
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
            continue;
          } else {
            // Non-RLS error, don't retry
            break;
          }
        } else {
          pool = result.data;
          error = null;
          break;
        }
      }

      if (error) {
        console.error('Pool creation failed after retries:', error);
        console.error('Full error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        console.error('Failed pool data:', freshPoolData);
        
        // Throw a detailed error message
        const errorMsg = error.details || error.hint || error.message || 'Unknown database error';
        throw new Error(`Database error: ${errorMsg}`);
      }

      if (!pool) {
        console.error('No pool data returned');
        return null;
      }

      console.log('Fresh pool created successfully:', pool);

      // Create owner membership with same retry logic
      let membershipError = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        const result = await supabase
          .from('pool_memberships')
          .insert({
            user_id: user.id,
            pool_id: pool.id,
            role: 'owner'
          });

        if (result.error) {
          membershipError = result.error;
          if (result.error.message?.includes('row-level security policy') && attempt === 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
        } else {
          membershipError = null;
          break;
        }
      }

      if (membershipError) {
        console.error('Error creating membership:', membershipError);
        // Still return the pool even if membership creation fails
      }

      await loadUserPools();
      return pool;
    } catch (error) {
      console.error('Error creating pool:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      throw error; // Re-throw to let the UI handle the specific error message
    }
  }, [loadUserPools]);

  const joinPoolByCode = useCallback(async (inviteCode: string) => {
    try {
      const { data, error } = await supabase.rpc('join_pool_by_invite', {
        invite_code_param: inviteCode
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const result = data as { success: boolean; error?: string; pool_id?: string; pool_name?: string };

      if (result.success) {
        await loadUserPools();
        const joinedPool = userPools.find(p => p.pool_id === result.pool_id)?.pool;
        return { success: true, pool: joinedPool };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Failed to join pool' };
    }
  }, [loadUserPools, userPools]);

  const updatePool = useCallback(async (poolId: string, updates: Partial<Pool>) => {
    try {
      const { error } = await supabase
        .from('pools')
        .update(updates)
        .eq('id', poolId);

      if (error) {
        console.error('Error updating pool:', error);
        return false;
      }

      await loadUserPools();
      return true;
    } catch (error) {
      console.error('Error updating pool:', error);
      return false;
    }
  }, [loadUserPools]);

  // Delete pool (only for pool owners)
  const deletePool = useCallback(async (poolId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pools')
        .delete()
        .eq('id', poolId);

      if (error) throw error;

      // Clear active pool if it was deleted
      if (activePool?.id === poolId) {
        setActivePool(null);
      }

      // Refresh pools
      await loadUserPools();
      return true;
    } catch (error) {
      console.error('Error deleting pool:', error);
      return false;
    }
  }, [activePool, loadUserPools]);

  const leavePool = useCallback(async (poolId: string) => {
    try {
      const { error } = await supabase
        .from('pool_memberships')
        .update({ active: false })
        .eq('pool_id', poolId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error('Error leaving pool:', error);
        return false;
      }

      await loadUserPools();
      
      // If user left the active pool, switch to another pool
      if (activePool?.id === poolId) {
        const remainingPools = userPools.filter(p => p.pool_id !== poolId);
        setActivePool(remainingPools.length > 0 ? remainingPools[0].pool! : null);
      }

      return true;
    } catch (error) {
      console.error('Error leaving pool:', error);
      return false;
    }
  }, [loadUserPools, activePool, userPools]);

  const getUserRole = useCallback((poolId?: string): 'owner' | 'admin' | 'member' | null => {
    const targetPoolId = poolId || activePool?.id;
    if (!targetPoolId) return null;
    
    const membership = userPools.find(p => p.pool_id === targetPoolId);
    return membership?.role || null;
  }, [userPools, activePool]);

  const canManagePool = useCallback((poolId?: string) => {
    const role = getUserRole(poolId);
    return role === 'owner' || role === 'admin';
  }, [getUserRole]);

  // Legacy compatibility functions
  const addPoolEntry = useCallback((entry: Omit<PoolEntry, 'id' | 'created_at' | 'updated_at' | 'pool_id'>) => {
    if (!activePool) return;
    
    const newEntry: PoolEntry = {
      ...entry,
      id: Date.now().toString(),
      pool_id: activePool.id,
      created_at: new Date(),
      updated_at: new Date(),
    };
    setPoolEntries(prev => [...prev, newEntry]);
  }, [activePool]);

  const updateContestants = useCallback((newContestants: any[]) => {
    setContestants(newContestants);
  }, []);

  const addWeeklyResults = useCallback((results: WeeklyResults) => {
    setWeeklyResults(prev => [...prev, results]);
  }, []);

  const calculateScores = useCallback(() => {
    console.log('Score calculation triggered - handled by admin panel');
  }, []);

  const resetPool = useCallback(() => {
    setPoolEntries([]);
    setWeeklyResults([]);
  }, []);

  return (
    <PoolContext.Provider value={{
      activePool,
      setActivePool,
      userPools,
      loadUserPools,
      createPool,
      joinPoolByCode,
      updatePool,
      deletePool,
      leavePool,
      getUserRole,
      canManagePool,
      contestants,
      poolEntries,
      scoringRules,
      weeklyResults,
      addPoolEntry,
      updateContestants,
      addWeeklyResults,
      calculateScores,
      resetPool,
      loading,
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