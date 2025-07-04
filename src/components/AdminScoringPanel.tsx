import React, { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Settings } from 'lucide-react';

// Lazy load components for better performance
const ContestantManagement = React.lazy(() => import('@/components/admin/ContestantManagement').then(m => ({ default: m.ContestantManagement })));
const WeeklyEventsPanel = React.lazy(() => import('@/components/admin/WeeklyEventsPanel').then(m => ({ default: m.WeeklyEventsPanel })));
const WeekByWeekOverview = React.lazy(() => import('@/components/admin/WeekByWeekOverview').then(m => ({ default: m.WeekByWeekOverview })));
const EnhancedBonusQuestionsPanel = React.lazy(() => import('@/components/admin/EnhancedBonusQuestionsPanel').then(m => ({ default: m.EnhancedBonusQuestionsPanel })));
const PoolSettingsPanel = React.lazy(() => import('@/components/admin/PoolSettingsPanel').then(m => ({ default: m.PoolSettingsPanel })));
const PoolEntriesManagement = React.lazy(() => import('@/components/PoolEntriesManagement').then(m => ({ default: m.PoolEntriesManagement })));


export const AdminScoringPanel: React.FC = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto mb-8">
      <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white rounded-t-lg">
        <CardTitle className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Pool Management Dashboard
        </CardTitle>
        <CardDescription className="text-purple-100 text-lg mt-2">
          Manage competitions, settings, participants, and pool administration
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 text-xs lg:text-sm">
            <TabsTrigger value="events">Weekly Events</TabsTrigger>
            <TabsTrigger value="legacy">Week Overview</TabsTrigger>
            <TabsTrigger value="settings">Pool Settings</TabsTrigger>
            <TabsTrigger value="bonus">Bonus Questions</TabsTrigger>
            <TabsTrigger value="entries">Pool Entries</TabsTrigger>
            <TabsTrigger value="contestants">Contestants</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <ErrorBoundary>
              <Suspense fallback={<div className="text-center py-8">Loading weekly events...</div>}>
                <WeeklyEventsPanel />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="legacy" className="space-y-4">
            <ErrorBoundary>
              <Suspense fallback={<div className="text-center py-8">Loading week overview...</div>}>
                <WeekByWeekOverview />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <ErrorBoundary>
              <Suspense fallback={<div className="text-center py-8">Loading pool settings...</div>}>
                <PoolSettingsPanel />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="bonus" className="space-y-6">
            <ErrorBoundary>
              <Suspense fallback={<div className="text-center py-8">Loading bonus questions...</div>}>
                <EnhancedBonusQuestionsPanel />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="entries" className="space-y-4">
            <ErrorBoundary>
              <Suspense fallback={<div className="text-center py-8">Loading pool entries...</div>}>
                <PoolEntriesManagement />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="contestants" className="space-y-4">
            <ErrorBoundary>
              <Suspense fallback={<div className="text-center py-8">Loading contestant management...</div>}>
                <ContestantManagement />
              </Suspense>
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};