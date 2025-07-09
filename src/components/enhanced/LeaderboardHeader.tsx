import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CompletedWeek } from '@/hooks/useWeeklySnapshots';

interface LeaderboardHeaderProps {
  selectedWeek: number | null;
  completedWeeks: CompletedWeek[];
  onWeekChange: (weekStr: string) => void;
}

export const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({
  selectedWeek,
  completedWeeks,
  onWeekChange
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-xl sm:text-2xl">Team Leaderboard</CardTitle>
          <p className="text-xs sm:text-sm text-white/80 mt-1">
            {selectedWeek ? `Week ${selectedWeek} cumulative standings` : 'Current season standings'}
          </p>
        </div>
        
        {completedWeeks.length > 0 && (
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Select value={selectedWeek?.toString() || 'current'} onValueChange={onWeekChange}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white h-10 text-sm">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="current">Current Standings</SelectItem>
                {completedWeeks.map(week => (
                  <SelectItem key={week.week_number} value={week.week_number.toString()}>
                    Week {week.week_number} (Complete)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};