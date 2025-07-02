import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Bonus Predictions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bonusQuestions.map((question) => (
          <div key={question.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {question.question_text}
              <Badge variant="secondary" className="ml-2">
                {question.points_value} pts
              </Badge>
            </Label>
            {renderBonusQuestion(question)}
          </div>
        ))}
      </div>
    </div>
  );
};