import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminTabsListProps {
  canManageRoles: boolean;
}

export const AdminTabsList: React.FC<AdminTabsListProps> = ({ canManageRoles }) => {
  const tabClassName = "text-base font-medium px-4 py-3 mobile-button transition-all duration-300 hover:bg-gradient-to-r hover:from-coral hover:to-orange hover:text-white data-[state=active]:bg-background data-[state=active]:shadow-sm";

  return (
    <div className="border-b bg-muted/30 rounded-t-lg">
      <div className="px-4 py-2">
        <TabsList className="grid w-full h-auto gap-1 bg-transparent p-0 md:flex md:flex-wrap">
          <TabsTrigger 
            value="settings" 
            data-value="settings"
            className={tabClassName}
          >
            Pool Settings
          </TabsTrigger>
          <TabsTrigger 
            value="events" 
            data-value="events"
            className={tabClassName}
          >
            Weekly Events Logging
          </TabsTrigger>
          <TabsTrigger 
            value="legacy" 
            data-value="legacy"
            className={tabClassName}
          >
            Week Overview
          </TabsTrigger>
          <TabsTrigger 
            value="bonus" 
            data-value="bonus"
            className={tabClassName}
          >
            Bonus Questions
          </TabsTrigger>
          <TabsTrigger 
            value="entries" 
            data-value="entries"
            className={tabClassName}
          >
            Pool Entries
          </TabsTrigger>
          <TabsTrigger 
            value="contestants" 
            data-value="contestants"
            className={tabClassName}
          >
            Houseguests
          </TabsTrigger>
          {canManageRoles && (
            <TabsTrigger 
              value="roles" 
              data-value="roles"
              className={tabClassName}
            >
              Roles
            </TabsTrigger>
          )}
        </TabsList>
      </div>
    </div>
  );
};