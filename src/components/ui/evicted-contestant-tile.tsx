import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EvictedContestantTileProps {
  name: string;
  points?: number;
  evictionWeek?: number;
  evictionType?: string;
  className?: string;
  showPoints?: boolean;
  showEvictionInfo?: boolean;
}

export const EvictedContestantTile: React.FC<EvictedContestantTileProps> = ({
  name,
  points = 0,
  evictionWeek,
  evictionType,
  className = "",
  showPoints = true,
  showEvictionInfo = true
}) => {
  const getEvictionTypeDisplay = (type?: string) => {
    switch (type) {
      case 'self_evicted':
        return 'Self-Evicted';
      case 'removed_production':
        return 'Removed';
      case 'normal_eviction':
      default:
        return 'Evicted';
    }
  };

  return (
    <div className={`
      relative p-3 rounded-lg border-2 
      bg-red-50/80 border-red-200/60 
      opacity-90 transition-all duration-200
      ${className}
    `}>
      {/* Evicted icon */}
      <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
        <X className="h-3 w-3 text-white" />
      </div>

      <div className="space-y-2">
        {/* Contestant name */}
        <div className="font-medium text-red-800 text-sm">
          {name}
        </div>

        {/* Eviction info */}
        {showEvictionInfo && evictionWeek && (
          <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-300">
            Week {evictionWeek} - {getEvictionTypeDisplay(evictionType)}
          </Badge>
        )}

        {/* Points */}
        {showPoints && (
          <div className={`text-sm font-semibold ${
            points > 0 ? 'text-green-600' : 
            points < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {points > 0 ? '+' : ''}{points}pts
          </div>
        )}
      </div>
    </div>
  );
};