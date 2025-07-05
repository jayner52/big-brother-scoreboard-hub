import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Pool, PoolMembership, PoolEntry, ScoringRules, WeeklyResults } from '@/types/pool';
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
  
  // POOL-SPECIFIC DATA - properly isolated by pool ID
  poolContestants: any[];
  poolEntries: PoolEntry[];
  poolWeeklyResults: WeeklyResults[];
  poolScoringRules: ScoringRules;
  poolBonusQuestions: any[];
  
  // Pool-specific data management
  loadPoolData: (poolId: string) => Promise<void>;
  clearPoolData: () => void;
  addPoolEntry: (entry: Omit<PoolEntry, 'id' | 'created_at' | 'updated_at' | 'pool_id'>) => Promise<void>;
  updatePoolContestants: (contestants: any[]) => Promise<void>;
  addPoolWeeklyResults: (results: WeeklyResults) => Promise<void>;
  
  // AI Generation
  generateContestants: (poolId: string) => Promise<void>;
  
  loading: boolean;
  loadingPoolData: boolean;
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
  const [activePool, setActivePoolState] = useState<Pool | null>(null);
  const [userPools, setUserPools] = useState<PoolMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPoolData, setLoadingPoolData] = useState(false);
  
  // POOL-SPECIFIC DATA - properly isolated
  const [poolContestants, setPoolContestants] = useState<any[]>([]);
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [poolWeeklyResults, setPoolWeeklyResults] = useState<WeeklyResults[]>([]);
  const [poolScoringRules, setPoolScoringRules] = useState<ScoringRules>(defaultScoringRules);
  const [poolBonusQuestions, setPoolBonusQuestions] = useState<any[]>([]);

  // Load pool-specific data
  const loadPoolData = useCallback(async (poolId: string) => {
    if (!poolId) return;
    
    setLoadingPoolData(true);
    try {
      console.log('Loading data for pool:', poolId);
      
      // Load contestants for this specific pool
      const { data: contestants, error: contestantsError } = await supabase
        .from('contestants')
        .select('*')
        .eq('pool_id', poolId)
        .order('name');
      
      if (contestantsError) {
        console.error('Error loading contestants:', contestantsError);
      } else {
        setPoolContestants(contestants || []);
      }
      
      // Load entries for this specific pool
      const { data: entries, error: entriesError } = await supabase
        .from('pool_entries')
        .select('*')
        .eq('pool_id', poolId)
        .order('created_at');
      
      if (entriesError) {
        console.error('Error loading entries:', entriesError);
      } else {
        setPoolEntries(entries || []);
      }
      
      // Load weekly results for this specific pool
      const { data: weeklyResults, error: weeklyError } = await supabase
        .from('weekly_results')
        .select('*')
        .eq('pool_id', poolId)
        .order('week');
      
      if (weeklyError) {
        console.error('Error loading weekly results:', weeklyError);
      } else {
        setPoolWeeklyResults(weeklyResults || []);
      }
      
      // Load bonus questions for this specific pool (with deduplication)
      const { data: bonusQuestions, error: bonusError } = await supabase
        .from('bonus_questions')
        .select('*')
        .eq('pool_id', poolId)
        .order('week', { ascending: true });
      
      if (bonusError) {
        console.error('Error loading bonus questions:', bonusError);
      } else {
        // Remove duplicates based on question text and week
        const uniqueBonusQuestions = bonusQuestions?.filter((question, index, self) => 
          index === self.findIndex(q => q.question === question.question && q.week === question.week)
        ) || [];
        setPoolBonusQuestions(uniqueBonusQuestions);
      }
      
      // Load scoring rules for this specific pool
      const { data: scoringRules, error: scoringError } = await supabase
        .from('scoring_rules')
        .select('*')
        .eq('pool_id', poolId)
        .single();
      
      if (scoringError && scoringError.code !== 'PGRST116') {
        console.error('Error loading scoring rules:', scoringError);
      } else {
        setPoolScoringRules(scoringRules || defaultScoringRules);
      }
      
    } catch (error) {
      console.error('Error loading pool data:', error);
    } finally {
      setLoadingPoolData(false);
    }
  }, []);

  // Clear pool-specific data
  const clearPoolData = useCallback(() => {
    setPoolContestants([]);
    setPoolEntries([]);
    setPoolWeeklyResults([]);
    setPoolScoringRules(defaultScoringRules);
    setPoolBonusQuestions([]);
  }, []);

  // Enhanced setActivePool that loads pool-specific data
  const setActivePool = useCallback((pool: Pool | null) => {
    console.log('Setting active pool:', pool?.name || 'null');
    setActivePoolState(pool);
    
    if (pool) {
      loadPoolData(pool.id);
    } else {
      clearPoolData();
    }
  }, [loadPoolData, clearPoolData]);

  // Load user's pools (simplified - no circular dependencies)
  const loadUserPools = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
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
        setActivePool(poolMemberships[0].pool!);
      }
    } catch (error) {
      console.error('Error loading user pools:', error);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent loops

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

  // Simplified createPool function
  const createPool = useCallback(async (poolData: Partial<Pool>): Promise<Pool> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create a pool');
      }

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
        registration_deadline: poolData.registration_deadline || null,
      };

      const { data: pool, error } = await supabase
        .from('pools')
        .insert(freshPoolData)
        .select()
        .single();

      if (error) {
        console.error('Pool creation error:', error);
        throw new Error(error.message || 'Failed to create pool');
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
        console.error('Error creating membership:', membershipError);
      }

      await loadUserPools();
      return pool;
    } catch (error) {
      console.error('Error creating pool:', error);
      throw error; // Re-throw for UI to handle
    }
  }, [loadUserPools]);

  // Generate contestants with AI
  const generateContestants = useCallback(async (poolId: string) => {
    try {
      console.log('Generating contestants for pool:', poolId);
      
      const { data, error } = await supabase.functions.invoke('generate-contestants', {
        body: { 
          poolId,
          season: 26, // Minimum season 26
          count: 16 // Standard BB cast size
        }
      });

      if (error) {
        console.error('Error generating contestants:', error);
        throw new Error(error.message || 'Failed to generate contestants');
      }

      // Reload pool data to get the new contestants
      await loadPoolData(poolId);
      
      return data;
    } catch (error) {
      console.error('Error generating contestants:', error);
      throw error;
    }
  }, [loadPoolData]);

  // Add pool entry (pool-specific)
  const addPoolEntry = useCallback(async (entry: Omit<PoolEntry, 'id' | 'created_at' | 'updated_at' | 'pool_id'>) => {
    if (!activePool) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pool_entries')
        .insert({
          ...entry,
          pool_id: activePool.id,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding pool entry:', error);
        throw error;
      }

      // Update local state
      setPoolEntries(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding pool entry:', error);
      throw error;
    }
  }, [activePool]);

  // Update contestants (pool-specific)
  const updatePoolContestants = useCallback(async (contestants: any[]) => {
    if (!activePool) return;
    
    try {
      // This would typically involve database operations
      // For now, just update local state
      setPoolContestants(contestants);
    } catch (error) {
      console.error('Error updating contestants:', error);
    }
  }, [activePool]);

  // Add weekly results (pool-specific)
  const addPoolWeeklyResults = useCallback(async (results: WeeklyResults) => {
    if (!activePool) return;
    
    try {
      const { data, error } = await supabase
        .from('weekly_results')
        .insert({
          ...results,
          pool_id: activePool.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding weekly results:', error);
        throw error;
      }

      setPoolWeeklyResults(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding weekly results:', error);
      throw error;
    }
  }, [activePool]);

  // Other functions remain the same but simplified...
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

  const deletePool = useCallback(async (poolId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pools')
        .delete()
        .eq('id', poolId);

      if (error) throw error;

      if (activePool?.id === poolId) {
        setActivePool(null);
      }

      await loadUserPools();
      return true;
    } catch (error) {
      console.error('Error deleting pool:', error);
      return false;
    }
  }, [activePool, loadUserPools, setActivePool]);

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
      
      if (activePool?.id === poolId) {
        const remainingPools = userPools.filter(p => p.pool_id !== poolId);
        setActivePool(remainingPools.length > 0 ? remainingPools[0].pool! : null);
      }

      return true;
    } catch (error) {
      console.error('Error leaving pool:', error);
      return false;
    }
  }, [loadUserPools, activePool, userPools, setActivePool]);

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
      
      // Pool-specific data
      poolContestants,
      poolEntries,
      poolWeeklyResults,
      poolScoringRules,
      poolBonusQuestions,
      
      // Pool-specific operations
      loadPoolData,
      clearPoolData,
      addPoolEntry,
      updatePoolContestants,
      addPoolWeeklyResults,
      generateContestants,
      
      loading,
      loadingPoolData,
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