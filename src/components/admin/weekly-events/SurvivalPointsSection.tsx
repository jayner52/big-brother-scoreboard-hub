import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ContestantWithBio, WeeklyEventForm, DetailedScoringRule } from '@/types/admin';
import { PointsTooltip } from '@/components/ui/points-tooltip';

interface SurvivalPointsSectionProps {
  eventForm: WeeklyEventForm;
  contestants: ContestantWithBio[];
  evictedThisWeek: string[];
  allEvictedUpToThisWeek: string[];
  scoringRules: DetailedScoringRule[];
}

export const SurvivalPointsSection: React.FC<SurvivalPointsSectionProps> = ({
  eventForm,
  contestants,
  evictedThisWeek,
  allEvictedUpToThisWeek,
  scoringRules,
}) => {
  // Get survival points from scoring rules
  const survivalRule = scoringRules.find(r => r.category === 'weekly_events' && r.subcategory === 'survival' && r.is_active);
  const survivalPoints = survivalRule?.points || 1;

  // Calculate who gets survival points
  const survivingContestants = contestants.filter(c => 
    !evictedThisWeek.includes(c.name) && !allEvictedUpToThisWeek.includes(c.name)
  );

  if (survivingContestants.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-emerald-800 flex items-center gap-2">
        <span className="text-xl">❤️</span>
        Survival Points
      </h3>
      <div className="space-y-2">
        <p className="text-sm text-emerald-700 mb-3">
          The following contestants survived this week and earn survival points:
        </p>
        <PointsTooltip 
          scoringRules={scoringRules} 
          category="weekly_events" 
          subcategory="survival"
        >
          <div className="flex flex-wrap gap-2">
            {survivingContestants.map(contestant => (
              <Badge 
                key={contestant.id} 
                variant="secondary" 
                className="bg-emerald-100 text-emerald-800 border-emerald-300"
              >
                {contestant.name} (+{survivalPoints})
              </Badge>
            ))}
          </div>
        </PointsTooltip>
      </div>
    </div>
  );
};