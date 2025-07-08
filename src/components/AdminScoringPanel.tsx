
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Users, Settings, Gift } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';

import { WeeklyResultsPanel } from '@/components/admin/WeeklyResultsPanel';
import { BonusQuestionsPanel } from '@/components/admin/BonusQuestionsPanel';
import { SeasonCompletionPanel } from '@/components/admin/SeasonCompletionPanel';
import { WinnerNotificationPanel } from '@/components/admin/winners/WinnerNotificationPanel';
import { PoolEntriesManagement } from '@/components/PoolEntriesManagement';

export const AdminScoringPanel: React.FC = () => {
  const { activePool } = usePool();
  const [activeTab, setActiveTab] = useState('weekly');

  if (!activePool) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No active pool selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Pool Administration
        </CardTitle>
        <CardDescription className="text-blue-100">
          Manage weekly results, bonus questions, and season completion for {activePool.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 rounded-none border-b">
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Results
            </TabsTrigger>
            <TabsTrigger value="bonus" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Bonus Questions
            </TabsTrigger>
            <TabsTrigger value="entries" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pool Entries
            </TabsTrigger>
            <TabsTrigger value="completion" className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Complete Season
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="winners" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Winner Payments
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="weekly" className="space-y-6 mt-0">
              <WeeklyResultsPanel />
            </TabsContent>

            <TabsContent value="bonus" className="space-y-6 mt-0">
              <BonusQuestionsPanel />
            </TabsContent>

            <TabsContent value="entries" className="space-y-6 mt-0">
              <PoolEntriesManagement />
            </TabsContent>

            <TabsContent value="completion" className="space-y-6 mt-0">
              <SeasonCompletionPanel />
            </TabsContent>

            <TabsContent value="winners" className="space-y-6 mt-0">
              <WinnerNotificationPanel poolId={activePool.id} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
