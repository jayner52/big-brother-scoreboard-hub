import React from 'react';
import { CheckSquare } from 'lucide-react';

interface MinimizedChecklistProps {
  completedItems: number;
  totalItems: number;
  completionPercentage: number;
  onClick: () => void;
}

export const MinimizedChecklist: React.FC<MinimizedChecklistProps> = ({
  completedItems,
  totalItems,
  completionPercentage,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="mb-6 flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:border-accent transition-colors duration-200 group"
    >
      <CheckSquare className="h-5 w-5 text-primary" />
      <div className="flex items-center gap-3">
        <span className="font-medium text-foreground">Setup Checklist</span>
        <div className="flex items-center gap-2">
          <div className="w-20 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            {completedItems}/{totalItems}
          </span>
        </div>
      </div>
    </button>
  );
};