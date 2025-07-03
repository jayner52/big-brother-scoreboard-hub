import React from 'react';
import { CreatureSelectInput } from './CreatureSelectInput';
import { PlayerSelectInput } from './PlayerSelectInput';
import { DualPlayerSelectInput } from './DualPlayerSelectInput';
import { YesNoInput } from './YesNoInput';
import { NumberInput } from './NumberInput';
import { TextInput } from './TextInput';
import { BonusQuestion, ContestantGroup } from '@/types/pool';

interface BonusQuestionInputProps {
  question: BonusQuestion;
  value: any;
  onChange: (value: any) => void;
  contestantGroups: ContestantGroup[];
}

export const BonusQuestionInput: React.FC<BonusQuestionInputProps> = ({
  question,
  value,
  onChange,
  contestantGroups,
}) => {
  switch (question.question_type) {
    case 'creature_select':
      return (
        <CreatureSelectInput
          value={value}
          onChange={onChange}
        />
      );

    case 'player_select':
      return (
        <PlayerSelectInput
          value={value}
          onChange={onChange}
          contestantGroups={contestantGroups}
        />
      );

    case 'dual_player_select':
      return (
        <DualPlayerSelectInput
          value={value}
          onChange={onChange}
          contestantGroups={contestantGroups}
        />
      );

    case 'yes_no':
      return (
        <YesNoInput
          value={value}
          onChange={onChange}
        />
      );

    case 'number':
      return (
        <NumberInput
          value={value}
          onChange={onChange}
        />
      );

    default:
      return (
        <TextInput
          value={value}
          onChange={onChange}
        />
      );
  }
};