import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContestantWithBio } from '@/types/admin';
import { useWeekAwareContestants } from '@/hooks/useWeekAwareContestants';

interface PointsPreviewProps {
  pointsPreview: Record<string, number>;
  contestants: ContestantWithBio[];
  evictedThisWeek?: string[];
  eventForm?: { week: number };
}

export const PointsPreview: React.FC<PointsPreviewProps> = ({ 
  pointsPreview, 
  contestants,
  evictedThisWeek = [],
  eventForm
}) => {
  // Ensure all contestants appear in preview
  const allContestantsPreview = contestants.reduce((acc, contestant) => {
    acc[contestant.name] = pointsPreview[contestant.name] || 0;
    return acc;
  }, {} as Record<string, number>);

  // Separate contestants by eviction status (using week-aware isActive)
  const activeContestants = contestants.filter(c => c.isActive);
  const evictedContestants = contestants.filter(c => !c.isActive);

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-lg">Points Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Contestants */}
        {activeContestants.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">Active Contestants</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeContestants
                .sort((a, b) => (allContestantsPreview[b.name] || 0) - (allContestantsPreview[a.name] || 0))
                .map((contestant) => {
                  const points = allContestantsPreview[contestant.name] || 0;
                  return (
                     <div key={contestant.name} className="flex justify-between items-center p-2 bg-background/50 rounded border">
                       <span className="font-medium text-sm truncate pr-2" title={contestant.name}>
                         {contestant.name}:
                       </span>
                       <span className={`text-sm font-semibold ${points > 0 ? 'text-green-600' : points < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                         {points > 0 ? '+' : ''}{points}pts
                       </span>
                     </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Evicted Contestants */}
        {evictedContestants.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">Evicted Contestants</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {evictedContestants.map((contestant) => {
                const points = allContestantsPreview[contestant.name] || 0;
                const isEvictedThisWeek = evictedThisWeek.includes(contestant.name);
                return (
                   <div key={contestant.name} className="flex justify-between items-center p-2 bg-background/30 rounded border border-dashed">
                      <span className="text-red-600 font-medium text-sm truncate pr-2" title={contestant.name}>
                        {contestant.name}:
                        <span className="text-red-500 text-xs ml-1">(Evicted)</span>
                     </span>
                     <div className="flex flex-col items-end">
                       <span className={`text-sm font-semibold ${points > 0 ? 'text-green-600' : points < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                         {points > 0 ? '+' : ''}{points}pts
                       </span>
                       {isEvictedThisWeek && (
                         <span className="text-xs text-red-500">evicted this week</span>
                       )}
                     </div>
                   </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};