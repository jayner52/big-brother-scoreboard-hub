import React from 'react';

interface PoolSetupProgressProps {
  completedItems: number;
  totalItems: number;
  completionPercentage: number;
}

export const PoolSetupProgress: React.FC<PoolSetupProgressProps> = ({
  completedItems,
  totalItems,
  completionPercentage
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-2 text-foreground">Pool Setup Progress</h2>
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-muted rounded-full h-3">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {completedItems}/{totalItems} Complete
        </span>
      </div>
    </div>
  );
};