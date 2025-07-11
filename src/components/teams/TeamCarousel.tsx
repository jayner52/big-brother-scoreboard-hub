import React, { useRef } from 'react';
import { PoolEntry } from '@/types/pool';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { TeamCard } from './TeamCard';

interface TeamCarouselProps {
  entries: PoolEntry[];
  isEvicted: (playerName: string) => boolean;
  houseguestPoints: Record<string, number>;
  onEditTeam: (entry: PoolEntry) => void;
  onDeleteTeam: (entry: PoolEntry) => void;
  draftLocked: boolean;
  hasBuyIn: boolean;
  updating: boolean;
  picksPerTeam: number;
}

export const TeamCarousel: React.FC<TeamCarouselProps> = ({
  entries,
  isEvicted,
  houseguestPoints,
  onEditTeam,
  onDeleteTeam,
  draftLocked,
  hasBuyIn,
  updating,
  picksPerTeam
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {entries.length > 1 && (
        <>
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 bg-background/80 backdrop-blur-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </EnhancedButton>
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 bg-background/80 backdrop-blur-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </EnhancedButton>
        </>
      )}
      
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
      >
        {entries.map((entry) => (
          <div key={entry.id} className="flex-shrink-0 w-80">
            <TeamCard
              entry={entry}
              isEvicted={isEvicted}
              houseguestPoints={houseguestPoints}
              onEditTeam={onEditTeam}
              onDeleteTeam={onDeleteTeam}
              draftLocked={draftLocked}
              hasBuyIn={hasBuyIn}
              updating={updating}
              picksPerTeam={picksPerTeam}
            />
          </div>
        ))}
      </div>
    </div>
  );
};