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
      <div className={isLocked ? "pointer-events-none" : ""}>
        {children}
      </div>
      
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-50 pointer-events-auto">
          <div className="text-center p-8 bg-white rounded-xl border shadow-2xl max-w-md mx-4">
            <div className="bg-gray-100 rounded-full p-4 mx-auto mb-6 w-fit">
              <Lock className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="font-bold text-xl mb-4 text-gray-900">{title}</h3>
            <p className="text-gray-600 text-base leading-relaxed">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};