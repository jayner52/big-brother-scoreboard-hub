import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeamCard } from './TeamCard';
import { PoolEntry } from '@/types/pool';

interface TeamDisplaySectionProps {
  poolEntries: PoolEntry[];
  evictedContestants: string[];
  houseguestPoints: Record<string, number>;
}

export const TeamDisplaySection: React.FC<TeamDisplaySectionProps> = ({
  poolEntries,
  evictedContestants,
  houseguestPoints,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Team Selections
          <Badge variant="secondary">{poolEntries.length} Teams</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {poolEntries.map((entry, index) => (
            <TeamCard
              key={entry.id}
              entry={entry}
              evictedContestants={evictedContestants}
              houseguestPoints={houseguestPoints}
              teamIndex={index}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};