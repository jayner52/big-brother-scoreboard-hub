import React from 'react';
import { PlayerSelectInput } from './PlayerSelectInput';
import { ContestantGroup } from '@/types/pool';

interface DualPlayerSelectInputProps {
  value: { player1?: string; player2?: string } | undefined;
  onChange: (value: { player1?: string; player2?: string }) => void;
  contestantGroups: ContestantGroup[];
}

export const DualPlayerSelectInput: React.FC<DualPlayerSelectInputProps> = ({
  value,
  onChange,
  contestantGroups,
}) => {
  return (
    <div className="space-y-2">
      <PlayerSelectInput
        value={value?.player1 || ''}
        onChange={(player1) => onChange({ ...value, player1 })}
        contestantGroups={contestantGroups}
        placeholder="Select first player"
      />
      <PlayerSelectInput
        value={value?.player2 || ''}
        onChange={(player2) => onChange({ ...value, player2 })}
        contestantGroups={contestantGroups}
        placeholder="Select second player"
      />
    </div>
  );
};