import React from 'react';
import { Button } from '@/components/ui/button';

interface YesNoInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const YesNoInput: React.FC<YesNoInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        type="button"
        variant={value === 'yes' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('yes')}
        className="px-6"
      >
        Yes
      </Button>
      <Button
        type="button"
        variant={value === 'no' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('no')}
        className="px-6"
      >
        No
      </Button>
    </div>
  );
};