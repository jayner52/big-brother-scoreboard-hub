import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export interface TabConfig {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  component: React.ReactNode;
  hidden?: boolean;
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
  const [activeTab, setActiveTab] = useState(defaultTab || visibleTabs[0]?.id || '');

  const activeTabData = visibleTabs.find(tab => tab.id === activeTab);

  if (isMobile) {
    return (
      <div className={cn('w-full', className)}>
        {/* Mobile Dropdown */}
        <div className="mb-6">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full h-14 text-base font-medium bg-gradient-to-r from-purple/10 to-teal/10 border-2 border-purple/20 hover:border-purple/40 transition-all duration-300">
              <SelectValue>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{activeTabData?.icon}</span>
                  <span>{activeTabData?.label}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-full">
              {visibleTabs.map((tab) => (
                <SelectItem key={tab.id} value={tab.id} className="text-base py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Content */}
        <div className="animate-fade-in">
          {activeTabData?.component}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Tab Navigation */}
      <div className="sticky top-4 z-10 mb-8 bg-background/80 backdrop-blur-sm rounded-2xl border border-purple/20 p-2 shadow-lg">
        <div className="grid grid-cols-6 gap-2">
          {visibleTabs.length === 5 && <div></div>} {/* Spacer for 5 tabs */}
          {visibleTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative h-14 flex flex-col items-center gap-1 text-sm font-medium transition-all duration-300 tab-hover",
                activeTab === tab.id 
                  ? "bg-gradient-to-r from-purple to-teal text-white shadow-lg animate-glow tab-active" 
                  : "hover:bg-gradient-to-r hover:from-purple/10 hover:to-teal/10 hover:text-purple"
              )}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-xs leading-tight text-center">{tab.shortLabel}</span>
            </Button>
          ))}
          {visibleTabs.length === 5 && <div></div>} {/* Spacer for 5 tabs */}
        </div>
      </div>

      {/* Desktop Content */}
      <div className="animate-fade-in">
        {activeTabData?.component}
      </div>
    </div>
  );
};