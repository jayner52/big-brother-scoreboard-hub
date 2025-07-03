import React from 'react';
import { Crown, Ban, X } from 'lucide-react';

interface BigBrotherIconProps {
  type: 'hoh' | 'pov' | 'evicted';
  className?: string;
}

export const BigBrotherIcon: React.FC<BigBrotherIconProps> = ({ type, className = "h-4 w-4" }) => {
  switch (type) {
    case 'hoh':
      return <Crown className={`${className} text-yellow-600`} />;
    case 'pov':
      return <Ban className={`${className} text-green-600`} />;
    case 'evicted':
      return <X className={`${className} text-red-600`} />;
    default:
      return null;
  }
};

export const getBBThemedColors = () => ({
  hoh: 'text-yellow-600 bg-yellow-100 border-yellow-300',
  pov: 'text-green-600 bg-green-100 border-green-300',
  evicted: 'text-red-600 bg-red-100 border-red-300',
  jury: 'text-purple-600 bg-purple-100 border-purple-300',
});