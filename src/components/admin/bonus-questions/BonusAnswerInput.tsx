
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

  if (question.question_type === 'creature_select') {
    return (
      <div className="space-y-2">
        <Select 
          value={currentAnswer || ''} 
          onValueChange={onAnswerChange}
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
        {currentAnswer && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAnswerChange('')}
          >
            Clear Selection
          </Button>
        )}
      </div>
    );
  }

  if (question.question_type === 'player_select') {
    return (
      <div className="space-y-2">
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
        {currentAnswer && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAnswerChange('')}
          >
            Clear Selection
          </Button>
        )}
      </div>
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
        {(currentAnswer?.player1 || currentAnswer?.player2) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAnswerChange({ player1: '', player2: '' })}
          >
            Clear Selection
          </Button>
        )}
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
        {currentAnswer && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAnswerChange('')}
          >
            Clear
          </Button>
        )}
      </div>
    );
  }

  if (question.question_type === 'number') {
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '') {
        onAnswerChange(0);
      } else {
        onAnswerChange(parseInt(value) || 0);
      }
    };

    return (
      <Input
        type="number"
        value={currentAnswer === 0 ? '' : (currentAnswer || '').toString()}
        onChange={handleNumberChange}
        placeholder="Enter correct number"
        min="0"
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
