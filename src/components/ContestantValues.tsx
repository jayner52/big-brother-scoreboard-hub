import React from 'react';
import { ContestantPerformanceCard } from './contestant-values/ContestantPerformanceCard';
import { ContestantGroupsOverview } from './contestant-values/ContestantGroupsOverview';
import { useContestantStats } from '@/hooks/useContestantStats';
import { useCurrentWeekStatus } from '@/hooks/useCurrentWeekStatus';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useSpecialEventStatusSync } from '@/hooks/useSpecialEventStatusSync';
import { useActivePool } from '@/hooks/useActivePool';

export const ContestantValues: React.FC = () => {
  const activePool = useActivePool();
  const { contestants, contestantGroups, contestantStats, loading } = useContestantStats();
  
  // Add status sync for real-time updates
  useSpecialEventStatusSync(activePool?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse text-lg">Loading houseguest values...</div>
          <p className="text-sm text-muted-foreground mt-2">Calculating performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <ErrorBoundary>
          <ContestantPerformanceCard
            contestantStats={contestantStats}
            contestants={contestants}
          />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <ContestantGroupsOverview
            contestants={contestants}
            contestantGroups={contestantGroups}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default ContestantValues;