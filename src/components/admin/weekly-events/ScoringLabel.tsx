import React from 'react';
import { Label } from '@/components/ui/label';
import { DetailedScoringRule } from '@/types/admin';

interface ScoringLabelProps {
  children: React.ReactNode;
  scoringRules: DetailedScoringRule[];
  category: string;
  subcategory: string;
  className?: string;
}

export const ScoringLabel: React.FC<ScoringLabelProps> = ({
  children,
  scoringRules,
  category,
  subcategory,
  className = ""
}) => {
  const getPointValue = () => {
    const rule = scoringRules.find(
      r => r.category === category && r.subcategory === subcategory && r.is_active
    );
    return rule?.points || 0;
  };

  const pointValue = getPointValue();
  const sign = pointValue >= 0 ? '+' : '';
  const colorClass = pointValue >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <Label className={`font-semibold flex items-center gap-2 ${className}`}>
      {children}
      <span className={`text-sm font-normal ${colorClass}`}>
        ({sign}{pointValue} pts)
      </span>
    </Label>
  );
};