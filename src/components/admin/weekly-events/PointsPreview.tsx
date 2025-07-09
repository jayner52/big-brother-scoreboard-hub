
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContestantWithBio } from '@/types/admin';
import { useWeekAwareContestants } from '@/hooks/useWeekAwareContestants';
import { EvictedContestantTile } from '@/components/ui/evicted-contestant-tile';

interface PointsPreviewProps {
  pointsPreview: Record<string, number>;
  contestants: ContestantWithBio[];
  evictedThisWeek?: string[];
  eventForm?: { 
    week: number;
    evicted?: string;
    secondEvicted?: string;
    thirdEvicted?: string;
  };
}

export const PointsPreview: React.FC<PointsPreviewProps> = ({ 
  pointsPreview, 
  contestants,
  evictedThisWeek = [],
  eventForm
}) => {
  const { evictedContestants } = useWeekAwareContestants(eventForm?.week || 1);

  // Ensure all contestants appear in preview
  const allContestantsPreview = contestants.reduce((acc, contestant) => {
    acc[contestant.name] = pointsPreview[contestant.name] || 0;
    return acc;
  }, {} as Record<string, number>);

  // Combine database evictions with current form evictions for dynamic preview
  const currentFormEvictions = [
    eventForm?.evicted,
    eventForm?.secondEvicted, 
    eventForm?.thirdEvicted
  ].filter(name => name && name !== 'no-eviction');

  const allEvictedContestants = [...new Set([...evictedContestants, ...currentFormEvictions])];

  // Separate contestants by eviction status (using combined eviction data)
  const activeContestants = contestants.filter(c => !allEvictedContestants.includes(c.name));
  const evictedContestantsList = contestants.filter(c => allEvictedContestants.includes(c.name));

  // Combine and sort contestants: active first, then evicted (earliest evictions last)
  const sortedContestants = [
    // Active contestants sorted by points (highest first)
    ...activeContestants.sort((a, b) => (allContestantsPreview[b.name] || 0) - (allContestantsPreview[a.name] || 0)),
    // Evicted contestants (earliest evictions appear last)
    ...evictedContestantsList.sort((a, b) => a.name.localeCompare(b.name))
  ];

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-lg">Points Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedContestants.map((contestant) => {
            const points = allContestantsPreview[contestant.name] || 0;
            const isEvicted = allEvictedContestants.includes(contestant.name);
            
            if (isEvicted) {
              return (
                <EvictedContestantTile
                  key={contestant.name}
                  name={contestant.name}
                  points={points}
                  showEvictionInfo={false}
                />
              );
            }
            
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
      </CardContent>
    </Card>
  );
};
