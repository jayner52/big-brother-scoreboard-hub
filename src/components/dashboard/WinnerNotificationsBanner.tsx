import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { WinnerNotificationSystem } from '@/components/admin/winners/WinnerNotificationSystem';
import { usePool } from '@/contexts/PoolContext';

export const WinnerNotificationsBanner: React.FC = () => {
  const { activePool } = usePool();

  // Only show banner if season is complete
  if (!activePool?.season_complete) {
    return null;
  }

  return (
    <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Trophy className="h-5 w-5" />
          Prize Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <WinnerNotificationSystem />
      </CardContent>
    </Card>
  );
};