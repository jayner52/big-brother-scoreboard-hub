import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy } from 'lucide-react';
import { BonusQuestion } from '@/types/pool';

interface BonusQuestionsHeaderProps {
  bonusQuestions: BonusQuestion[];
}

export const BonusQuestionsHeader: React.FC<BonusQuestionsHeaderProps> = ({
  bonusQuestions,
}) => {
  const totalPoints = bonusQuestions.reduce((sum, q) => sum + q.points_value, 0);

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
        <Target className="h-6 w-6 text-purple-600" />
        Bonus Predictions
      </h3>
      <p className="text-muted-foreground mb-4">
        Make strategic predictions to earn extra points throughout the season (all questions required)
      </p>
      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
        <Trophy className="h-3 w-3 mr-1" />
        Earn up to {totalPoints} bonus points
      </Badge>
    </div>
  );
};