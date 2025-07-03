import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { BonusQuestion } from '@/types/pool';

interface MultipleCorrectAnswersProps {
  question: BonusQuestion;
  onUpdate: (questionId: string, correctAnswers: string[]) => void;
}

export const MultipleCorrectAnswers: React.FC<MultipleCorrectAnswersProps> = ({
  question,
  onUpdate
}) => {
  const [answers, setAnswers] = useState<string[]>(
    question.correct_answer ? [question.correct_answer] : ['']
  );

  const addAnswer = () => {
    const newAnswers = [...answers, ''];
    setAnswers(newAnswers);
  };

  const removeAnswer = (index: number) => {
    const newAnswers = answers.filter((_, i) => i !== index);
    setAnswers(newAnswers);
    onUpdate(question.id, newAnswers.filter(a => a.trim()));
  };

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    onUpdate(question.id, newAnswers.filter(a => a.trim()));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{question.question_text}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-gray-600">Set multiple correct answers for this question:</div>
        
        {answers.map((answer, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={answer}
              onChange={(e) => updateAnswer(index, e.target.value)}
              placeholder={`Correct answer ${index + 1}`}
              className="flex-1"
            />
            {answers.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeAnswer(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={addAnswer}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Another Correct Answer
        </Button>
        
        {answers.filter(a => a.trim()).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {answers.filter(a => a.trim()).map((answer, index) => (
              <Badge key={index} variant="secondary">
                {answer}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};