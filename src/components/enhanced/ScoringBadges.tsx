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
  const competitionRules = scoringRules.filter(r => r.category === 'competitions');
  const bonusRules = scoringRules.filter(r => r.category === 'bonuses');
  
  // Add competition badges
  competitionRules.forEach(rule => {
    if (rule.subcategory === 'hoh_winner') {
      badges.push(<Badge key={rule.id} variant="secondary" className="bg-yellow-500/20 text-yellow-700">HOH: {rule.points} pts</Badge>);
    } else if (rule.subcategory === 'pov_winner') {
      badges.push(<Badge key={rule.id} variant="secondary" className="bg-green-500/20 text-green-700">POV: {rule.points} pts</Badge>);
    } else if (rule.subcategory === 'survival') {
      badges.push(<Badge key={rule.id} variant="secondary" className="bg-blue-500/20 text-blue-700">Survival: {rule.points} pt/week</Badge>);
    }
  });

  // Add bonus badge with tooltip
  if (bonusQuestions.length > 0) {
    badges.push(
      <TooltipProvider key="bonus">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-700 cursor-help">
              Bonus: {bonusQuestions.map(q => q.points_value).join('/')} pts
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
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

  return (
    <div className="flex flex-wrap gap-2 mt-2 text-sm">
      {badges}
    </div>
  );
};