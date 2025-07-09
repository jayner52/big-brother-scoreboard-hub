import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { WeekNavigator } from './WeekNavigator';
import { ResetAllWeeksButton } from './ResetAllWeeksButton';
import { useWeekStatus } from '@/hooks/useWeekStatus';

interface WeeklyEventsHeaderProps {
  week: number;
  currentGameWeek: number;
  onWeekChange: (week: number) => void;
  isLoadingWeek: boolean;
}

export const WeeklyEventsHeader: React.FC<WeeklyEventsHeaderProps> = ({
  week,
  currentGameWeek,
  onWeekChange,
  isLoadingWeek,
}) => {
  const { weekStatus } = useWeekStatus(week);
  
  const getWeekStatus = () => {
    switch (weekStatus) {
      case 'season_complete':
        return <span className="bg-yellow-600 text-white px-3 py-1 rounded font-bold text-xs">🏆 SEASON COMPLETE</span>;
      case 'completed':
        return <span className="bg-gray-600 text-white px-3 py-1 rounded font-bold text-xs">COMPLETED</span>;
      case 'current':
        return <span className="bg-green-500 text-white px-3 py-1 rounded font-bold text-xs">CURRENT WEEK</span>;
      case 'future':
        return <span className="bg-blue-500 text-white px-3 py-1 rounded font-bold text-xs">FUTURE WEEK</span>;
      default:
        return <span className="bg-blue-500 text-white px-3 py-1 rounded font-bold text-xs">FUTURE WEEK</span>;
    }
  };

  return (
    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg p-4 sm:p-6">
      <div className="space-y-3 sm:space-y-0">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
              {getWeekStatus()}
              <span className="text-sm sm:text-base font-semibold truncate">
                Week {week} Events Logging
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <ResetAllWeeksButton />
            <WeekNavigator
              currentWeek={week}
              onWeekChange={onWeekChange}
              isLoading={isLoadingWeek}
            />
          </div>
        </CardTitle>
        <CardDescription className="text-purple-100 text-xs sm:text-sm">
          {weekStatus === 'season_complete' 
            ? 'Season completed! Final results have been recorded.' 
            : 'Log all weekly events and automatically calculate points'
          }
        </CardDescription>
      </div>
    </CardHeader>
  );
};