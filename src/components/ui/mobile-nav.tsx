import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

interface MobileNavProps {
  trigger?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({ 
  trigger, 
  children, 
  className = '' 
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            className={`touch-target lg:hidden ${className}`}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-sm p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-end p-4 border-b">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setOpen(false)}
              className="touch-target"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2" onClick={() => setOpen(false)}>
              {children}
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};