import { usePool } from '@/contexts/PoolContext';

export const useActivePool = () => {
  const { activePool } = usePool();
  return activePool;
};