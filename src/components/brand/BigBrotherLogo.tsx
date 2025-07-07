import React from 'react';
import { cn } from '@/lib/utils';

interface BigBrotherLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const BigBrotherLogo: React.FC<BigBrotherLogoProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <div className={cn('flex items-center justify-center', sizeClasses[size], className)}>
      <img 
        src="https://cdn.iconscout.com/icon/free/png-256/free-big-brother-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-vol-4-pack-logos-icons-3030190.png"
        alt="Big Brother Logo"
        className="w-full h-full object-contain filter drop-shadow-lg"
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(255, 127, 80, 0.3))'
        }}
      />
    </div>
  );
};