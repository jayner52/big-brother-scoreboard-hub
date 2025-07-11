import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedUserManagementTab } from './EnhancedUserManagementTab';
import { PoolAnalyticsTab } from './PoolAnalyticsTab';
import { FeedbackManagementTab } from './FeedbackManagementTab';
import { Users, Database, MessageSquare } from 'lucide-react';
import { UserRegistration, DashboardStats } from './types';

interface DashboardTabsProps {
  users: UserRegistration[];
  stats: DashboardStats;
  onUsersUpdate: () => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  users,
  stats,
  onUsersUpdate
}) => {
  return (
    <Tabs defaultValue="users" className="w-full animate-fade-in">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="users" className="flex items-center gap-2 hover-scale">
          <Users className="h-4 w-4" />
          User Management
        </TabsTrigger>
        <TabsTrigger value="pools" className="flex items-center gap-2 hover-scale">
          <Database className="h-4 w-4" />
          Pool Analytics
        </TabsTrigger>
        <TabsTrigger value="feedback" className="flex items-center gap-2 hover-scale">
          <MessageSquare className="h-4 w-4" />
          Feedback
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="users" className="animate-scale-in">
        <EnhancedUserManagementTab 
          users={users} 
          stats={stats} 
          onUsersUpdate={onUsersUpdate}
        />
      </TabsContent>
      
      <TabsContent value="pools" className="animate-scale-in">
        <PoolAnalyticsTab />
      </TabsContent>

      <TabsContent value="feedback" className="animate-scale-in">
        <FeedbackManagementTab />
      </TabsContent>
    </Tabs>
  );
};