import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { ContestantStatsTable } from './ContestantStatsTable';
import { EmojiLegend } from './EmojiLegend';
import { ContestantStats } from '@/types/contestant-stats';
import { Contestant } from '@/types/pool';

interface ContestantPerformanceCardProps {
  contestantStats: ContestantStats[];
  contestants: Contestant[];
  hohWinner?: string | null;
  povWinner?: string | null;
  nominees?: string[];
}

export const ContestantPerformanceCard: React.FC<ContestantPerformanceCardProps> = ({
  contestantStats,
  contestants,
  hohWinner = null,
  povWinner = null,
  nominees = [],
}) => {
  const [showSpoilers, setShowSpoilers] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
        <div>
          <CardTitle>Houseguest Performance & Values</CardTitle>
          <p className="text-sm text-gray-600">
            Track how each houseguest is performing and their fantasy value
          </p>
        </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSpoilers(!showSpoilers)}
            className="flex items-center gap-2"
          >
            {showSpoilers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSpoilers ? 'Hide Status' : 'Show Status'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ContestantStatsTable
          contestantStats={contestantStats}
          contestants={contestants}
          showSpoilers={showSpoilers}
          hohWinner={hohWinner}
          povWinner={povWinner}
          nominees={nominees}
        />
      </CardContent>
      <div className="px-6 pb-6">
        <EmojiLegend />
      </div>
    </Card>
  );
};