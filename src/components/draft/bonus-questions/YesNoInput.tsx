import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
      <Switch
        checked={value === 'yes'}
        onCheckedChange={(checked) => onChange(checked ? 'yes' : 'no')}
      />
      <Label>{value === 'yes' ? 'Yes' : 'No'}</Label>
    </div>
  );
};