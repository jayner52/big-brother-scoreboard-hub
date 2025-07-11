import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface FilterOption {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  placeholder = "Select options..."
}) => {
  const handleSelectAll = () => {
    onChange(options.map(option => option.value));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleToggleOption = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, value]);
    } else {
      onChange(selectedValues.filter(v => v !== value));
    }
  };

  const selectedCount = selectedValues.length;
  const allSelected = selectedCount === options.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 font-normal justify-between min-w-[120px]"
        >
          <span className="truncate">
            {selectedCount === 0 
              ? placeholder 
              : selectedCount === 1 
                ? options.find(opt => opt.value === selectedValues[0])?.label
                : `${selectedCount} selected`
            }
          </span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-3 border-b">
          <div className="font-medium text-sm">{title}</div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleSelectAll}
              disabled={allSelected}
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleClearAll}
              disabled={selectedCount === 0}
            >
              Clear All
            </Button>
          </div>
        </div>
        <div className="p-2 max-h-64 overflow-y-auto">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-sm cursor-pointer"
                onClick={() => handleToggleOption(option.value, !isSelected)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => 
                    handleToggleOption(option.value, checked as boolean)
                  }
                />
                <label className="text-sm cursor-pointer flex-1">
                  {option.label}
                </label>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};