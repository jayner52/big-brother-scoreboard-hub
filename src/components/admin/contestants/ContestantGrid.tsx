import React from 'react';
import { Button } from '@/components/ui/button';
import { ContestantWithBio } from '@/types/admin';
import { EnhancedContestantCard } from './EnhancedContestantCard';

interface ContestantGridProps {
  contestants: ContestantWithBio[];
  onEdit: (contestant: ContestantWithBio) => void;
  onView: (contestant: ContestantWithBio) => void;
  onDelete: (contestantId: string) => void;
  onClearAll: () => void;
}

export const ContestantGrid: React.FC<ContestantGridProps> = ({
  contestants,
  onEdit,
  onView,
  onDelete,
  onClearAll
}) => {
  if (contestants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Generated Contestants ({contestants.length}/16)
        </h3>
        <Button 
          variant="destructive" 
          onClick={onClearAll}
          size="sm"
        >
          Clear All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {contestants.slice(0, 16).map((contestant) => (
          <EnhancedContestantCard
            key={contestant.id}
            contestant={contestant as any}
            onEdit={() => onEdit(contestant)}
            onView={() => onView(contestant)}
            onDelete={() => onDelete(contestant.id)}
          />
        ))}
      </div>
    </div>
  );
};