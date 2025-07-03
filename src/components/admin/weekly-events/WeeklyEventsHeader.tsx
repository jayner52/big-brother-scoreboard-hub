import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { WeekNavigator } from './WeekNavigator';

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
  return (
    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          {week === currentGameWeek ? (
            <span className="bg-green-500 text-white px-3 py-1 rounded font-bold text-xs">CURRENT WEEK</span>
          ) : (
            <span className="bg-blue-500 text-white px-3 py-1 rounded font-bold text-xs">EDITING WEEK</span>
          )}
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