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
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const EnhancedTabSystem: React.FC<EnhancedTabSystemProps> = ({
  tabs,
  defaultTab,
  className = '',
  activeTab: externalActiveTab,
  onTabChange
}) => {
  const isMobile = useIsMobile();
  const visibleTabs = tabs.filter(tab => !tab.hidden);
  
  // Use external tab state if provided, otherwise use internal state
  const [internalActiveTab, setInternalActiveTab] = useState(() => {
    // First check URL hash
    const hashTab = window.location.hash.replace('#', '');
    if (hashTab && visibleTabs.some(tab => tab.id === hashTab)) {
      return hashTab;
    }
    
    // Find first accessible tab (not locked)
    const firstAccessibleTab = visibleTabs.find(tab => !tab.locked);
    return defaultTab || firstAccessibleTab?.id || visibleTabs[0]?.id || '';
  });
  
  const activeTab = externalActiveTab || internalActiveTab;

  // Handle tab clicks
  const handleTabClick = (tabId: string, tab: TabConfig) => {
    try {
      if (tab.locked) {
        console.log('Tab is locked:', tabId, tab.lockTooltip);
        return; // Don't allow clicking locked tabs
      }
      
      console.log('Switching to tab:', tabId);
      
      if (onTabChange) {
        onTabChange(tabId);
      } else {
        setInternalActiveTab(tabId);
        // Update URL hash without triggering navigation
        window.history.replaceState(null, '', `#${tabId}`);
      }
    } catch (error) {
      console.error('Error handling tab click:', error);
    }
  };

  // Listen for hash changes (back/forward button) - only if using internal state
  useEffect(() => {
    if (externalActiveTab || !onTabChange) return;
    
    const handleHashChange = () => {
      const hashTab = window.location.hash.replace('#', '');
      if (hashTab && visibleTabs.some(tab => tab.id === hashTab)) {
        setInternalActiveTab(hashTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [visibleTabs, externalActiveTab, onTabChange]);

  const activeTabData = visibleTabs.find(tab => tab.id === activeTab);

  if (isMobile) {
    return (
      <div className={cn('w-full', className)}>
        {/* Mobile Tiles */}
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isLocked = tab.locked;
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => handleTabClick(tab.id, tab)}
                  disabled={isLocked}
                  className={cn(
                    "h-24 min-h-[6rem] flex flex-col items-center justify-center gap-2 text-sm font-medium transition-all duration-300 relative touch-action-manipulation active:scale-95",
                    isActive 
                      ? "bg-gradient-to-r from-[hsl(var(--purple))] to-[hsl(var(--teal))] text-white shadow-lg scale-105" 
                      : isLocked
                        ? "bg-muted/30 text-muted-foreground border-muted-foreground/20"
                        : "hover:bg-muted hover:text-foreground border-muted-foreground/20 hover:scale-102",
                    isLocked && "opacity-60 cursor-not-allowed"
                  )}
                  style={{ minHeight: '44px' }} // Ensure touch target meets accessibility guidelines
                >
                  <tab.icon className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6",
                    isLocked && "text-muted-foreground"
                  )} />
                  <span 
                    className={cn(
                      "text-xs sm:text-sm leading-tight text-center font-medium",
                      isLocked && "text-muted-foreground"
                    )}
                    title={isLocked && tab.lockTooltip ? tab.lockTooltip : undefined}
                  >
                    {tab.shortLabel}
                  </span>
                  {isLocked && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  {isLocked && tab.lockTooltip && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] text-muted-foreground text-center px-1">
                      Locked
                    </div>
                  )}
                  {isActive && !isLocked && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="animate-fade-in touch-action-manipulation">
          {activeTabData?.component}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn('w-full', className)}>
        {/* Desktop Tab Navigation */}
        <div className="sticky top-4 z-10 mb-8 bg-background/80 backdrop-blur-sm rounded-2xl border border-[hsl(var(--purple))]/20 p-2 shadow-lg">
          <div className="grid grid-cols-6 gap-2">
            {visibleTabs.length === 5 && <div></div>} {/* Spacer for 5 tabs */}
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isLocked = tab.locked;
              
              const TabButton = (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => handleTabClick(tab.id, tab)}
                  disabled={isLocked}
                  className={cn(
                    "relative h-16 flex flex-col items-center gap-2 text-base font-medium transition-all duration-300 hover:scale-105",
                    isActive 
                      ? "bg-gradient-to-r from-[hsl(var(--purple))] to-[hsl(var(--teal))] text-white shadow-lg tab-active" 
                      : isLocked
                        ? "bg-muted/30 text-muted-foreground"
                        : "hover:bg-muted hover:text-[hsl(var(--purple))]",
                    isLocked && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="h-5 w-5" />
                    <span className="text-sm leading-tight text-center">
                      {tab.shortLabel}
                    </span>
                    {isLocked && <Lock className="h-3 w-3" />}
                  </div>
                </Button>
              );

              if (isLocked && tab.lockTooltip) {
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