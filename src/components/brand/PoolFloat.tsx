import React from 'react';

interface PoolFloatProps {
  className?: string;
  color?: 'coral' | 'teal' | 'yellow' | 'orange';
}

export const PoolFloat: React.FC<PoolFloatProps> = ({ 
  className = '',
  color = 'coral'
}) => {
  const colorMap = {
    coral: 'hsl(var(--coral))',
    teal: 'hsl(var(--brand-teal))',
    yellow: 'hsl(var(--yellow))',
    orange: 'hsl(var(--orange))'
  };

  return (
    <div className={`${className} animate-bounce`} style={{ animationDuration: '3s' }}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={colorMap[color]}
          strokeWidth="10"
          opacity="0.9"
        />
        
        {/* Inner Highlights */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="3"
          strokeDasharray="10 5"
        />
        
        {/* Center Hole */}
        <circle
          cx="50"
          cy="50"
          r="20"
          fill="rgba(255, 255, 255, 0.1)"
        />
      </svg>
    </div>
  );
};