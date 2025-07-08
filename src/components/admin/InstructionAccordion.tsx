import React, { useState } from 'react';
import { HelpCircle, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isDismissed, setIsDismissed] = useState(
    localStorage.getItem(`dismissed_help_${tabKey}`) === 'true'
  );

  if (isDismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(`dismissed_help_${tabKey}`, 'true');
    setIsDismissed(true);
  };

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
          
          <div className="flex justify-between items-center">
            <button
              onClick={handleDismiss}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
              type="button"
            >
              <X className="h-3 w-3" />
              Don't show this again
            </button>
            <span className="text-xs text-blue-500 font-medium">
              💡 Helpful Tips
            </span>
          </div>
        </div>
      )}
    </div>
  );
};