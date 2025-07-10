import React, { Suspense } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Lazy load components for better performance
const ContestantManagement = React.lazy(() => import('@/components/admin/ContestantManagement'));
const WeekByWeekOverview = React.lazy(() => import('@/components/admin/WeekByWeekOverview'));
const EnhancedBonusQuestionsPanel = React.lazy(() => import('@/components/admin/EnhancedBonusQuestionsPanel'));
const PoolSettingsPanel = React.lazy(() => import('@/components/admin/PoolSettingsPanel'));
const PoolEntriesManagement = React.lazy(() => import('@/components/PoolEntriesManagement'));
const WeeklyEventsPanel = React.lazy(() => import('@/components/admin/WeeklyEventsPanel'));
const RoleManagementPanel = React.lazy(() => import('@/components/admin/RoleManagementPanel'));

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
          <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading weekly events...</div>}>
            <WeeklyEventsPanel />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="legacy" className="space-y-4 mt-0">
        <ErrorBoundary>
          <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading week overview...</div>}>
            <WeekByWeekOverview />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="bonus" className="space-y-6 mt-0">
        <ErrorBoundary>
          <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading bonus questions...</div>}>
            <EnhancedBonusQuestionsPanel />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="entries" className="space-y-4 mt-0">
        <ErrorBoundary>
          <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading pool entries...</div>}>
            <PoolEntriesManagement />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="contestants" className="space-y-4 mt-0">
        <ErrorBoundary>
          <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading houseguest management...</div>}>
            <ContestantManagement />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      {canManageRoles && (
        <TabsContent value="roles" className="space-y-4 mt-0">
          <ErrorBoundary>
            <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading role management...</div>}>
              <RoleManagementPanel />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      )}
    </div>
  );
};