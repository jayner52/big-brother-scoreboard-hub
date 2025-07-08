import React from 'react';
import { cn } from '@/lib/utils';

interface PoolsidePicksLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showAnimation?: boolean;
}

export const PoolsidePicksLogo: React.FC<PoolsidePicksLogoProps> = ({ 
  size = 'md', 
  className,
  showAnimation = false
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24'
  };

  return (
    <div className={cn(
      'flex items-center justify-center',
      showAnimation && 'animate-bounce',
      className
    )}>
      {/* Placeholder - replace with your actual logo */}
      <img 
        src="https://i.imgur.com/E5vMAPD.png"
        alt="Poolside Picks Logo"
        className={cn(
          'object-contain filter drop-shadow-lg transition-transform duration-300 hover:scale-105',
          sizeClasses[size]
        )}
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(255, 127, 80, 0.3))'
        }}
        onError={(e) => {
          // Fallback to text logo if image fails to load
          const target = e.currentTarget;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      {/* Text fallback */}
      <div 
        className="hidden items-center gap-2 text-coral font-bold"
        style={{ display: 'none' }}
      >
        <span className={cn(
          size === 'sm' ? 'text-lg' :
          size === 'md' ? 'text-xl' :
          size === 'lg' ? 'text-2xl' :
          'text-4xl'
        )}>
          🏊‍♀️ Poolside Picks
        </span>
      </div>
    </div>
  );
};