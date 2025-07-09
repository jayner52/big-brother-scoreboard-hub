import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeamCard } from './TeamCard';
import { PoolEntry } from '@/types/pool';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6 px-3 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
          <span>Team Selections</span>
          <Badge variant="secondary" className="text-xs sm:text-sm w-fit">
            {poolEntries.length} Teams
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-2 sm:pb-6 pt-0">
        <div className="space-y-1.5 sm:space-y-3">
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