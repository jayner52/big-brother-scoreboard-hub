import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Users, Trophy, Eye, BarChart2, DollarSign, ClipboardList, Lock } from 'lucide-react';

export interface TabConfig {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ReactNode;
  hidden?: boolean;
  locked?: boolean;
  lockTooltip?: string;
}

interface EnhancedTabSystemProps {
  tabs: TabConfig[];
  defaultTab?: string;
  className?: string;
}

export const EnhancedTabSystem: React.FC<EnhancedTabSystemProps> = ({
  tabs,
  defaultTab,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const visibleTabs = tabs.filter(tab => !tab.hidden);
  
  // Initialize active tab from URL hash or localStorage, fallback to defaultTab
  const getInitialTab = () => {
    // First check URL hash
    const hashTab = window.location.hash.replace('#', '');
    if (hashTab && visibleTabs.some(tab => tab.id === hashTab)) {
      return hashTab;
    }
    
    // Then check localStorage
    const storedTab = localStorage.getItem('dashboard-active-tab');
    if (storedTab && visibleTabs.some(tab => tab.id === storedTab)) {
      return storedTab;
    }
    
    // Finally use defaultTab or first available tab
    return defaultTab || visibleTabs[0]?.id || '';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Persist tab selection and update URL hash
  const handleTabClick = (tabId: string, tab: TabConfig) => {
    if (tab.locked) return; // Don't allow clicking locked tabs
    setActiveTab(tabId);
    
    // Persist to localStorage
    localStorage.setItem('dashboard-active-tab', tabId);
    
    // Update URL hash without triggering navigation
    window.history.replaceState(null, '', `#${tabId}`);
  };

  // Listen for hash changes (back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const hashTab = window.location.hash.replace('#', '');
      if (hashTab && visibleTabs.some(tab => tab.id === hashTab)) {
        setActiveTab(hashTab);
        localStorage.setItem('dashboard-active-tab', hashTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [visibleTabs]);

  // Set initial hash if none exists
  useEffect(() => {
    if (activeTab && !window.location.hash) {
      window.history.replaceState(null, '', `#${activeTab}`);
    }
  }, [activeTab]);

  const activeTabData = visibleTabs.find(tab => tab.id === activeTab);

  if (isMobile) {
    return (
      <div className={cn('w-full', className)}>
        {/* Mobile Tiles */}
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {visibleTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => handleTabClick(tab.id, tab)}
                disabled={tab.locked}
                className={cn(
                  "h-24 flex flex-col items-center justify-center gap-2 text-sm font-medium transition-all duration-300 relative",
                  activeTab === tab.id 
                    ? "bg-gradient-to-r from-purple to-teal text-white shadow-lg scale-105" 
                    : "hover:bg-gradient-to-r hover:from-purple/10 hover:to-teal/10 hover:text-purple border-purple/20 hover:scale-102",
                  tab.locked && "opacity-50 cursor-not-allowed"
                )}
              >
                <tab.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span 
                  className="text-xs sm:text-sm leading-tight text-center font-medium"
                  title={tab.locked && tab.lockTooltip ? tab.lockTooltip : undefined}
                >
                  {tab.shortLabel}
                </span>
                {tab.locked && <Lock className="h-3 w-3 absolute top-2 right-2" />}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="animate-fade-in">
          {activeTabData?.component}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn('w-full', className)}>
        {/* Desktop Tab Navigation */}
        <div className="sticky top-4 z-10 mb-8 bg-background/80 backdrop-blur-sm rounded-2xl border border-purple/20 p-2 shadow-lg">
          <div className="grid grid-cols-6 gap-2">
            {visibleTabs.length === 5 && <div></div>} {/* Spacer for 5 tabs */}
            {visibleTabs.map((tab) => {
              const TabButton = (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => handleTabClick(tab.id, tab)}
                  disabled={tab.locked}
                  className={cn(
                    "relative h-16 flex flex-col items-center gap-2 text-base font-medium transition-all duration-300 hover:scale-105",
                    activeTab === tab.id 
                      ? "bg-gradient-to-r from-purple to-teal text-white shadow-lg tab-active" 
                      : "hover:bg-gradient-to-r hover:from-purple/10 hover:to-teal/10 hover:text-purple",
                    tab.locked && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="h-5 w-5" />
                    <span className="text-sm leading-tight text-center">
                      {tab.shortLabel}
                    </span>
                    {tab.locked && <Lock className="h-3 w-3" />}
                  </div>
                </Button>
              );

              if (tab.locked && tab.lockTooltip) {
                return (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      {TabButton}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tab.lockTooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return TabButton;
            })}
            {visibleTabs.length === 5 && <div></div>} {/* Spacer for 5 tabs */}
          </div>
        </div>

        {/* Desktop Content */}
        <div className="animate-fade-in">
          {activeTabData?.component}
        </div>
      </div>
    </TooltipProvider>
  );
};