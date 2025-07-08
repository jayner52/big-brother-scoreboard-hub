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
      <CardHeader className={isMobile ? "pb-3" : ""}>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          Team Selections
          <Badge variant="secondary" className="text-xs sm:text-sm">
            {poolEntries.length} Teams
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? "px-3 pb-3" : ""}>
        <div className={isMobile ? "space-y-3" : "space-y-2"}>
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