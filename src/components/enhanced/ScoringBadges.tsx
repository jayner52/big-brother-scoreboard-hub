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
  const competitionRules = scoringRules.filter(r => r.category === 'competition' && r.is_active);
  const weeklyRules = scoringRules.filter(r => r.category === 'weekly' && r.is_active);
  const specialRules = scoringRules.filter(r => r.category === 'special_events' && r.is_active);
  const juryRules = scoringRules.filter(r => r.category === 'jury' && r.is_active);
  const finalRules = scoringRules.filter(r => r.category === 'final_placement' && r.is_active);
  const achievementRules = scoringRules.filter(r => r.category === 'special_achievements' && r.is_active);
  
  // Add main competition badges with direct points display
  competitionRules.forEach(rule => {
    if (rule.subcategory === 'hoh_winner') {
      badges.push(
        <Badge key={rule.id} variant="secondary" className="bg-white/80 backdrop-blur-sm text-yellow-800 border border-yellow-200">
          🏆 HOH: {rule.points} pts
        </Badge>
      );
    } else if (rule.subcategory === 'pov_winner') {
      badges.push(
        <Badge key={rule.id} variant="secondary" className="bg-white/80 backdrop-blur-sm text-green-800 border border-green-200">
          🗝️ POV: {rule.points} pts
        </Badge>
      );
    } else if (rule.subcategory === 'bb_arena_winner') {
      badges.push(
        <Badge key={rule.id} variant="secondary" className="bg-white/80 backdrop-blur-sm text-purple-800 border border-purple-200">
          🛡️ BB Arena: {rule.points} pts
        </Badge>
      );
    }
  });

  // Add Weekly Gameplay Points badge with tooltip
  if (weeklyRules.length > 0) {
    badges.push(
      <TooltipProvider key="weekly-gameplay">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-blue-800 border border-blue-200 cursor-help">
              Weekly Gameplay Points
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
              <div className="font-semibold text-sm mb-1">Weekly Points:</div>
              {weeklyRules.map(rule => (
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

  // Add simplified bonus badge with hover tooltip
  if (bonusQuestions.length > 0) {
    badges.push(
      <TooltipProvider key="bonus">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-purple-800 border border-purple-200 cursor-help">
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


  // Add achievements badge
  if (achievementRules.length > 0) {
    badges.push(
      <TooltipProvider key="achievements">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-orange-800 border border-orange-200 cursor-help">
              Achievements
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
              <div className="font-semibold text-sm mb-1">Special Achievements:</div>
              {achievementRules.map(rule => (
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

  // Add jury/finale badge
  if (juryRules.length > 0 || finalRules.length > 0) {
    const allEndgameRules = [...juryRules, ...finalRules];
    badges.push(
      <TooltipProvider key="endgame">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-amber-800 border border-amber-200 cursor-help">
              Endgame & Finals
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
              <div className="font-semibold text-sm mb-1">Endgame Points:</div>
              {allEndgameRules.map(rule => (
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
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-indigo-800 border border-indigo-200 cursor-help">
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