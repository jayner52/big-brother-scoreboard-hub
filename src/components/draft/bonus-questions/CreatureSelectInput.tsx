import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreatureSelectInputProps {
  value: string;
  onChange: (value: string) => void;
}

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

export const CreatureSelectInput: React.FC<CreatureSelectInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <Select 
      value={value || ''} 
      onValueChange={onChange}
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
};