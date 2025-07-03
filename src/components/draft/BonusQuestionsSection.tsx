import React from 'react';
import { BonusQuestionCard } from './bonus-questions/BonusQuestionCard';
import { BonusQuestionInput } from './bonus-questions/BonusQuestionInput';
import { BonusQuestionsHeader } from './bonus-questions/BonusQuestionsHeader';
import { BonusQuestion, ContestantGroup } from '@/types/pool';

interface BonusQuestionsSectionProps {
  bonusQuestions: BonusQuestion[];
  contestantGroups: ContestantGroup[];
  bonusAnswers: Record<string, any>;
  onBonusAnswerChange: (questionId: string, value: any) => void;
}

const hasValidAnswer = (answer: any): boolean => {
  if (!answer) return false;
  if (typeof answer === 'string') return answer.trim() !== '';
  if (typeof answer === 'object') return answer.player1 && answer.player2;
  return true;
};

export const BonusQuestionsSection: React.FC<BonusQuestionsSectionProps> = ({
  bonusQuestions,
  contestantGroups,
  bonusAnswers,
  onBonusAnswerChange,
}) => {
  return (
    <div className="space-y-6">
      <BonusQuestionsHeader bonusQuestions={bonusQuestions} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bonusQuestions.map((question) => {
          const currentAnswer = bonusAnswers[question.id];
          const hasAnswer = hasValidAnswer(currentAnswer);

          return (
            <BonusQuestionCard
              key={question.id}
              question={question}
              hasAnswer={hasAnswer}
            >
              <BonusQuestionInput
                question={question}
                value={currentAnswer}
                onChange={(value) => onBonusAnswerChange(question.id, value)}
                contestantGroups={contestantGroups}
              />
            </BonusQuestionCard>
          );
        })}
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>
          🎯 <strong>Pro Tip:</strong> These predictions can make or break your season - choose wisely!
        </p>
      </div>
    </div>
  );
};