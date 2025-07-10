import React, { createContext, useContext, useEffect, useState } from 'react';
import { Pool } from '@/types/pool';
import { supabase } from '@/integrations/supabase/client';
import { useSpecialEventStatusSync } from '@/hooks/useSpecialEventStatusSync';

interface PoolContextType {
  activePool: Pool | null;
  setActivePool: (pool: Pool | null) => void;
  refreshPool: () => void;
  loading: boolean;
}

const PoolContext = createContext<PoolContextType | undefined>(undefined);

export const PoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePool, setActivePoolState] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Add status sync to ensure consistency across the application
  useSpecialEventStatusSync();

  const setActivePool = (pool: Pool | null) => {
    setActivePoolState(pool);
    if (pool) {
      localStorage.setItem('activePoolId', pool.id);
    } else {
      localStorage.removeItem('activePoolId');
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
          }
        } catch (error) {
          console.error('Error loading saved pool:', error);
          localStorage.removeItem('activePoolId');
        }
      }
      setLoading(false);
    };

    loadSavedPool();
  }, []);

  return (
    <PoolContext.Provider value={{ activePool, setActivePool, refreshPool, loading }}>
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
