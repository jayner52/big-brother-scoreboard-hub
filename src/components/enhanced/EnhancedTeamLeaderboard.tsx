import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { LeaderboardHeader } from './LeaderboardHeader';
import { LeaderboardTable } from './LeaderboardTable';
import { ScoringBadges } from './ScoringBadges';

export const EnhancedTeamLeaderboard: React.FC = () => {
  const {
    displayData,
    showHistoricalColumns,
    selectedWeek,
    completedWeeks,
    loading,
    handleWeekChange
  } = useLeaderboardData();

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  if (displayData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <LeaderboardHeader
            selectedWeek={selectedWeek}
            completedWeeks={completedWeeks}
            onWeekChange={handleWeekChange}
          />
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-400">Be the first to join the pool above!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <LeaderboardHeader
          selectedWeek={selectedWeek}
          completedWeeks={completedWeeks}
          onWeekChange={handleWeekChange}
        />
        <ScoringBadges />
      </CardHeader>
      
      <CardContent className="p-0">
        <LeaderboardTable
          displayData={displayData}
          showHistoricalColumns={showHistoricalColumns}
        />
      </CardContent>
    </Card>
  );
};