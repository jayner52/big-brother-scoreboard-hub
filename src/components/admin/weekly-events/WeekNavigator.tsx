import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekNavigatorProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
  maxWeek?: number;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  currentWeek,
  onWeekChange,
  maxWeek = 15
}) => {
  const canGoPrevious = currentWeek > 1;
  const canGoNext = currentWeek < maxWeek;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onWeekChange(currentWeek - 1)}
        disabled={!canGoPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
        Week {currentWeek - 1}
      </Button>
      
      <div className="px-4 py-2 bg-white/20 rounded-lg text-white font-semibold">
        Week {currentWeek}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onWeekChange(currentWeek + 1)}
        disabled={!canGoNext}
      >
        Week {currentWeek + 1}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};