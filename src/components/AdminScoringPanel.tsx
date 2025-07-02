import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContestantManagement } from '@/components/admin/ContestantManagement';
import { WeeklyEventsPanel } from '@/components/admin/WeeklyEventsPanel';
import { LegacyWeeklyResults } from '@/components/admin/LegacyWeeklyResults';
import { BonusQuestionsPanel } from '@/components/admin/BonusQuestionsPanel';
import { PoolSettingsPanel } from '@/components/admin/PoolSettingsPanel';

export const AdminScoringPanel: React.FC = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto mb-8">
      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
        <CardTitle className="text-xl">Admin Scoring Panel</CardTitle>
        <CardDescription className="text-green-100">
          Manage weekly results, contestants, and bonus question answers
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="events">Weekly Events</TabsTrigger>
            <TabsTrigger value="contestants">Contestants</TabsTrigger>
            <TabsTrigger value="settings">Pool Settings</TabsTrigger>
            <TabsTrigger value="legacy">Legacy Scoring</TabsTrigger>
            <TabsTrigger value="bonus">Bonus Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <WeeklyEventsPanel />
          </TabsContent>

          <TabsContent value="contestants" className="space-y-4">
            <ContestantManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <PoolSettingsPanel />
          </TabsContent>

          <TabsContent value="legacy" className="space-y-4">
            <LegacyWeeklyResults />
          </TabsContent>

          <TabsContent value="bonus" className="space-y-6">
            <BonusQuestionsPanel />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};