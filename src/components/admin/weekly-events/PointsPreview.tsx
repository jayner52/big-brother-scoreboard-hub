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

  // Use week-aware contestant logic to show all previously evicted contestants
  const { evictedContestants: allEvictedContestants } = useWeekAwareContestants(eventForm?.week || 1);
  
  // Separate active vs evicted (including all previously evicted)
  const activeContestants = contestants.filter(c => !allEvictedContestants.includes(c.name));
  const evictedContestants = contestants.filter(c => allEvictedContestants.includes(c.name));

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-lg">Points Preview - All Contestants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Contestants */}
        {activeContestants.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Active Contestants</h4>
            <div className="grid grid-cols-3 gap-2">
              {activeContestants
                .sort((a, b) => (allContestantsPreview[b.name] || 0) - (allContestantsPreview[a.name] || 0))
                .map((contestant) => {
                  const points = allContestantsPreview[contestant.name] || 0;
                  return (
                    <div key={contestant.name} className="flex justify-between">
                      <span className="font-medium">{contestant.name}:</span>
                      <span className={points > 0 ? 'text-green-600' : points < 0 ? 'text-red-600' : 'text-muted-foreground'}>
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
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Evicted Contestants</h4>
            <div className="grid grid-cols-3 gap-2">
              {evictedContestants.map((contestant) => {
                const points = allContestantsPreview[contestant.name] || 0;
                const isEvictedThisWeek = evictedThisWeek.includes(contestant.name);
                return (
                  <div key={contestant.name} className="flex justify-between">
                     <span className={`font-medium ${isEvictedThisWeek ? 'line-through text-red-500' : 'font-medium'}`}>
                      {contestant.name}:
                    </span>
                    <span className={points > 0 ? 'text-green-600' : points < 0 ? 'text-red-600' : 'text-muted-foreground'}>
                      {points > 0 ? '+' : ''}{points}pts {isEvictedThisWeek && ' (evicted this week)'}
                    </span>
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