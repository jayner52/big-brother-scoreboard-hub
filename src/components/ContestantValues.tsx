import React from 'react';
import { ContestantPerformanceCard } from './contestant-values/ContestantPerformanceCard';
import { ContestantGroupsOverview } from './contestant-values/ContestantGroupsOverview';
import { useContestantStats } from '@/hooks/useContestantStats';
import { useCurrentWeekStatus } from '@/hooks/useCurrentWeekStatus';

export const ContestantValues: React.FC = () => {
  const { contestants, contestantGroups, contestantStats, loading } = useContestantStats();
  const { hohWinner, povWinner, nominees } = useCurrentWeekStatus();

  if (loading) {
    return <div className="text-center py-8">Loading houseguest values...</div>;
  }

  return (
    <div className="space-y-6">
      <ContestantPerformanceCard
        contestantStats={contestantStats}
        contestants={contestants}
        hohWinner={hohWinner}
        povWinner={povWinner}
        nominees={nominees}
      />
      
      <ContestantGroupsOverview
        contestants={contestants}
        contestantGroups={contestantGroups}
      />
    </div>
  );
};