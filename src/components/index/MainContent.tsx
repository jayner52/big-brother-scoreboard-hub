import React from 'react';
import { TeamDraftForm } from '@/components/TeamDraftForm';
import { EnhancedTeamLeaderboard } from '@/components/enhanced/EnhancedTeamLeaderboard';
import { EveryonesPicksMatrix } from '@/components/enhanced/EveryonesPicksMatrix';
import { LiveResults } from '@/components/LiveResults';
import { ContestantValues } from '@/components/ContestantValues';
import { ContestantBios } from '@/components/ContestantBios';
import { TeamSummaryBanner } from '@/components/draft/TeamSummaryBanner';
import { WinnerBanner } from '@/components/WinnerBanner';
import { EnhancedTabSystem, TabConfig } from '@/components/dashboard/EnhancedTabSystem';
import { DraftFormData } from '@/hooks/useDraftForm';
import { usePool } from '@/contexts/PoolContext';
import { useDraftAccess } from '@/hooks/useDraftAccess';
import { Users, Trophy, Eye, BarChart2, User, ClipboardList } from 'lucide-react';

interface MainContentProps {
  formData: DraftFormData;
  picksPerTeam?: number;
}

export const MainContent: React.FC<MainContentProps> = ({ formData, picksPerTeam = 5 }) => {
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
        <div>
          {/* Team Summary Banner - Show when user has draft progress */}
          {hasAnyPlayers && (
            <div className="mb-6 relative z-10">
              <TeamSummaryBanner formData={formData} picksPerTeam={picksPerTeam} />
            </div>
          )}
          <TeamDraftForm />
        </div>
      )
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      shortLabel: 'Ranks',
      icon: Trophy,
      component: <EnhancedTeamLeaderboard />
    },
    {
      id: 'picks',
      label: "Everyone's Picks",
      shortLabel: 'Picks',
      icon: Eye,
      component: <EveryonesPicksMatrix />,
      locked: shouldLockPicks
    },
    {
      id: 'results',
      label: 'Live Results',
      shortLabel: 'Results',
      icon: BarChart2,
      component: <LiveResults />
    },
    {
      id: 'contestants',
      label: 'Houseguest Values',
      shortLabel: 'Houseguests',
      icon: User,
      component: <ContestantValues />
    },
    {
      id: 'bios',
      label: 'Houseguest Bios',
      shortLabel: 'Bios',
      icon: ClipboardList,
      component: <ContestantBios />
    }
  ];

  return (
    <div className="w-full">
      {/* Winner Banner - shown for winning participants */}
      <WinnerBanner />
      
      <EnhancedTabSystem tabs={tabs} defaultTab="draft" />
    </div>
  );
};