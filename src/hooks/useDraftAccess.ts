import { useState, useEffect } from 'react';
import { usePool } from '@/contexts/PoolContext';
import { isDraftAccessible, getDraftLockReason } from '@/utils/draftUtils';
import { Pool } from '@/types/pool';

export const useDraftAccess = () => {
  const { activePool } = usePool();
  const [isAccessible, setIsAccessible] = useState(false);
  const [lockReason, setLockReason] = useState({ title: '', message: '' });
  const [lastCheck, setLastCheck] = useState(0);

  // Check draft access whenever pool changes or on interval
  useEffect(() => {
    const checkAccess = () => {
      if (!activePool) {
        setIsAccessible(false);
        setLockReason({
          title: "No Pool Selected",
          message: "Please select a pool to access the draft."
        });
        return;
      }

      const accessible = isDraftAccessible(activePool);
      const reason = getDraftLockReason(activePool);
      
      setIsAccessible(accessible);
      setLockReason(reason);
      setLastCheck(Date.now());
    };

    checkAccess();
    
    // Check every second for deadline changes
    const interval = setInterval(checkAccess, 1000);
    
    return () => clearInterval(interval);
  }, [activePool]);

  return {
    isAccessible,
    lockReason,
    lastCheck
  };
};