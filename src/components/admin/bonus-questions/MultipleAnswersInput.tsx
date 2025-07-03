import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { BonusAnswerInput } from './BonusAnswerInput';
import { BonusQuestion, Contestant } from '@/types/pool';

interface MultipleAnswersInputProps {
  question: BonusQuestion;
  currentAnswers: any[];
  contestants: Contestant[];
  onAnswersChange: (answers: any[]) => void;
}

export const MultipleAnswersInput: React.FC<MultipleAnswersInputProps> = ({
  question,
  currentAnswers,
  contestants,
  onAnswersChange
}) => {
  const addAnswer = () => {
    const newAnswers = [...currentAnswers, ''];
    onAnswersChange(newAnswers);
  };

  const removeAnswer = (index: number) => {
    if (currentAnswers.length > 1) {
      const newAnswers = currentAnswers.filter((_, i) => i !== index);
      onAnswersChange(newAnswers);
    }
  };

  const updateAnswer = (index: number, value: any) => {
    const newAnswers = [...currentAnswers];
    newAnswers[index] = value;
    onAnswersChange(newAnswers);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Correct Answers ({question.points_value} pts each)</label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAnswer}
          >
            <Plus className="h-4 w-4" />
          </Button>
          {currentAnswers.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeAnswer(currentAnswers.length - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {currentAnswers.map((answer, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground min-w-[60px]">
            Answer {index + 1}:
          </span>
          <div className="flex-1">
            <BonusAnswerInput
              question={question}
              currentAnswer={answer}
              contestants={contestants}
              onAnswerChange={(value) => updateAnswer(index, value)}
            />
          </div>
          {currentAnswers.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeAnswer(index)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};