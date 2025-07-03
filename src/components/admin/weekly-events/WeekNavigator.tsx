import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekNavigatorProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
  maxWeek?: number;
  isLoading?: boolean;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  currentWeek,
  onWeekChange,
  maxWeek = 15,
  isLoading = false
}) => {
  const canGoPrevious = currentWeek > 1;
  const canGoNext = currentWeek < maxWeek;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onWeekChange(currentWeek - 1)}
        disabled={!canGoPrevious || isLoading}
        className="text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span className="text-sm">Week {currentWeek - 1}</span>
      </Button>
      
      <div className="px-6 py-2 bg-white/30 rounded-lg text-white font-bold text-lg border border-white/20">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Week {currentWeek}
          </div>
        ) : (
          `Week ${currentWeek}`
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onWeekChange(currentWeek + 1)}
        disabled={!canGoNext || isLoading}
        className="text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        <span className="text-sm">Week {currentWeek + 1}</span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};