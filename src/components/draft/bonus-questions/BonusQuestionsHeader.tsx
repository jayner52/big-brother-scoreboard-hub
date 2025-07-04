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
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-4 px-6 rounded-lg mb-4 shadow-lg">
        <h3 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Target className="h-7 w-7" />
          Bonus Predictions
        </h3>
        <p className="text-orange-100 mb-3">
          Make strategic predictions to earn extra points throughout the season (all questions required)
        </p>
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
          <Trophy className="h-3 w-3 mr-1" />
          Earn up to {totalPoints} bonus points
        </Badge>
      </div>
    </div>
  );
};