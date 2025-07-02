import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BonusQuestion, Contestant } from '@/types/pool';
import { BonusAnswerInput } from './BonusAnswerInput';

interface BonusQuestionCardProps {
  question: BonusQuestion;
  currentAnswer: any;
  contestants: Contestant[];
  onAnswerChange: (questionId: string, answer: any, revealed: boolean) => void;
}

export const BonusQuestionCard: React.FC<BonusQuestionCardProps> = ({
  question,
  currentAnswer,
  contestants,
  onAnswerChange
}) => {
  const handleAnswerChange = (value: any) => {
    onAnswerChange(question.id, value, question.answer_revealed);
  };

  const handleRevealToggle = (checked: boolean) => {
    onAnswerChange(question.id, currentAnswer || '', checked);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{question.question_text}</CardTitle>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{question.points_value} points</Badge>
          <div className="flex items-center space-x-2">
            <Switch
              checked={question.answer_revealed}
              onCheckedChange={handleRevealToggle}
            />
            <Label>Revealed</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BonusAnswerInput
          question={question}
          currentAnswer={currentAnswer}
          contestants={contestants}
          onAnswerChange={handleAnswerChange}
        />
      </CardContent>
    </Card>
  );
};