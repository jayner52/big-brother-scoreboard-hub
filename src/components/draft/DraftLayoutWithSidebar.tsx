import React, { useState } from 'react';
import { LiveTeamPreview } from './LiveTeamPreview';
import { DraftFormData } from '@/hooks/useDraftForm';

interface DraftLayoutWithSidebarProps {
  children: React.ReactNode;
  formData: DraftFormData;
  className?: string;
}

export const DraftLayoutWithSidebar: React.FC<DraftLayoutWithSidebarProps> = ({
  children,
  formData,
  className = "",
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>
      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
      
      {/* Live Team Preview Sidebar */}
      <div className="lg:w-80 order-first lg:order-last">
        <div className="sticky top-6">
          <LiveTeamPreview
            teamName={formData.team_name}
            participantName={formData.participant_name}
            selectedPlayers={{
              player_1: formData.player_1,
              player_2: formData.player_2,
              player_3: formData.player_3,
              player_4: formData.player_4,
              player_5: formData.player_5,
            }}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>
      </div>
    </div>
  );
};