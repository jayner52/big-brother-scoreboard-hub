import React from 'react';
import { BonusQuestion } from '@/types/pool';

interface CorrectAnswerCellProps {
  question: BonusQuestion;
}

export const CorrectAnswerCell: React.FC<CorrectAnswerCellProps> = ({
  question,
}) => {
  if (!question.answer_revealed || !question.correct_answer) {
    return <span className="text-muted-foreground font-medium">TBD</span>;
  }
  
  if (question.question_type === 'dual_player_select') {
    try {
      const parsed = JSON.parse(question.correct_answer);
      return (
        <div className="space-y-1">
          <div className="text-xs font-medium text-green-700">{parsed.player1}</div>
          <div className="text-xs font-medium text-green-700">{parsed.player2}</div>
        </div>
      );
    } catch {
      return <span className="text-sm font-medium text-green-700">{question.correct_answer}</span>;
    }
  }
  
  return <span className="text-sm font-medium text-green-700">{question.correct_answer}</span>;
};