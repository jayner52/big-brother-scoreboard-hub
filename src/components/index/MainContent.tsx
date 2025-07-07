import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamDraftForm } from '@/components/TeamDraftForm';
import { EnhancedTeamLeaderboard } from '@/components/enhanced/EnhancedTeamLeaderboard';
import { EveryonesPicksMatrix } from '@/components/enhanced/EveryonesPicksMatrix';
import { LiveResults } from '@/components/LiveResults';
import { ContestantValues } from '@/components/ContestantValues';
import { ContestantBios } from '@/components/ContestantBios';
import { TeamSummaryBanner } from '@/components/draft/TeamSummaryBanner';
import { DraftFormData } from '@/hooks/useDraftForm';
import { usePool } from '@/contexts/PoolContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainContentProps {
  formData: DraftFormData;
  picksPerTeam?: number;
}

export const MainContent: React.FC<MainContentProps> = ({ formData, picksPerTeam = 5 }) => {
  const { activePool } = usePool();
  const isMobile = useIsMobile();
  
  // Check if user has any draft progress based on dynamic team size
  const hasAnyPlayers = Array.from({ length: picksPerTeam }, (_, i) => 
    formData[`player_${i + 1}` as keyof DraftFormData]
  ).some(player => typeof player === 'string' && player.trim().length > 0);

  // Check if Everyone's Picks should be hidden
  const shouldHideEveronesPicks = activePool?.hide_picks_until_draft_closed && activePool?.draft_open;
  
  // Count how many tabs to show for grid layout
  const totalTabs = shouldHideEveronesPicks ? 5 : 6;
  const gridCols = isMobile ? 'grid-cols-2' : (totalTabs === 5 ? 'grid-cols-5' : 'grid-cols-6');

  return (
    <Tabs defaultValue="draft" className="w-full">
      <TabsList className={`grid w-full ${gridCols} ${isMobile ? 'mb-4 gap-1' : 'mb-8'} ${isMobile ? 'h-auto' : ''}`}>
        <TabsTrigger 
          value="draft" 
          className={`${isMobile ? 'text-xs p-2' : ''}`}
        >
          {isMobile ? 'Draft' : 'Draft Team'}
        </TabsTrigger>
        <TabsTrigger 
          value="leaderboard"
          className={`${isMobile ? 'text-xs p-2' : ''}`}
        >
          {isMobile ? 'Ranks' : 'Leaderboard'}
        </TabsTrigger>
        {!shouldHideEveronesPicks && (
          <TabsTrigger 
            value="picks"
            className={`${isMobile ? 'text-xs p-2' : ''}`}
          >
            {isMobile ? 'Picks' : "Everyone's Picks"}
          </TabsTrigger>
        )}
        <TabsTrigger 
          value="results"
          className={`${isMobile ? 'text-xs p-2' : ''}`}
        >
          {isMobile ? 'Results' : 'Live Results'}
        </TabsTrigger>
        <TabsTrigger 
          value="contestants"
          className={`${isMobile ? 'text-xs p-2' : ''}`}
        >
          {isMobile ? 'Values' : 'Houseguest Values'}
        </TabsTrigger>
        <TabsTrigger 
          value="bios"
          className={`${isMobile ? 'text-xs p-2' : ''}`}
        >
          {isMobile ? 'Bios' : 'Houseguest Bios'}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="draft">
        {/* Team Summary Banner - Show when user has draft progress */}
        {hasAnyPlayers && (
          <div className="mb-6 relative z-10">
            <TeamSummaryBanner formData={formData} picksPerTeam={picksPerTeam} />
          </div>
        )}
        <TeamDraftForm />
      </TabsContent>

      <TabsContent value="leaderboard">
        <EnhancedTeamLeaderboard />
      </TabsContent>

      {!shouldHideEveronesPicks && (
        <TabsContent value="picks">
          <EveryonesPicksMatrix />
        </TabsContent>
      )}

      <TabsContent value="results">
        <LiveResults />
      </TabsContent>

      <TabsContent value="contestants">
        <ContestantValues />
      </TabsContent>

      <TabsContent value="bios">
        <ContestantBios />
      </TabsContent>
    </Tabs>
  );
};