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
        className="w-full h-full drop-shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients for 3D effect */}
          <linearGradient id="tvGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--brand-teal))" />
            <stop offset="50%" stopColor="hsl(var(--brand-teal))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--dark))" />
          </linearGradient>
          <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--cream))" />
            <stop offset="100%" stopColor="hsl(var(--cream))" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="coralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--coral))" />
            <stop offset="100%" stopColor="hsl(var(--coral))" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--brand-teal))" />
            <stop offset="100%" stopColor="hsl(var(--brand-teal))" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* TV Shadow */}
        <ellipse
          cx="100"
          cy="185"
          rx="60"
          ry="8"
          fill="rgba(0,0,0,0.2)"
        />
        
        {/* TV Main Body - 3D Effect */}
        <rect
          x="25"
          y="45"
          width="150"
          height="110"
          rx="15"
          ry="15"
          fill="url(#tvGradient)"
          stroke="hsl(var(--dark))"
          strokeWidth="2"
        />
        
        {/* TV Body Highlight */}
        <rect
          x="27"
          y="47"
          width="146"
          height="106"
          rx="13"
          ry="13"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        
        {/* TV Inner Bezel */}
        <rect
          x="35"
          y="55"
          width="130"
          height="90"
          rx="8"
          ry="8"
          fill="hsl(var(--dark))"
        />
        
        {/* TV Screen */}
        <rect
          x="40"
          y="60"
          width="120"
          height="80"
          rx="5"
          ry="5"
          fill="url(#screenGradient)"
        />
        
        {/* Screen Glare */}
        <rect
          x="45"
          y="65"
          width="50"
          height="30"
          rx="3"
          ry="3"
          fill="rgba(255,255,255,0.4)"
          opacity="0.6"
        />
        
        {/* Left Antenna - Thicker and more detailed */}
        <line
          x1="75"
          y1="45"
          x2="55"
          y2="15"
          stroke="hsl(var(--dark))"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="55" cy="15" r="3" fill="hsl(var(--coral))" />
        
        {/* Right Antenna - Thicker and more detailed */}
        <line
          x1="125"
          y1="45"
          x2="145"
          y2="15"
          stroke="hsl(var(--dark))"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="145" cy="15" r="3" fill="hsl(var(--brand-teal))" />
        
        {/* TV Stand - More 3D */}
        <rect
          x="85"
          y="155"
          width="30"
          height="20"
          rx="3"
          ry="3"
          fill="hsl(var(--dark))"
        />
        <rect
          x="87"
          y="157"
          width="26"
          height="16"
          rx="2"
          ry="2"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        
        {/* PP Letters - Much larger and 3D */}
        <g className="font-bold">
          {/* First P Shadow */}
          <text
            x="72"
            y="107"
            fontSize="48"
            fontWeight="900"
            fill="rgba(0,0,0,0.3)"
            fontFamily="Arial Black, sans-serif"
            textAnchor="middle"
          >
            P
          </text>
          {/* First P */}
          <text
            x="70"
            y="105"
            fontSize="48"
            fontWeight="900"
            fill="url(#coralGradient)"
            fontFamily="Arial Black, sans-serif"
            textAnchor="middle"
            stroke="hsl(var(--dark))"
            strokeWidth="1"
          >
            P
          </text>
          
          {/* Second P Shadow */}
          <text
            x="132"
            y="107"
            fontSize="48"
            fontWeight="900"
            fill="rgba(0,0,0,0.3)"
            fontFamily="Arial Black, sans-serif"
            textAnchor="middle"
          >
            P
          </text>
          {/* Second P */}
          <text
            x="130"
            y="105"
            fontSize="48"
            fontWeight="900"
            fill="url(#tealGradient)"
            fontFamily="Arial Black, sans-serif"
            textAnchor="middle"
            stroke="hsl(var(--dark))"
            strokeWidth="1"
          >
            P
          </text>
        </g>
        
        {/* TV Controls - Side Panel */}
        <rect
          x="180"
          y="70"
          width="15"
          height="60"
          rx="7"
          ry="7"
          fill="hsl(var(--dark))"
        />
        
        {/* Control Knobs */}
        <circle
          cx="187"
          cy="85"
          r="4"
          fill="hsl(var(--brand-teal))"
          stroke="hsl(var(--dark))"
          strokeWidth="1"
        />
        <circle
          cx="187"
          cy="105"
          r="4"
          fill="hsl(var(--coral))"
          stroke="hsl(var(--dark))"
          strokeWidth="1"
        />
        <circle
          cx="187"
          cy="115"
          r="3"
          fill="hsl(var(--yellow))"
          stroke="hsl(var(--dark))"
          strokeWidth="1"
        />
        
        {/* Brand Label */}
        <rect
          x="45"
          y="125"
          width="110"
          height="12"
          rx="2"
          ry="2"
          fill="rgba(255,255,255,0.1)"
        />
        <text
          x="100"
          y="133"
          fontSize="8"
          fontWeight="bold"
          fill="hsl(var(--dark))"
          fontFamily="Arial, sans-serif"
          textAnchor="middle"
          opacity="0.7"
        >
          POOLSIDE PICKS
        </text>
        
        {/* Decorative Elements - TV Buttons */}
        <circle
          cx="45"
          cy="175"
          r="3"
          fill="hsl(var(--yellow))"
          className="animate-pulse"
        />
        <circle
          cx="155"
          cy="175"
          r="3"
          fill="hsl(var(--orange))"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};