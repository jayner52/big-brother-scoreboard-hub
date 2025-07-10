import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface InstructionAccordionProps {
  title: string;
  children: React.ReactNode;
  tabKey: string;
  className?: string;
}

export const InstructionAccordion: React.FC<InstructionAccordionProps> = ({ 
  title, 
  children, 
  tabKey, 
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn(
      "mb-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm",
      className
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-100/50 transition-colors rounded-lg"
        type="button"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="text-sm font-medium text-blue-900">{title}</span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-blue-600 transition-transform duration-200 shrink-0",
          isOpen && "rotate-180"
        )} />
      </button>
      
      {isOpen && (
        <div className="px-4 pb-3 text-sm text-blue-800 animate-accordion-down">
          <div className="border-t border-blue-200 pt-3 mb-3">
            {children}
          </div>
          
          <div className="flex justify-end items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-blue-500 font-medium cursor-help">
                  💡 Helpful Tips
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to expand/collapse these helpful instructions</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};