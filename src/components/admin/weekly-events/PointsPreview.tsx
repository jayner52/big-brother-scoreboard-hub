
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContestantWithBio, DetailedScoringRule } from '@/types/admin';
import { useWeekAwareContestants } from '@/hooks/useWeekAwareContestants';
import { EvictedContestantTile } from '@/components/ui/evicted-contestant-tile';
import { isEvictionEvent } from '@/utils/specialEventRules';

interface PointsPreviewProps {
  pointsPreview: Record<string, number>;
  contestants: ContestantWithBio[];
  evictedThisWeek?: string[];
  scoringRules: DetailedScoringRule[];
  eventForm?: { 
    week: number;
    evicted?: string;
    secondEvicted?: string;
    thirdEvicted?: string;
    specialEvents: Array<{
      id?: string;
      contestant: string;
      eventType: string;
      description?: string;
      customPoints?: number;
      customDescription?: string;
      customEmoji?: string;
    }>;
  };
}

export const PointsPreview: React.FC<PointsPreviewProps> = ({ 
  pointsPreview, 
  contestants,
  evictedThisWeek = [],
  scoringRules,
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

  // Get contestants evicted via special events
  const specialEventEvictions = eventForm?.specialEvents?.filter(event => 
    event.contestant && event.eventType && isEvictionEvent(event.eventType, scoringRules)
  ).map(event => event.contestant) || [];

  const allEvictedContestants = [...new Set([...evictedContestants, ...currentFormEvictions, ...specialEventEvictions])];

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
        <div className="space-y-4">
          {/* Active Contestants */}
          {activeContestants.length > 0 && (
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
          )}

          {/* Evicted Contestants */}
          {evictedContestantsList.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Evicted</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {evictedContestantsList
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((contestant) => {
                    const points = allContestantsPreview[contestant.name] || 0;
                    return (
                      <EvictedContestantTile
                        key={contestant.name}
                        name={contestant.name}
                        points={points}
                        showEvictionInfo={false}
                      />
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
