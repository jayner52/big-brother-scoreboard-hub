
import React from 'react';
import { Input } from '@/components/ui/input';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty string during editing
    if (inputValue === '') {
      onChange(0);
      return;
    }
    
    const numericValue = parseInt(inputValue) || 0;
    onChange(numericValue);
  };

  return (
    <Input
      type="number"
      value={value === 0 ? '' : value.toString()}
      onChange={handleChange}
      placeholder="Enter a number"
      min="0"
    />
  );
};
