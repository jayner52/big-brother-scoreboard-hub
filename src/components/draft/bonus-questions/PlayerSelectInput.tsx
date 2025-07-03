import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContestantGroup } from '@/types/pool';

interface PlayerSelectInputProps {
  value: string;
  onChange: (value: string) => void;
  contestantGroups: ContestantGroup[];
  placeholder?: string;
}

export const PlayerSelectInput: React.FC<PlayerSelectInputProps> = ({
  value,
  onChange,
  contestantGroups,
  placeholder = "Select a player",
}) => {
  return (
    <Select 
      value={value || ''} 
      onValueChange={onChange}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
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
};