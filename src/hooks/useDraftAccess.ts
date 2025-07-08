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

      // Use EXACT same logic as TeamDraftFormFixed
      const lockReasons = [];
      
      if (activePool.draft_open === false) {
        lockReasons.push("Draft has been closed by administrator");
      }
      
      if (activePool.allow_new_participants === false) {
        lockReasons.push("New participants are not currently allowed");
      }
      
      if (activePool.registration_deadline) {
        const deadline = new Date(activePool.registration_deadline);
        if (new Date() > deadline) {
          lockReasons.push("Registration deadline has passed");
        }
      }

      const accessible = lockReasons.length === 0;
      
      setIsAccessible(accessible);
      setLockReason({
        title: accessible ? "Draft Available" : "Draft Locked",
        message: accessible ? "The draft is currently open for registrations." : lockReasons.join('. ')
      });
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