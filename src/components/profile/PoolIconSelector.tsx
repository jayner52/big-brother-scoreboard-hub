import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// Pool-themed avatar icons
export const POOL_AVATAR_ICONS = [
  '🏊‍♂️', '🏊‍♀️', '🏖️', '🌊', '🏄‍♂️', '🏄‍♀️', 
  '⛱️', '🩱', '🤿', '🏐', '🦩', '🌴', 
  '☀️', '🍹', '🐚', '🌺', '🪩', '🎯'
];

interface PoolIconSelectorProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
  onClear: () => void;
}

export const PoolIconSelector: React.FC<PoolIconSelectorProps> = ({
  selectedIcon,
  onIconSelect,
  onClear
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Choose Pool Icon</h4>
        {selectedIcon && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-6 gap-2">
        {POOL_AVATAR_ICONS.map((icon) => (
          <Button
            key={icon}
            variant={selectedIcon === icon ? "default" : "outline"}
            size="sm"
            className="h-10 w-10 p-0 text-lg hover:scale-105 transition-transform"
            onClick={() => {
              console.log('Icon button clicked:', icon);
              onIconSelect(icon);
            }}
          >
            {icon}
          </Button>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Select a fun pool-themed icon for your profile
      </p>
    </div>
  );
};