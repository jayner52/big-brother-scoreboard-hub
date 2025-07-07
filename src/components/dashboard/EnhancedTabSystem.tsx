import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Users, Trophy, Eye, BarChart2, DollarSign, ClipboardList } from 'lucide-react';

export interface TabConfig {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
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
        {/* Mobile Tiles */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {visibleTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "h-20 flex flex-col items-center gap-2 text-sm font-medium transition-all duration-300",
                  activeTab === tab.id 
                    ? "bg-gradient-to-r from-purple to-teal text-white shadow-lg" 
                    : "hover:bg-gradient-to-r hover:from-purple/10 hover:to-teal/10 hover:text-purple border-purple/20"
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-xs leading-tight text-center">{tab.shortLabel}</span>
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
                "relative h-16 flex flex-col items-center gap-2 text-base font-medium transition-all duration-300 hover:scale-105",
                activeTab === tab.id 
                  ? "bg-gradient-to-r from-purple to-teal text-white shadow-lg tab-active" 
                  : "hover:bg-gradient-to-r hover:from-purple/10 hover:to-teal/10 hover:text-purple"
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-sm leading-tight text-center">{tab.shortLabel}</span>
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