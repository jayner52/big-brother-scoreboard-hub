import React from 'react';

/**
 * Mobile-first responsive wrapper component
 */
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Responsive grid component
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  className = '',
  cols = { default: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }
}) => {
  const gridClasses = [
    `grid-cols-${cols.default || 1}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`
  ].filter(Boolean).join(' ');

  return (
    <div className={`grid gap-4 ${gridClasses} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Mobile-friendly card component
 */
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = '',
  onClick,
  isActive = true
}) => {
  return (
    <div 
      className={`
        bg-card text-card-foreground rounded-lg border shadow-sm
        transition-all duration-200 ease-in-out
        ${onClick ? 'cursor-pointer hover:shadow-md active:scale-95' : ''}
        ${!isActive ? 'opacity-60' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};