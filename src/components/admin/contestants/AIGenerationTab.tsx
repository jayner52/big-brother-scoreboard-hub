import React from 'react';
import { Bot } from 'lucide-react';
import { ContestantWithBio } from '@/types/admin';
import { AIGenerationPanel } from './AIGenerationPanel';
import { ContestantGrid } from './ContestantGrid';

interface AIGenerationTabProps {
  contestants: ContestantWithBio[];
  onProfilesGenerated: (profiles: any[]) => void;
  onEdit: (contestant: ContestantWithBio) => void;
  onView: (contestant: ContestantWithBio) => void;
  onDelete: (contestantId: string) => void;
  onClearAll: () => void;
}

export const AIGenerationTab: React.FC<AIGenerationTabProps> = ({
  contestants,
  onProfilesGenerated,
  onEdit,
  onView,
  onDelete,
  onClearAll
}) => {
  return (
    <div className="space-y-6">
      <AIGenerationPanel onProfilesGenerated={onProfilesGenerated} />
      
      <ContestantGrid
        contestants={contestants}
        onEdit={onEdit}
        onView={onView}
        onDelete={onDelete}
        onClearAll={onClearAll}
      />
    </div>
  );
};