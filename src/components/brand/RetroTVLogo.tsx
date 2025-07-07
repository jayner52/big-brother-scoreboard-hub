import React from 'react';

interface RetroTVLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const RetroTVLogo: React.FC<RetroTVLogoProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* TV Outer Frame */}
        <rect
          x="20"
          y="40"
          width="160"
          height="120"
          rx="20"
          ry="20"
          fill="hsl(var(--dark))"
          stroke="hsl(var(--brand-teal))"
          strokeWidth="3"
        />
        
        {/* TV Inner Screen */}
        <rect
          x="35"
          y="55"
          width="130"
          height="90"
          rx="10"
          ry="10"
          fill="hsl(var(--cream))"
          stroke="hsl(var(--brand-teal))"
          strokeWidth="2"
        />
        
        {/* Left Antenna */}
        <line
          x1="70"
          y1="40"
          x2="50"
          y2="10"
          stroke="hsl(var(--dark))"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Right Antenna */}
        <line
          x1="130"
          y1="40"
          x2="150"
          y2="10"
          stroke="hsl(var(--dark))"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* TV Base/Stand */}
        <rect
          x="80"
          y="160"
          width="40"
          height="15"
          rx="5"
          ry="5"
          fill="hsl(var(--dark))"
        />
        
        {/* PP Letters */}
        <g className="font-bold">
          {/* First P */}
          <text
            x="65"
            y="110"
            fontSize="36"
            fontWeight="bold"
            fill="hsl(var(--coral))"
            fontFamily="Arial, sans-serif"
            textAnchor="middle"
          >
            P
          </text>
          
          {/* Second P */}
          <text
            x="135"
            y="110"
            fontSize="36"
            fontWeight="bold"
            fill="hsl(var(--brand-teal))"
            fontFamily="Arial, sans-serif"
            textAnchor="middle"
          >
            P
          </text>
        </g>
        
        {/* TV Controls */}
        <circle
          cx="45"
          cy="175"
          r="6"
          fill="hsl(var(--brand-teal))"
        />
        <circle
          cx="65"
          cy="175"
          r="6"
          fill="hsl(var(--coral))"
        />
        
        {/* Decorative Elements */}
        <circle
          cx="30"
          cy="70"
          r="3"
          fill="hsl(var(--yellow))"
          className="animate-pulse"
        />
        <circle
          cx="170"
          cy="80"
          r="3"
          fill="hsl(var(--orange))"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};