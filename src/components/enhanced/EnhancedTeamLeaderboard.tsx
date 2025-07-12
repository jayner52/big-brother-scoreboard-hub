import React, { useState, memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { LeaderboardHeader } from './LeaderboardHeader';
import { LeaderboardTable } from './LeaderboardTable';
import { ScoringBadges } from './ScoringBadges';
import { WeekByWeekLeaderboard } from './WeekByWeekLeaderboard';
import { BarChart3, Table } from 'lucide-react';

export const EnhancedTeamLeaderboard: React.FC = memo(() => {
  const {
    displayData,
    showHistoricalColumns,
    selectedWeek,
    completedWeeks,
    loading,
    handleWeekChange,
    contestants
  } = useLeaderboardData();
  
  const [viewMode, setViewMode] = useState<'traditional' | 'weekByWeek'>('traditional');
  const [weekByWeekMode, setWeekByWeekMode] = useState<'points' | 'cumulative'>('points');

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  // Show week-by-week view if selected
  if (viewMode === 'weekByWeek') {
    return (
      <div className="space-y-4">
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <LeaderboardHeader
                selectedWeek={selectedWeek}
                completedWeeks={completedWeeks}
                onWeekChange={handleWeekChange}
              />
              <div className="flex gap-2">
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewMode('traditional')}
                  className="flex items-center gap-2"
                >
                  <Table className="h-4 w-4" />
                  Traditional View
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
        <WeekByWeekLeaderboard 
          viewMode={weekByWeekMode}
          onViewModeChange={setWeekByWeekMode}
        />
      </div>
    );
  }

  if (displayData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <LeaderboardHeader
              selectedWeek={selectedWeek}
              completedWeeks={completedWeeks}
              onWeekChange={handleWeekChange}
            />
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setViewMode('weekByWeek')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Week-by-Week View
            </Button>
          </div>
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
        <div className="flex justify-between items-center mb-4">
          <LeaderboardHeader
            selectedWeek={selectedWeek}
            completedWeeks={completedWeeks}
            onWeekChange={handleWeekChange}
          />
          <Button 
            variant="secondary"
            size="sm"
            onClick={() => setViewMode('weekByWeek')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Week-by-Week View
          </Button>
        </div>
        <ScoringBadges />
      </CardHeader>
      
      <CardContent className="p-0">
        <LeaderboardTable
          displayData={displayData}
          showHistoricalColumns={showHistoricalColumns}
          selectedWeek={selectedWeek}
          contestants={contestants}
        />
      </CardContent>
    </Card>
  );
});