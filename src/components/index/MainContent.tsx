import React, { memo, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { WinnerBanner } from '@/components/WinnerBanner';
import { EnhancedTabSystem, TabConfig } from '@/components/dashboard/EnhancedTabSystem';
import { WinnerNotificationsBanner } from '@/components/dashboard/WinnerNotificationsBanner';
import { DraftFormData } from '@/hooks/useDraftForm';
import { usePool } from '@/contexts/PoolContext';
import { useDraftAccess } from '@/hooks/useDraftAccess';
import { useDashboardTabPersistence } from '@/hooks/useDashboardTabPersistence';
import { Users, Trophy, Eye, BarChart2, User, ClipboardList } from 'lucide-react';

// Lazy load heavy components for better performance
const TeamDraftForm = React.lazy(() => import('@/components/TeamDraftForm'));
const EnhancedTeamLeaderboard = React.lazy(() => import('@/components/enhanced/EnhancedTeamLeaderboard').then(m => ({ default: m.EnhancedTeamLeaderboard })));
const EveryonesPicksMatrix = React.lazy(() => import('@/components/enhanced/EveryonesPicksMatrix').then(m => ({ default: m.EveryonesPicksMatrix })));
const LiveResults = React.lazy(() => import('@/components/LiveResults'));
const ContestantValues = React.lazy(() => import('@/components/ContestantValues'));
const ContestantBios = React.lazy(() => import('@/components/ContestantBios'));

interface MainContentProps {
  formData: DraftFormData;
  picksPerTeam?: number;
}

export const MainContent: React.FC<MainContentProps> = memo(({ formData, picksPerTeam = 5 }) => {
  const { activePool } = usePool();
  const { isAccessible: isDraftAccessible } = useDraftAccess();
  
  // Check if user has any draft progress based on dynamic team size
  const hasAnyPlayers = Array.from({ length: picksPerTeam }, (_, i) => 
    formData[`player_${i + 1}` as keyof DraftFormData]
  ).some(player => typeof player === 'string' && player.trim().length > 0);

  // Check if Everyone's Picks should be locked (not hidden)
  const shouldLockPicks = activePool?.hide_picks_until_draft_closed || false;

  const tabs: TabConfig[] = [
    {
      id: 'draft',
      label: 'Draft Team',
      shortLabel: 'Draft',
      icon: Users,
      component: (
        <Suspense fallback={<LoadingSpinner text="Loading draft form..." />}>
          <div>
            {/* Team Summary Banner - Lazy load this too */}
            {hasAnyPlayers && (
              <Suspense fallback={<div className="h-20 animate-pulse bg-muted rounded-lg mb-6" />}>
                {React.createElement(
                  React.lazy(() => import('@/components/draft/TeamSummaryBanner').then(m => ({ 
                    default: m.TeamSummaryBanner
                  }))), 
                  { formData, picksPerTeam }
                )}
              </Suspense>
            )}
            <TeamDraftForm />
          </div>
        </Suspense>
      ),
      locked: !isDraftAccessible
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      shortLabel: 'Ranks',
      icon: Trophy,
      component: (
        <Suspense fallback={<LoadingSpinner text="Loading leaderboard..." />}>
          <EnhancedTeamLeaderboard />
        </Suspense>
      ),
      locked: shouldLockPicks,
      lockTooltip: shouldLockPicks ? "Teams are hidden until drafting is finished. They will be revealed when the draft period ends." : undefined
    },
    {
      id: 'picks',
      label: "Everyone's Picks",
      shortLabel: 'Picks',
      icon: Eye,
      component: (
        <Suspense fallback={<LoadingSpinner text="Loading team picks..." />}>
          <EveryonesPicksMatrix />
        </Suspense>
      ),
      locked: shouldLockPicks,
      lockTooltip: shouldLockPicks ? "Teams are hidden until drafting is finished. They will be revealed when the draft period ends." : undefined
    },
    {
      id: 'results',
      label: 'Live Results',
      shortLabel: 'Results',
      icon: BarChart2,
      component: (
        <Suspense fallback={<LoadingSpinner text="Loading live results..." />}>
          <LiveResults />
        </Suspense>
      )
    },
    {
      id: 'contestants',
      label: 'Houseguest Values',
      shortLabel: 'Houseguests',
      icon: User,
      component: (
        <Suspense fallback={<LoadingSpinner text="Loading houseguest data..." />}>
          <ContestantValues />
        </Suspense>
      )
    },
    {
      id: 'bios',
      label: 'Houseguest Bios',
      shortLabel: 'Bios',
      icon: ClipboardList,
      component: (
        <Suspense fallback={<LoadingSpinner text="Loading houseguest bios..." />}>
          <ContestantBios />
        </Suspense>
      )
    }
  ];

  const { activeTab, handleTabChange } = useDashboardTabPersistence({
    activePool,
    tabs,
    defaultTab: 'draft'
  });

  return (
    <div className="w-full space-y-4">
      {/* Winner Banner - shown for winning participants */}
      <WinnerBanner />
      
      {/* Winner Notifications - shown for prize winners */}
      <WinnerNotificationsBanner />
      
      <EnhancedTabSystem 
        tabs={tabs} 
        defaultTab="draft"
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
});