import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PoolEntry, BonusQuestion } from '@/types/pool';
import { evaluateBonusAnswer } from '@/utils/bonusQuestionUtils';

interface BonusAnswerCellProps {
  entry: PoolEntry;
  question: BonusQuestion;
}

export const BonusAnswerCell: React.FC<BonusAnswerCellProps> = ({
  entry,
  question,
}) => {
  const answer = entry.bonus_answers[question.id];
  
  if (!answer) return <span className="text-muted-foreground">—</span>;

  // Check if this question has been revealed and has a correct answer
  if (question.answer_revealed && question.correct_answer) {
    const isCorrect = evaluateBonusAnswer(answer, question.correct_answer, question.question_type);
    
    if (question.question_type === 'dual_player_select' && typeof answer === 'object') {
      return (
        <div className="space-y-1">
          <div className={`px-2 py-1 rounded text-xs ${
            isCorrect ? 'bg-green-100 text-green-800 font-medium' : 'bg-red-100 text-red-800'
          }`}>
            <div>{answer.player1}</div>
            <div>{answer.player2}</div>
          </div>
          {isCorrect && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
              +{question.points_value} pts
            </Badge>
          )}
        </div>
      );
    }
    
    return (
      <div className="space-y-1">
        <div className={`px-2 py-1 rounded text-sm ${
          isCorrect ? 'bg-green-100 text-green-800 font-medium' : 'bg-red-100 text-red-800'
        }`}>
          {answer}
        </div>
        {isCorrect && (
          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
            +{question.points_value} pts
          </Badge>
        )}
      </div>
    );
  }
  
  // If not revealed, show answer or TBD
  if (question.question_type === 'dual_player_select' && typeof answer === 'object') {
    return (
      <div className="space-y-1">
        <div className="text-xs">{answer.player1}</div>
        <div className="text-xs">{answer.player2}</div>
      </div>
    );
  }
  
  return <span className="text-sm text-muted-foreground">{answer || 'TBD'}</span>;
};