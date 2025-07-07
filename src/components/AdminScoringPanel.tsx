import React, { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Settings } from 'lucide-react';
import { AdminInstructionsModal } from './admin/AdminInstructionsModal';
import { usePool } from '@/contexts/PoolContext';

// Lazy load components for better performance
const ContestantManagement = React.lazy(() => import('@/components/admin/ContestantManagement').then(m => ({ default: m.ContestantManagement })));
const WeekByWeekOverview = React.lazy(() => import('@/components/admin/WeekByWeekOverview').then(m => ({ default: m.WeekByWeekOverview })));
const EnhancedBonusQuestionsPanel = React.lazy(() => import('@/components/admin/EnhancedBonusQuestionsPanel').then(m => ({ default: m.EnhancedBonusQuestionsPanel })));
const PoolSettingsPanel = React.lazy(() => import('@/components/admin/PoolSettingsPanel').then(m => ({ default: m.PoolSettingsPanel })));
const PoolEntriesManagement = React.lazy(() => import('@/components/PoolEntriesManagement').then(m => ({ default: m.PoolEntriesManagement })));
const WeeklyEventsPanel = React.lazy(() => import('@/components/admin/WeeklyEventsPanel').then(m => ({ default: m.WeeklyEventsPanel })));
const RoleManagementPanel = React.lazy(() => import('@/components/admin/RoleManagementPanel').then(m => ({ default: m.RoleManagementPanel })));


export const AdminScoringPanel: React.FC = () => {
  const { canManagePool, canManageRoles, getUserRole, activePool } = usePool();
  const [activeTab, setActiveTab] = useState('events');
  
  const userRole = getUserRole();
  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin';

  // Handle URL parameters and tab persistence
  useEffect(() => {
    const poolId = activePool?.id;
    
    // Try to restore from localStorage first
    if (poolId) {
      const savedTab = localStorage.getItem(`admin_panel_active_tab_${poolId}`);
      if (savedTab) {
        const validTabs = ['events', 'legacy', 'settings', 'bonus', 'entries', 'contestants'];
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
    const validTabs = ['events', 'legacy', 'settings', 'bonus', 'entries', 'contestants'];
    if (canManageRoles()) validTabs.push('roles');
    
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
      // Save to localStorage
      if (poolId) {
        localStorage.setItem(`admin_panel_active_tab_${poolId}`, tab);
      }
    }
  }, [canManageRoles, activePool?.id]);

  // Save tab changes to localStorage
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (activePool?.id) {
      localStorage.setItem(`admin_panel_active_tab_${activePool.id}`, tab);
    }
  };

  if (!canManagePool()) {
    return (
      <Card className="w-full max-w-4xl mx-auto mb-8">
        <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">You don't have permission to access the admin panel for this pool.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      {/* Modern Banner Header - Similar to TeamSummaryBanner */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 border border-purple-200 rounded-lg p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Left: Admin Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Settings className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-lg text-foreground">Pool Management</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Admin Dashboard</span>
                {isOwner && (
                  <>
                    <span>•</span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded border">OWNER</span>
                  </>
                )}
                {isAdmin && (
                  <>
                    <span>•</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded border">ADMIN</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Right: Instructions Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <AdminInstructionsModal />
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Tab System */}
      <div className="bg-background border rounded-lg shadow-sm">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Mobile Scrollable Tab List */}
          <div className="border-b bg-muted/30 rounded-t-lg">
            <div className="px-4 py-2">
              <TabsList className="grid w-full h-auto gap-1 bg-transparent p-0 md:flex md:flex-wrap">
                <TabsTrigger 
                  value="events" 
                  className="text-base font-medium px-4 py-3 mobile-button transition-all duration-300 hover:bg-gradient-to-r hover:from-coral hover:to-orange hover:text-white data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Weekly Events
                </TabsTrigger>
                <TabsTrigger 
                  value="legacy" 
                  className="text-base font-medium px-4 py-3 mobile-button transition-all duration-300 hover:bg-gradient-to-r hover:from-coral hover:to-orange hover:text-white data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Week Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="text-base font-medium px-4 py-3 mobile-button transition-all duration-300 hover:bg-gradient-to-r hover:from-coral hover:to-orange hover:text-white data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Pool Settings
                </TabsTrigger>
                <TabsTrigger 
                  value="bonus" 
                  className="text-base font-medium px-4 py-3 mobile-button transition-all duration-300 hover:bg-gradient-to-r hover:from-coral hover:to-orange hover:text-white data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Bonus Questions
                </TabsTrigger>
                <TabsTrigger 
                  value="entries" 
                  className="text-base font-medium px-4 py-3 mobile-button transition-all duration-300 hover:bg-gradient-to-r hover:from-coral hover:to-orange hover:text-white data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Pool Entries
                </TabsTrigger>
                <TabsTrigger 
                  value="contestants" 
                  className="text-base font-medium px-4 py-3 mobile-button transition-all duration-300 hover:bg-gradient-to-r hover:from-coral hover:to-orange hover:text-white data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Houseguests
                </TabsTrigger>
                {canManageRoles() && (
                  <TabsTrigger 
                    value="roles" 
                    className="text-base font-medium px-4 py-3 mobile-button transition-all duration-300 hover:bg-gradient-to-r hover:from-coral hover:to-orange hover:text-white data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Roles
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
          </div>

          {/* Tab Content with Consistent Padding */}
          <div className="p-4 md:p-6">
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

            <TabsContent value="settings" className="space-y-4 mt-0">
              <ErrorBoundary>
                <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading pool settings...</div>}>
                  <PoolSettingsPanel />
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

            {canManageRoles() && (
              <TabsContent value="roles" className="space-y-4 mt-0">
                <ErrorBoundary>
                  <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading role management...</div>}>
                    <RoleManagementPanel />
                  </Suspense>
                </ErrorBoundary>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};