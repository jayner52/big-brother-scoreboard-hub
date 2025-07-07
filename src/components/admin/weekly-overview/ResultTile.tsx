import React from 'react';
import { BigBrotherIcon } from '@/components/BigBrotherIcons';
import { Users, Target } from 'lucide-react';

interface ResultTileProps {
  label: string;
  value: string;
  iconType?: 'hoh' | 'pov' | 'evicted' | 'nominees' | 'custom';
  customIcon?: React.ComponentType<{ className?: string }>;
  colorScheme: 'yellow' | 'green' | 'orange' | 'red' | 'blue';
  subtitle?: string;
}

const colorClasses = {
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  green: 'bg-green-50 border-green-200 text-green-800', 
  orange: 'bg-orange-50 border-orange-200 text-orange-800',
  red: 'bg-red-50 border-red-200 text-red-800',
  blue: 'bg-blue-50 border-blue-200 text-blue-800'
};

const valueColorClasses = {
  yellow: 'text-yellow-900',
  green: 'text-green-900',
  orange: 'text-orange-900', 
  red: 'text-red-900',
  blue: 'text-blue-900'
};

const iconColorClasses = {
  yellow: 'text-yellow-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
  blue: 'text-blue-600'
};

export const ResultTile: React.FC<ResultTileProps> = ({ 
  label, 
  value, 
  iconType = 'custom',
  customIcon: CustomIcon,
  colorScheme,
  subtitle 
}) => {
  const renderIcon = () => {
    if (iconType === 'nominees') {
      return <Target className={`h-6 w-6 mx-auto mb-1 ${iconColorClasses[colorScheme]}`} />;
    }
    
    if (iconType === 'custom' && CustomIcon) {
      return <CustomIcon className={`h-6 w-6 mx-auto mb-1 ${iconColorClasses[colorScheme]}`} />;
    }
    
    // For BB icon types, we know they're valid for BigBrotherIcon
    if (iconType === 'hoh' || iconType === 'pov' || iconType === 'evicted') {
      return <BigBrotherIcon type={iconType} className="h-6 w-6 mx-auto mb-1" />;
    }
    
    // Default fallback
    return <Target className={`h-6 w-6 mx-auto mb-1 ${iconColorClasses[colorScheme]}`} />;
  };

  return (
    <div className={`text-center p-3 rounded-lg border ${colorClasses[colorScheme]}`}>
      {renderIcon()}
      <p className={`text-sm font-medium ${colorClasses[colorScheme].split(' ')[2]}`}>{label}</p>
      <p className={`font-bold ${valueColorClasses[colorScheme]}`}>{value || "N/A"}</p>
      {subtitle && (
        <p className={`text-xs ${iconColorClasses[colorScheme]}`}>{subtitle}</p>
      )}
    </div>
  );
};