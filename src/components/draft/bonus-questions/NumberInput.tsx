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

  const handleBlur = () => {
    // If value is 0, keep it as 0 (don't make it empty)
    if (value === 0) {
      onChange(0);
    }
  };

  return (
    <Input
      type="number"
      value={value === 0 ? '' : (value?.toString() || '')}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="Enter a number"
      min="0"
    />
  );
};
