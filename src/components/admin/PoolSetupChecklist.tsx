import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { X, CheckCircle } from 'lucide-react';
import { usePoolSetupChecklist } from '@/hooks/usePoolSetupChecklist';
import { ChecklistItem } from './checklist/ChecklistItem';
import { PoolSetupProgress } from './checklist/PoolSetupProgress';
import { MinimizedChecklist } from './checklist/MinimizedChecklist';

interface PoolSetupChecklistProps {
  forceShow?: boolean;
}

export const PoolSetupChecklist: React.FC<PoolSetupChecklistProps> = ({ 
  forceShow = false 
}) => {
  const [isOpen, setIsOpen] = useState(forceShow);
  const {
    checklistItems,
    checkedItems,
    toggleItem,
    handleNavigation,
    completedItems,
    totalItems,
    completionPercentage,
    isComplete
  } = usePoolSetupChecklist();

  // Handle forced show
  React.useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
    }
  }, [forceShow]);

  if (!isOpen) {
    return (
      <MinimizedChecklist
        completedItems={completedItems}
        totalItems={totalItems}
        completionPercentage={completionPercentage}
        onClick={() => setIsOpen(true)}
      />
    );
  }

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <PoolSetupProgress
            completedItems={completedItems}
            totalItems={totalItems}
            completionPercentage={completionPercentage}
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Pool Created - Always checked, non-toggleable */}
          <div className="bg-background p-4 rounded-lg border-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary border-2 border-primary flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Pool Created</h4>
                  <p className="text-sm text-muted-foreground">Your pool is ready to configure</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                ✓ Complete
              </div>
            </div>
          </div>

          {/* Dynamic checklist items */}
          {checklistItems.map((item) => (
            <ChecklistItem
              key={item.key}
              item={item}
              isComplete={checkedItems[item.key] || false}
              onToggle={toggleItem}
              onNavigate={() => handleNavigation(item.navigation)}
            />
          ))}
        </div>

        {isComplete && (
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <p className="font-medium text-primary">
                🎉 Setup Complete! Your pool is ready for participants.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};