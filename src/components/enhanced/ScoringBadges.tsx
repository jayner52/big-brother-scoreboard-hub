import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useScoringRules } from '@/hooks/useScoringRules';
import { useBonusQuestions } from '@/hooks/useBonusQuestions';

export const ScoringBadges: React.FC = () => {
  const { scoringRules } = useScoringRules();
  const { bonusQuestions } = useBonusQuestions();

  const badges = [];
  
  // Group scoring rules by category for better display
  const competitionRules = scoringRules.filter(r => r.category === 'competitions' && r.is_active);
  const nominationRules = scoringRules.filter(r => r.subcategory === 'nominee' && r.is_active);
  const evictionRules = scoringRules.filter(r => r.subcategory === 'evicted' && r.is_active);
  const specialRules = scoringRules.filter(r => r.category === 'special_events' && r.is_active);
  
  // Add main competition badges with direct points display
  competitionRules.forEach(rule => {
    if (rule.subcategory === 'hoh_winner') {
      badges.push(
        <Badge key={rule.id} variant="secondary" className="bg-yellow-500/20 text-yellow-700">
          HOH: {rule.points} pts
        </Badge>
      );
    } else if (rule.subcategory === 'pov_winner') {
      badges.push(
        <Badge key={rule.id} variant="secondary" className="bg-green-500/20 text-green-700">
          POV: {rule.points} pts
        </Badge>
      );
    } else if (rule.subcategory === 'survival') {
      badges.push(
        <Badge key={rule.id} variant="secondary" className="bg-blue-500/20 text-blue-700">
          Survival: {rule.points} pt/week
        </Badge>
      );
    }
  });

  // Add simplified bonus badge with hover tooltip
  if (bonusQuestions.length > 0) {
    badges.push(
      <TooltipProvider key="bonus">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-700 cursor-help">
              Bonus Questions
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
              <div className="font-semibold text-sm mb-1">Bonus Questions:</div>
              {bonusQuestions.map(q => (
                <div key={q.id} className="text-xs">
                  <span className="font-medium">{q.points_value} pts:</span> {q.question_text}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Add nominations badge with tooltip
  if (nominationRules.length > 0) {
    badges.push(
      <TooltipProvider key="nominations">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-700 cursor-help">
              Nominations
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
              {nominationRules.map(rule => (
                <div key={rule.id} className="text-xs">
                  <span className="font-medium">{rule.points} pts:</span> {rule.description}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Add evictions badge with tooltip
  if (evictionRules.length > 0) {
    badges.push(
      <TooltipProvider key="evictions">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-red-500/20 text-red-700 cursor-help">
              Evictions
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
              {evictionRules.map(rule => (
                <div key={rule.id} className="text-xs">
                  <span className="font-medium">{rule.points} pts:</span> {rule.description}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Add special events badge with consolidated hover tooltip
  if (specialRules.length > 0) {
    badges.push(
      <TooltipProvider key="special-events">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-700 cursor-help">
              Special Events
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
              <div className="font-semibold text-sm mb-1">Special Events:</div>
              {specialRules.map(rule => (
                <div key={rule.id} className="text-xs">
                  <span className="font-medium">{rule.points} pts:</span> {rule.description}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2 text-sm">
      {badges}
    </div>
  );
};