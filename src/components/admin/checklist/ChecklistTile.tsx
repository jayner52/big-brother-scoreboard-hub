import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';

interface ChecklistTileProps {
  completed: boolean;
  manuallyCompleted: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  warning?: string;
  count?: number;
  actionLabel?: string;
  canToggle?: boolean;
  onClick?: () => void;
  onToggle?: () => void;
}

export const ChecklistTile: React.FC<ChecklistTileProps> = ({
  completed,
  manuallyCompleted,
  icon,
  title,
  description,
  warning,
  count,
  actionLabel,
  canToggle,
  onClick,
  onToggle
}) => {
  return (
    <div 
      className={`group relative p-3 md:p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
        completed 
          ? 'bg-green-50 border-green-200 hover:border-green-300' 
          : 'bg-white border-blue-200 hover:border-blue-300 hover:bg-blue-50'
      }`}
      onClick={onClick}
    >
      {/* Main content */}
      <div className="flex items-start gap-3 md:gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-5 h-5 md:w-6 md:h-6">
            {icon}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h3 className="text-base md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              {count !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {count}
                </Badge>
              )}
              {manuallyCompleted && (
                <Badge variant="outline" className="text-xs">
                  Manual
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2 md:mb-3 leading-relaxed">
            {description}
          </p>
          
          {warning && (
            <div className="flex items-start gap-2 p-2 md:p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-amber-700">
                {warning}
              </p>
            </div>
          )}
        </div>
        
        {/* Right side controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Toggle completion button */}
          {canToggle && onToggle && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              size="sm"
              variant={completed ? "default" : "outline"}
              className={`h-8 w-8 md:h-9 md:w-9 p-0 ${completed ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {completed ? (
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-white" />
              ) : (
                <Circle className="h-3 w-3 md:h-4 md:w-4" />
              )}
            </Button>
          )}
          
          {/* Action indicator */}
          {actionLabel && (
            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground group-hover:text-primary transition-colors">
              <span className="hidden sm:inline">{actionLabel}</span>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};