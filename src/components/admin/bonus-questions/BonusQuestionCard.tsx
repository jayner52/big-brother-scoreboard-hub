import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';
import { BonusQuestion, Contestant } from '@/types/pool';
import { BonusAnswerInput } from './BonusAnswerInput';

interface BonusQuestionCardProps {
  question: BonusQuestion;
  currentAnswer: any;
  contestants: Contestant[];
  onAnswerChange: (questionId: string, answer: any, revealed: boolean) => void;
  onPointsChange?: (questionId: string, points: number) => void;
}

export const BonusQuestionCard: React.FC<BonusQuestionCardProps> = ({
  question,
  currentAnswer,
  contestants,
  onAnswerChange,
  onPointsChange
}) => {
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [editingPoints, setEditingPoints] = useState(question.points_value.toString());

  const handleAnswerChange = (value: any) => {
    onAnswerChange(question.id, value, question.answer_revealed);
  };

  const handleRevealToggle = (checked: boolean) => {
    onAnswerChange(question.id, currentAnswer || '', checked);
  };

  const handlePointsSave = () => {
    const points = parseInt(editingPoints);
    if (!isNaN(points) && onPointsChange) {
      onPointsChange(question.id, points);
      setIsEditingPoints(false);
    }
  };

  const handlePointsCancel = () => {
    setEditingPoints(question.points_value.toString());
    setIsEditingPoints(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{question.question_text}</CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditingPoints ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={editingPoints}
                  onChange={(e) => setEditingPoints(e.target.value)}
                  className="w-20 h-6 text-sm"
                />
                <span className="text-sm">pts</span>
                <Button size="sm" variant="ghost" onClick={handlePointsSave}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handlePointsCancel}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{question.points_value} points</Badge>
                {onPointsChange && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsEditingPoints(true)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
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