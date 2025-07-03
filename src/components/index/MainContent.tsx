import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamDraftForm } from '@/components/TeamDraftForm';
import { EnhancedTeamLeaderboard } from '@/components/enhanced/EnhancedTeamLeaderboard';
import { EveryonesPicksMatrix } from '@/components/enhanced/EveryonesPicksMatrix';
import { LiveResults } from '@/components/LiveResults';
import { HouseguestValues } from '@/components/HouseguestValues';
import { ContestantBios } from '@/components/ContestantBios';
import { TeamSummaryBanner } from '@/components/draft/TeamSummaryBanner';
import { DraftFormData } from '@/hooks/useDraftForm';

interface MainContentProps {
  formData: DraftFormData;
}

export const MainContent: React.FC<MainContentProps> = ({ formData }) => {
  return (
    <Tabs defaultValue="draft" className="w-full">
      <TabsList className="grid w-full grid-cols-6 mb-8">
        <TabsTrigger value="draft">Draft Team</TabsTrigger>
        <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        <TabsTrigger value="picks">Everyone's Picks</TabsTrigger>
        <TabsTrigger value="results">Live Results</TabsTrigger>
        <TabsTrigger value="contestants">Houseguest Values</TabsTrigger>
        <TabsTrigger value="bios">Houseguest Bios</TabsTrigger>
      </TabsList>

      <TabsContent value="draft">
        {/* Team Summary Banner - Show when user has draft progress */}
        {[formData.player_1, formData.player_2, formData.player_3, formData.player_4, formData.player_5].some(player => typeof player === 'string' && player.trim()) && (
          <div className="mb-6 relative z-10">
            <TeamSummaryBanner formData={formData} />
          </div>
        )}
        <TeamDraftForm />
      </TabsContent>

      <TabsContent value="leaderboard">
        <EnhancedTeamLeaderboard />
      </TabsContent>

      <TabsContent value="picks">
        <EveryonesPicksMatrix />
      </TabsContent>

      <TabsContent value="results">
        <LiveResults />
      </TabsContent>

      <TabsContent value="contestants">
        <HouseguestValues />
      </TabsContent>

      <TabsContent value="bios">
        <ContestantBios />
      </TabsContent>
    </Tabs>
  );
};