import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

interface ChecklistItemProps {
  item: {
    key: string;
    title: string;
    description: string;
    actionText: string;
  };
  isComplete: boolean;
  onToggle: (key: string) => void;
  onNavigate: () => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ 
  item, 
  isComplete, 
  onToggle, 
  onNavigate 
}) => {
  return (
    <div className="bg-background p-4 rounded-lg border-2 border-border hover:border-accent transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(item.key)}
            className="flex items-center group"
          >
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
              ${isComplete 
                ? 'bg-primary border-primary' 
                : 'bg-background border-muted-foreground/30 hover:border-accent group-hover:border-accent'
              }
            `}>
              {isComplete && <Check className="w-4 h-4 text-primary-foreground" />}
            </div>
          </button>
          
          <div>
            <h4 className="font-medium text-foreground">{item.title}</h4>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        </div>
        
        <button
          onClick={onNavigate}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <span>{item.actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};