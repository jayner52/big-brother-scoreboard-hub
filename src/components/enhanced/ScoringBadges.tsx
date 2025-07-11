import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useScoringRules } from '@/hooks/useScoringRules';
import { useBonusQuestions } from '@/hooks/useBonusQuestions';
import { useActivePool } from '@/hooks/useActivePool';

export const ScoringBadges: React.FC = () => {
  const activePool = useActivePool();
  const { scoringRules } = useScoringRules(activePool?.id);
  const { bonusQuestions } = useBonusQuestions();

  const badges = [];
  
  // Group scoring rules by category for better display
  const competitionRules = scoringRules.filter(r => r.category === 'competition' && r.is_active);
  const weeklyRules = scoringRules.filter(r => r.category === 'weekly' && r.is_active);
  const specialRules = scoringRules.filter(r => r.category === 'special_events' && r.is_active);
  const juryRules = scoringRules.filter(r => r.category === 'jury' && r.is_active);
  const finalRules = scoringRules.filter(r => r.category === 'final_placement' && r.is_active);
  const achievementRules = scoringRules.filter(r => r.category === 'special_achievements' && r.is_active);
  
  // Calculate category totals for badge display
  const weeklyPoints = weeklyRules.reduce((sum, rule) => sum + Math.abs(rule.points), 0);
  const bonusPoints = bonusQuestions.reduce((sum, q) => sum + q.points_value, 0);
  const achievementPoints = achievementRules.reduce((sum, rule) => sum + Math.abs(rule.points), 0);
  const endgamePoints = [...juryRules, ...finalRules].reduce((sum, rule) => sum + Math.abs(rule.points), 0);
  const specialEventPoints = specialRules.reduce((sum, rule) => sum + Math.abs(rule.points), 0);

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
          🚫 POV: {rule.points} pts
        </Badge>
      );
    } else if (rule.subcategory === 'bb_arena_winner') {
      badges.push(
        <Badge key={rule.id} variant="secondary" className="bg-white/80 backdrop-blur-sm text-purple-800 border border-purple-200">
          🏟️ BB Arena: {rule.points} pts
        </Badge>
      );
    }
  });

  // Add Weekly Gameplay Points badge with tooltip
  if (weeklyRules.length > 0) {
    badges.push(
      <Tooltip key="weekly-gameplay">
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors cursor-help"
          >
            🎯 {weeklyPoints}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">Weekly Gameplay Points</p>
          <p className="text-sm text-muted-foreground">Points from competitions, nominations, and gameplay events</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Add bonus questions badge
  if (bonusQuestions.length > 0) {
    badges.push(
      <Tooltip key="bonus">
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors cursor-help"
          >
            ⭐ {bonusPoints}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">Bonus Question Points</p>
          <p className="text-sm text-muted-foreground">Points from correctly answered bonus questions</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Add achievements badge
  if (achievementRules.length > 0) {
    badges.push(
      <Tooltip key="achievements">
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 transition-colors cursor-help"
          >
            🏆 {achievementPoints}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">Achievement Points</p>
          <p className="text-sm text-muted-foreground">Points from special achievements and milestones</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Add jury/finale badge
  if (juryRules.length > 0 || finalRules.length > 0) {
    badges.push(
      <Tooltip key="endgame">
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 transition-colors cursor-help"
          >
            🎪 {endgamePoints}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">Endgame Points</p>
          <p className="text-sm text-muted-foreground">Points from jury phase and finale placement</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Add special events badge
  if (specialRules.length > 0) {
    badges.push(
      <Tooltip key="special-events">
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 transition-colors cursor-help"
          >
            ⚡ {specialEventPoints}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">Special Event Points</p>
          <p className="text-sm text-muted-foreground">Points from unique events and twists</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2 text-sm">
      {badges}
    </div>
  );
};