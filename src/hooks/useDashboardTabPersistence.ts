import { useEffect, useCallback, useState } from 'react';
import { TabConfig } from '@/components/dashboard/EnhancedTabSystem';

interface UseDashboardTabPersistenceProps {
  activePool: { id: string } | null;
  tabs: TabConfig[];
  defaultTab?: string;
}

export const useDashboardTabPersistence = ({ 
  activePool, 
  tabs,
  defaultTab 
}: UseDashboardTabPersistenceProps) => {
  
  // Get initial tab considering pool-specific storage and accessibility
  const getInitialTab = useCallback(() => {
    const visibleTabs = tabs.filter(tab => !tab.hidden);
    
    // First check URL hash
    const hashTab = window.location.hash.replace('#', '');
    if (hashTab && visibleTabs.some(tab => tab.id === hashTab && !tab.locked)) {
      return hashTab;
    }
    
    // Then check pool-specific localStorage
    if (activePool?.id) {
      const savedTab = localStorage.getItem(`dashboard_active_tab_${activePool.id}`);
      if (savedTab && visibleTabs.some(tab => tab.id === savedTab && !tab.locked)) {
        return savedTab;
      }
    }
    
    // Find first accessible tab (not locked)
    const firstAccessibleTab = visibleTabs.find(tab => !tab.locked);
    
    // Finally use defaultTab if accessible, or first accessible tab
    if (defaultTab && visibleTabs.some(tab => tab.id === defaultTab && !tab.locked)) {
      return defaultTab;
    }
    
    return firstAccessibleTab?.id || visibleTabs[0]?.id || '';
  }, [activePool?.id, tabs, defaultTab]);

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Reset to accessible tab when pool changes or tab accessibility changes
  useEffect(() => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const isCurrentTabAccessible = currentTab && !currentTab.hidden && !currentTab.locked;
    
    if (!isCurrentTabAccessible) {
      const newTab = getInitialTab();
      if (newTab !== activeTab) {
        setActiveTab(newTab);
        
        // Update localStorage and URL
        if (activePool?.id) {
          localStorage.setItem(`dashboard_active_tab_${activePool.id}`, newTab);
        }
        window.history.replaceState(null, '', `#${newTab}`);
      }
    }
  }, [activePool?.id, tabs, activeTab, getInitialTab]);

  // Handle tab changes with pool-specific persistence
  const handleTabChange = useCallback((tab: string) => {
    const tabConfig = tabs.find(t => t.id === tab);
    
    if (tabConfig?.locked) {
      console.log('Tab is locked:', tab, tabConfig.lockTooltip);
      return; // Don't allow clicking locked tabs
    }
    
    setActiveTab(tab);
    
    // Save to pool-specific localStorage
    if (activePool?.id) {
      localStorage.setItem(`dashboard_active_tab_${activePool.id}`, tab);
    }
    
    // Update URL hash
    window.history.replaceState(null, '', `#${tab}`);
  }, [activePool?.id, tabs]);

  // Listen for hash changes (back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const hashTab = window.location.hash.replace('#', '');
      const visibleTabs = tabs.filter(tab => !tab.hidden);
      
      if (hashTab && visibleTabs.some(tab => tab.id === hashTab && !tab.locked)) {
        setActiveTab(hashTab);
        if (activePool?.id) {
          localStorage.setItem(`dashboard_active_tab_${activePool.id}`, hashTab);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [tabs, activePool?.id]);

  // Set initial hash if none exists
  useEffect(() => {
    if (activeTab && !window.location.hash) {
      window.history.replaceState(null, '', `#${activeTab}`);
    }
  }, [activeTab]);

  return { activeTab, handleTabChange };
};