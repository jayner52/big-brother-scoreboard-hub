import { usePool } from '@/contexts/PoolContext';

export const usePoolOperations = () => {
  const { 
    createPool, 
    joinPoolByCode, 
    updatePool, 
    deletePool, 
    leavePool, 
    refreshPools 
  } = usePool();
  
  return {
    createPool,
    joinPoolByCode,
    updatePool,
    deletePool,
    leavePool,
    refreshPools,
  };
};