import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BigBrotherTooltip } from '../BigBrotherTooltips';
import { BonusQuestion } from '@/types/pool';

interface BonusQuestionCardProps {
  question: BonusQuestion;
  hasAnswer: boolean;
  children: React.ReactNode;
}

const getPointsBadgeColor = (points: number) => {
  if (points >= 5) return 'bg-purple-100 text-purple-700 border-purple-300';
  if (points >= 3) return 'bg-blue-100 text-blue-700 border-blue-300';
  return 'bg-green-100 text-green-700 border-green-300';
};

export const BonusQuestionCard: React.FC<BonusQuestionCardProps> = ({
  question,
  hasAnswer,
  children,
}) => {
  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md border-2 ${
        hasAnswer ? 'border-purple-200 bg-purple-50/50' : 'hover:border-purple-200'
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex-1 pr-2">{question.question_text}</span>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${getPointsBadgeColor(question.points_value)} font-bold`}
            >
              {question.points_value} pts
            </Badge>
            <BigBrotherTooltip 
              questionText={question.question_text}
              questionType={question.question_type}
            />
          </div>
        </CardTitle>
        {hasAnswer && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 w-fit">
            Answered
          </Badge>
        )}
      </CardHeader>
      
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};