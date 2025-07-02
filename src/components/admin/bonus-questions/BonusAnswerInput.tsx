import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BonusQuestion, Contestant } from '@/types/pool';

interface BonusAnswerInputProps {
  question: BonusQuestion;
  currentAnswer: any;
  contestants: Contestant[];
  onAnswerChange: (value: any) => void;
}

export const BonusAnswerInput: React.FC<BonusAnswerInputProps> = ({
  question,
  currentAnswer,
  contestants,
  onAnswerChange
}) => {
  if (question.question_type === 'player_select') {
    return (
      <Select 
        value={currentAnswer || ''} 
        onValueChange={onAnswerChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select correct answer" />
        </SelectTrigger>
        <SelectContent>
          {contestants.map(contestant => (
            <SelectItem key={contestant.id} value={contestant.name}>
              {contestant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (question.question_type === 'dual_player_select') {
    return (
      <div className="space-y-2">
        <Select 
          value={currentAnswer?.player1 || ''} 
          onValueChange={(value) => 
            onAnswerChange({ 
              ...currentAnswer, 
              player1: value 
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select first player" />
          </SelectTrigger>
          <SelectContent>
            {contestants.map(contestant => (
              <SelectItem key={contestant.id} value={contestant.name}>
                {contestant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={currentAnswer?.player2 || ''} 
          onValueChange={(value) => 
            onAnswerChange({ 
              ...currentAnswer, 
              player2: value 
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select second player" />
          </SelectTrigger>
          <SelectContent>
            {contestants.map(contestant => (
              <SelectItem key={contestant.id} value={contestant.name}>
                {contestant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (question.question_type === 'yes_no') {
    return (
      <div className="flex items-center space-x-4">
        <Button
          type="button"
          variant={currentAnswer === 'yes' ? 'default' : 'outline'}
          onClick={() => onAnswerChange('yes')}
        >
          Yes
        </Button>
        <Button
          type="button"
          variant={currentAnswer === 'no' ? 'default' : 'outline'}
          onClick={() => onAnswerChange('no')}
        >
          No
        </Button>
      </div>
    );
  }

  if (question.question_type === 'number') {
    return (
      <Input
        type="number"
        value={currentAnswer || ''}
        onChange={(e) => onAnswerChange(parseInt(e.target.value) || 0)}
        placeholder="Enter correct number"
      />
    );
  }

  // Default text input for any other question types
  return (
    <Input
      type="text"
      value={currentAnswer || ''}
      onChange={(e) => onAnswerChange(e.target.value)}
      placeholder="Enter correct answer"
    />
  );
};