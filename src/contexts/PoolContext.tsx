import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Pool, PoolMembership, PoolEntry, Contestant, BonusQuestion, WeeklyResults } from '@/types/pool';
import { supabase } from '@/integrations/supabase/client';

interface PoolContextType {
  // Current pool state
  activePool: Pool | null;
  setActivePool: (pool: Pool | null) => void;
  
  // User's pools
  userPools: PoolMembership[];
  loadUserPools: () => Promise<void>;
  
  // Pool management
  createPool: (poolData: Partial<Pool>) => Promise<Pool>;
  joinPoolByCode: (inviteCode: string) => Promise<{ success: boolean; error?: string; pool?: Pool }>;
  updatePool: (poolId: string, updates: Partial<Pool>) => Promise<boolean>;
  deletePool: (poolId: string) => Promise<boolean>;
  leavePool: (poolId: string) => Promise<boolean>;
  
  // Pool membership
  getUserRole: (poolId?: string) => 'owner' | 'admin' | 'member' | null;
  canManagePool: (poolId?: string) => boolean;
  
  // POOL-SPECIFIC DATA (isolated by pool ID)
  poolContestants: Contestant[];
  poolEntries: PoolEntry[];
  poolBonusQuestions: BonusQuestion[];
  poolWeeklyResults: WeeklyResults[];
  
  // Pool-specific data loading
  loadPoolData: (poolId: string) => Promise<void>;
  clearPoolData: () => void;
  
  // Pool-specific operations
  addPoolEntry: (entry: Omit<PoolEntry, 'id' | 'created_at' | 'updated_at' | 'pool_id'>) => Promise<void>;
  refreshPoolData: () => Promise<void>;
  
  loading: boolean;
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

export const PoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePool, setActivePool] = useState<Pool | null>(null);
  const [userPools, setUserPools] = useState<PoolMembership[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pool-specific data states
  const [poolContestants, setPoolContestants] = useState<Contestant[]>([]);
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [poolBonusQuestions, setPoolBonusQuestions] = useState<BonusQuestion[]>([]);
  const [poolWeeklyResults, setPoolWeeklyResults] = useState<WeeklyResults[]>([]);

  // Load user's pools (simplified without race conditions)
  const loadUserPools = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserPools([]);
        setActivePool(null);
        clearPoolData();
        return;
      }

      const { data: memberships, error } = await supabase
        .from('pool_memberships')
        .select(`
          *,
          pool:pools(*)
        `)
        .eq('user_id', user.id)
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
        const firstPool = poolMemberships[0].pool!;
        setActivePool(firstPool);
        await loadPoolData(firstPool.id);
      }
    } catch (error) {
      console.error('Error loading user pools:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Remove activePool dependency to prevent infinite loops

  // Load pool-specific data
  const loadPoolData = useCallback(async (poolId: string) => {
    try {
      console.log(`Loading data for pool: ${poolId}`);
      
      // Load contestants for this specific pool
      const { data: contestants, error: contestantsError } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', poolId)
        .order('sort_order');

      if (contestantsError) {
        console.error('Error loading contestants:', contestantsError);
      } else {
        const mappedContestants = contestants?.map(c => ({
          id: c.id,
          name: c.name,
          isActive: c.is_active,
          group_id: c.group_id,
          sort_order: c.sort_order
        })) || [];
        setPoolContestants(mappedContestants);
      }
      
      // Load entries for this specific pool
      const { data: entries, error: entriesError } = await supabase
        .from('pool_entries')
        .select('*')
        .eq('pool_id', poolId)
        .order('total_points', { ascending: false });

      if (entriesError) {
        console.error('Error loading pool entries:', entriesError);
      } else {
        const mappedEntries = entries?.map(entry => ({
          ...entry,
          bonus_answers: entry.bonus_answers as Record<string, any>,
          created_at: new Date(entry.created_at),
          updated_at: new Date(entry.updated_at)
        })) || [];
        setPoolEntries(mappedEntries);
      }
      
      // Load bonus questions for this specific pool
      const { data: bonusQuestions, error: bonusError } = await supabase
        .from('bonus_questions')
        .select('*')
        .eq('pool_id', poolId)
        .order('sort_order');

      if (bonusError) {
        console.error('Error loading bonus questions:', bonusError);
      } else {
        const mappedQuestions = bonusQuestions?.map(q => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type as 'player_select' | 'dual_player_select' | 'yes_no' | 'number' | 'creature_select',
          sort_order: q.sort_order,
          is_active: q.is_active,
          correct_answer: q.correct_answer,
          points_value: q.points_value,
          answer_revealed: q.answer_revealed
        })) || [];
        setPoolBonusQuestions(mappedQuestions);
      }
      
      // Load weekly results for this specific pool
      const { data: weeklyResults, error: weeklyError } = await supabase
        .from('weekly_results')
        .select('*')
        .eq('pool_id', poolId)
        .order('week_number');

      if (weeklyError) {
        console.error('Error loading weekly results:', weeklyError);
      } else {
        const mappedResults = weeklyResults?.map(result => ({
          week: result.week_number,
          hohWinner: result.hoh_winner || undefined,
          povWinner: result.pov_winner || undefined,
          evicted: result.evicted_contestant || undefined,
          bonusWinners: [] // Placeholder - we'll add this later if needed
        })) || [];
        setPoolWeeklyResults(mappedResults);
      }
      
      console.log(`✓ Pool data loaded successfully for pool: ${poolId}`);
    } catch (error) {
      console.error('Error loading pool data:', error);
    }
  }, []);

  // Clear pool-specific data
  const clearPoolData = useCallback(() => {
    setPoolContestants([]);
    setPoolEntries([]);
    setPoolBonusQuestions([]);
    setPoolWeeklyResults([]);
  }, []);

  // Enhanced setActivePool that loads pool-specific data
  const handleSetActivePool = useCallback(async (pool: Pool | null) => {
    setActivePool(pool);
    if (pool) {
      await loadPoolData(pool.id);
    } else {
      clearPoolData();
    }
  }, [loadPoolData, clearPoolData]);

  // Initialize on mount and auth changes
  useEffect(() => {
    loadUserPools();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        loadUserPools();
      } else if (event === 'SIGNED_OUT') {
        setUserPools([]);
        setActivePool(null);
        clearPoolData();
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array to prevent infinite loops

  // Simplified createPool function
  const createPool = useCallback(async (poolData: Partial<Pool>): Promise<Pool> => {
    try {
      console.log('Creating pool with data:', poolData);

      // Simple auth check
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('You must be logged in to create a pool');
      }

      // Create pool data with proper defaults
      const poolCreateData = {
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

      // Create the pool
      const { data: pool, error: poolError } = await supabase
        .from('pools')
        .insert(poolCreateData)
        .select()
        .single();

      if (poolError) {
        console.error('Pool creation error:', poolError);
        throw new Error(`Failed to create pool: ${poolError.message}`);
      }

      if (!pool) {
        throw new Error('Pool creation returned no data');
      }

      console.log('Pool created successfully:', pool);

      // Create owner membership
      const { error: membershipError } = await supabase
        .from('pool_memberships')
        .insert({
          user_id: user.id,
          pool_id: pool.id,
          role: 'owner'
        });

      if (membershipError) {
        console.error('Error creating membership:', membershipError);
        // Continue even if membership creation fails
      }

      // Seed the pool with default data
      try {
        const { error: seedError } = await supabase.rpc('seed_new_pool_defaults', {
          target_pool_id: pool.id
        });
        
        if (seedError) {
          console.error('Error seeding pool defaults:', seedError);
        } else {
          console.log('Pool seeded with default data successfully');
        }
      } catch (error) {
        console.error('Error calling seed function:', error);
      }

      // Refresh user pools and set as active
      await loadUserPools();
      await handleSetActivePool(pool);
      
      return pool;
    } catch (error) {
      console.error('Error creating pool:', error);
      throw error; // Re-throw to let UI handle the specific error message
    }
  }, [loadUserPools, handleSetActivePool]);

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
        if (joinedPool) {
          await handleSetActivePool(joinedPool);
        }
        return { success: true, pool: joinedPool };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Failed to join pool' };
    }
  }, [loadUserPools, userPools, handleSetActivePool]);

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
        clearPoolData();
      }

      // Refresh pools
      await loadUserPools();
      return true;
    } catch (error) {
      console.error('Error deleting pool:', error);
      return false;
    }
  }, [activePool, loadUserPools, clearPoolData]);

  const leavePool = useCallback(async (poolId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('pool_memberships')
        .update({ active: false })
        .eq('pool_id', poolId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error leaving pool:', error);
        return false;
      }

      await loadUserPools();
      
      // If user left the active pool, switch to another pool
      if (activePool?.id === poolId) {
        const remainingPools = userPools.filter(p => p.pool_id !== poolId);
        if (remainingPools.length > 0) {
          await handleSetActivePool(remainingPools[0].pool!);
        } else {
          setActivePool(null);
          clearPoolData();
        }
      }

      return true;
    } catch (error) {
      console.error('Error leaving pool:', error);
      return false;
    }
  }, [loadUserPools, activePool, userPools, handleSetActivePool, clearPoolData]);

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

  // Add pool entry (pool-scoped)
  const addPoolEntry = useCallback(async (entry: Omit<PoolEntry, 'id' | 'created_at' | 'updated_at' | 'pool_id'>) => {
    if (!activePool) {
      throw new Error('No active pool selected');
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('pool_entries')
        .insert({
          ...entry,
          pool_id: activePool.id,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const mappedEntry = {
          ...data,
          bonus_answers: data.bonus_answers as Record<string, any>,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at)
        };
        setPoolEntries(prev => [...prev, mappedEntry]);
      }
    } catch (error) {
      console.error('Error adding pool entry:', error);
      throw error;
    }
  }, [activePool]);

  // Refresh current pool data
  const refreshPoolData = useCallback(async () => {
    if (activePool) {
      await loadPoolData(activePool.id);
    }
  }, [activePool, loadPoolData]);

  return (
    <PoolContext.Provider value={{
      // Current pool state
      activePool,
      setActivePool: handleSetActivePool,
      
      // User's pools
      userPools,
      loadUserPools,
      
      // Pool management
      createPool,
      joinPoolByCode,
      updatePool,
      deletePool,
      leavePool,
      
      // Pool membership
      getUserRole,
      canManagePool,
      
      // Pool-specific data
      poolContestants,
      poolEntries,
      poolBonusQuestions,
      poolWeeklyResults,
      
      // Pool-specific data loading
      loadPoolData,
      clearPoolData,
      
      // Pool-specific operations
      addPoolEntry,
      refreshPoolData,
      
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