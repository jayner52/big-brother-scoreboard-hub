import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LockOverlayProps {
  isLocked: boolean;
  title?: string;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export const LockOverlay: React.FC<LockOverlayProps> = ({
  isLocked,
  title = "Content Locked",
  message = "This content is currently locked.",
  children,
  className
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      
      {isLocked && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="text-center p-6 bg-card/90 rounded-lg border shadow-lg max-w-sm mx-4">
            <div className="bg-muted rounded-full p-3 mx-auto mb-4 w-fit">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
            <p className="text-muted-foreground text-sm">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};