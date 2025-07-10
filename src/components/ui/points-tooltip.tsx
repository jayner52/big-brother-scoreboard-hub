import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DetailedScoringRule } from '@/types/admin';

interface PointsTooltipProps {
  children: React.ReactNode;
  scoringRules: DetailedScoringRule[];
  category: string;
  subcategory: string;
  customPoints?: number;
}

export const PointsTooltip: React.FC<PointsTooltipProps> = ({
  children,
  scoringRules,
  category,
  subcategory,
  customPoints
}) => {
  const getPointValue = () => {
    if (customPoints !== undefined) {
      return customPoints;
    }

    const rule = scoringRules.find(
      r => r.category === category && r.subcategory === subcategory && r.is_active
    );
    
    return rule?.points || 0;
  };

  const pointValue = getPointValue();
  const sign = pointValue >= 0 ? '+' : '';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-slate-900 text-white border-slate-700">
        <p className="text-sm font-medium">
          Worth: {sign}{pointValue} point{Math.abs(pointValue) !== 1 ? 's' : ''}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};