import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X, Trash2 } from 'lucide-react';
import { BonusQuestion, Contestant } from '@/types/pool';
import { BonusAnswerInput } from './BonusAnswerInput';
import { MultipleAnswersInput } from './MultipleAnswersInput';
import { useAutoPointsRecalculation } from '@/hooks/useAutoPointsRecalculation';

interface BonusQuestionCardProps {
  question: BonusQuestion;
  currentAnswer: any;
  contestants: Contestant[];
  onAnswerChange: (questionId: string, answer: any, revealed: boolean) => void;
  onPointsChange?: (questionId: string, points: number) => void;
  onDelete?: (questionId: string) => void;
}

export const BonusQuestionCard: React.FC<BonusQuestionCardProps> = ({
  question,
  currentAnswer,
  contestants,
  onAnswerChange,
  onPointsChange,
  onDelete
}) => {
  const { triggerRecalculation } = useAutoPointsRecalculation();
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [editingPoints, setEditingPoints] = useState(question.points_value.toString());

  const handleAnswerChange = (value: any) => {
    onAnswerChange(question.id, value, question.answer_revealed);
  };

  const handleRevealToggle = async (checked: boolean) => {
    onAnswerChange(question.id, currentAnswer || '', checked);
    // Trigger recalculation when revealing/hiding answers
    await triggerRecalculation(`Bonus question ${checked ? 'revealed' : 'hidden'}`);
  };

  const handlePointsSave = async () => {
    const points = parseInt(editingPoints);
    if (!isNaN(points) && onPointsChange) {
      await onPointsChange(question.id, points);
      // Update local state to reflect the change immediately
      question.points_value = points;
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
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex-1 pr-4">{question.question_text}</CardTitle>
          {onDelete && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDelete(question.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
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
              <MultipleAnswersInput
                question={question}
                currentAnswers={Array.isArray(currentAnswer) ? currentAnswer : [currentAnswer || '']}
                contestants={contestants}
                onAnswersChange={(answers) => handleAnswerChange(answers.length === 1 ? answers[0] : answers)}
              />
      </CardContent>
    </Card>
  );
};