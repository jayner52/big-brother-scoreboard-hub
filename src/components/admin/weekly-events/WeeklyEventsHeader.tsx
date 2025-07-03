import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { WeekNavigator } from './WeekNavigator';

interface WeeklyEventsHeaderProps {
  week: number;
  currentGameWeek: number;
  onWeekChange: (week: number) => void;
  isLoadingWeek: boolean;
  isWeekComplete?: boolean;
}

export const WeeklyEventsHeader: React.FC<WeeklyEventsHeaderProps> = ({
  week,
  currentGameWeek,
  onWeekChange,
  isLoadingWeek,
  isWeekComplete = false,
}) => {
  const getWeekStatus = () => {
    if (isWeekComplete) {
      return <span className="bg-gray-600 text-white px-3 py-1 rounded font-bold text-xs">COMPLETED</span>;
    } else if (week === currentGameWeek) {
      return <span className="bg-green-500 text-white px-3 py-1 rounded font-bold text-xs">CURRENT WEEK</span>;
    } else {
      return <span className="bg-blue-500 text-white px-3 py-1 rounded font-bold text-xs">FUTURE WEEK</span>;
    }
  };

  return (
    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          {getWeekStatus()}
          Week {week} Events
        </div>
        <WeekNavigator
          currentWeek={week}
          onWeekChange={onWeekChange}
          isLoading={isLoadingWeek}
        />
      </CardTitle>
      <CardDescription className="text-purple-100">
        Record all events for the week and automatically calculate points
      </CardDescription>
    </CardHeader>
  );
};