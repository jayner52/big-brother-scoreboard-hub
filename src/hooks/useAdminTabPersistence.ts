import { useEffect, useCallback } from 'react';

interface UseAdminTabPersistenceProps {
  activePool: { id: string } | null;
  canManageRoles: () => boolean;
  setActiveTab: (tab: string) => void;
}

export const useAdminTabPersistence = ({ 
  activePool, 
  canManageRoles, 
  setActiveTab 
}: UseAdminTabPersistenceProps) => {
  
  // Handle URL parameters and tab persistence
  useEffect(() => {
    const poolId = activePool?.id;
    
    // Try to restore from localStorage first
    if (poolId) {
      const savedTab = localStorage.getItem(`admin_panel_active_tab_${poolId}`);
      if (savedTab) {
        const validTabs = ['settings', 'events', 'legacy', 'bonus', 'entries', 'contestants'];
        if (canManageRoles()) validTabs.push('roles');
        
        if (validTabs.includes(savedTab)) {
          setActiveTab(savedTab);
          return;
        }
      }
    }
    
    // Fall back to URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const validTabs = ['settings', 'events', 'legacy', 'bonus', 'entries', 'contestants'];
    if (canManageRoles()) validTabs.push('roles');
    
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
      // Save to localStorage
      if (poolId) {
        localStorage.setItem(`admin_panel_active_tab_${poolId}`, tab);
      }
    }
  }, [canManageRoles, activePool?.id, setActiveTab]);

  // Save tab changes to localStorage (memoized)
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    if (activePool?.id) {
      localStorage.setItem(`admin_panel_active_tab_${activePool.id}`, tab);
    }
  }, [activePool?.id, setActiveTab]);

  return { handleTabChange };
};