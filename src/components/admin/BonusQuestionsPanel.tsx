import React from 'react';
import { useBonusQuestions } from '@/hooks/useBonusQuestions';
import { BonusQuestionCard } from './bonus-questions/BonusQuestionCard';

export const BonusQuestionsPanel: React.FC = () => {
  const {
    contestants,
    bonusQuestions,
    bonusAnswers,
    loading,
    handleBonusAnswer
  } = useBonusQuestions();

  if (loading) {
    return <div className="text-center py-8">Loading bonus questions...</div>;
  }

  return (
    <div className="space-y-6">
      {bonusQuestions.map((question) => (
        <BonusQuestionCard
          key={question.id}
          question={question}
          currentAnswer={bonusAnswers[question.id]}
          contestants={contestants}
          onAnswerChange={handleBonusAnswer}
        />
      ))}
    </div>
  );
};