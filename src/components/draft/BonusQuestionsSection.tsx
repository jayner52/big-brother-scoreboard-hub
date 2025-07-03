import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Trophy } from 'lucide-react';
import { BigBrotherTooltip } from './BigBrotherTooltips';
import { BonusQuestion, ContestantGroup } from '@/types/pool';

interface BonusQuestionsSectionProps {
  bonusQuestions: BonusQuestion[];
  contestantGroups: ContestantGroup[];
  bonusAnswers: Record<string, any>;
  onBonusAnswerChange: (questionId: string, value: any) => void;
}

export const BonusQuestionsSection: React.FC<BonusQuestionsSectionProps> = ({
  bonusQuestions,
  contestantGroups,
  bonusAnswers,
  onBonusAnswerChange,
}) => {
  const creatureOptions = [
    'Mammal',
    'Bird', 
    'Reptile/Amphibian',
    'Food',
    'Robot',
    'Bug/Insect/Arachnid',
    'Fish/Sea Creature',
    'Alien',
    'Other',
    "They won't play OTEV"
  ];

  const renderBonusQuestion = (question: BonusQuestion) => {
    const currentAnswer = bonusAnswers[question.id];

    switch (question.question_type) {
      case 'creature_select':
        return (
          <Select 
            value={currentAnswer || ''} 
            onValueChange={(value) => onBonusAnswerChange(question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select creature type" />
            </SelectTrigger>
            <SelectContent>
              {creatureOptions.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'player_select':
        return (
          <Select 
            value={currentAnswer || ''} 
            onValueChange={(value) => onBonusAnswerChange(question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a player" />
            </SelectTrigger>
            <SelectContent>
              {contestantGroups.flatMap(group => 
                group.contestants?.map(contestant => (
                  <SelectItem key={contestant.id} value={contestant.name}>
                    {contestant.name}
                  </SelectItem>
                )) || []
              )}
            </SelectContent>
          </Select>
        );

      case 'dual_player_select':
        return (
          <div className="space-y-2">
            <Select 
              value={currentAnswer?.player1 || ''} 
              onValueChange={(value) => onBonusAnswerChange(question.id, { ...currentAnswer, player1: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select first player" />
              </SelectTrigger>
              <SelectContent>
                {contestantGroups.flatMap(group => 
                  group.contestants?.map(contestant => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  )) || []
                )}
              </SelectContent>
            </Select>
            <Select 
              value={currentAnswer?.player2 || ''} 
              onValueChange={(value) => onBonusAnswerChange(question.id, { ...currentAnswer, player2: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select second player" />
              </SelectTrigger>
              <SelectContent>
                {contestantGroups.flatMap(group => 
                  group.contestants?.map(contestant => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  )) || []
                )}
              </SelectContent>
            </Select>
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentAnswer === 'yes'}
              onCheckedChange={(checked) => onBonusAnswerChange(question.id, checked ? 'yes' : 'no')}
            />
            <Label>{currentAnswer === 'yes' ? 'Yes' : 'No'}</Label>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={currentAnswer || ''}
            onChange={(e) => onBonusAnswerChange(question.id, parseInt(e.target.value) || 0)}
            placeholder="Enter a number"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={currentAnswer || ''}
            onChange={(e) => onBonusAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
          />
        );
    }
  };

  const getPointsBadgeColor = (points: number) => {
    if (points >= 5) return 'bg-purple-100 text-purple-700 border-purple-300';
    if (points >= 3) return 'bg-blue-100 text-blue-700 border-blue-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Target className="h-6 w-6 text-purple-600" />
          Bonus Predictions
        </h3>
        <p className="text-muted-foreground mb-4">
          Make strategic predictions to earn extra points throughout the season
        </p>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          <Trophy className="h-3 w-3 mr-1" />
          Earn up to {bonusQuestions.reduce((sum, q) => sum + q.points_value, 0)} bonus points
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bonusQuestions.map((question) => {
          const hasAnswer = bonusAnswers[question.id] && 
            (typeof bonusAnswers[question.id] === 'string' ? 
              bonusAnswers[question.id].trim() : 
              bonusAnswers[question.id].player1 || bonusAnswers[question.id].player2);

          return (
            <Card 
              key={question.id} 
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
                {renderBonusQuestion(question)}
              </CardContent>
            </Card>
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