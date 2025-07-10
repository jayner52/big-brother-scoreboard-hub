import React, { Suspense } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Direct imports to avoid dynamic loading issues
import ContestantManagement from '@/components/admin/ContestantManagement';
import WeekByWeekOverview from '@/components/admin/WeekByWeekOverview';
import EnhancedBonusQuestionsPanel from '@/components/admin/EnhancedBonusQuestionsPanel';
import { OptimizedPoolEntriesManagement } from '@/components/admin/OptimizedPoolEntriesManagement';
import WeeklyEventsPanel from '@/components/admin/WeeklyEventsPanel';
import RoleManagementPanel from '@/components/admin/RoleManagementPanel';

// Keep only PoolSettingsPanel as lazy-loaded since it works
const PoolSettingsPanel = React.lazy(() => import('@/components/admin/PoolSettingsPanel'));

interface AdminTabsContentProps {
  canManageRoles: boolean;
}

export const AdminTabsContent: React.FC<AdminTabsContentProps> = ({ canManageRoles }) => {
  return (
    <div className="p-4 md:p-6" data-admin-panel>
      <TabsContent value="settings" className="space-y-4 mt-0">
        <ErrorBoundary>
          <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading pool settings...</div>}>
            <PoolSettingsPanel />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="events" className="space-y-4 mt-0">
        <ErrorBoundary>
          <WeeklyEventsPanel />
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="legacy" className="space-y-4 mt-0">
        <ErrorBoundary>
          <WeekByWeekOverview />
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="bonus" className="space-y-6 mt-0">
        <ErrorBoundary>
          <EnhancedBonusQuestionsPanel />
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="entries-new" className="space-y-4 mt-0">
        <ErrorBoundary>
          <OptimizedPoolEntriesManagement />
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="contestants" className="space-y-4 mt-0">
        <ErrorBoundary>
          <ContestantManagement />
        </ErrorBoundary>
      </TabsContent>

      {canManageRoles && (
        <TabsContent value="roles" className="space-y-4 mt-0">
          <ErrorBoundary>
            <RoleManagementPanel />
          </ErrorBoundary>
        </TabsContent>
      )}
    </div>
  );
};