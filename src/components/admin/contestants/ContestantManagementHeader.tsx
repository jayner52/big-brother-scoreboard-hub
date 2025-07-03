import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface ContestantManagementHeaderProps {
  onAddClick: () => void;
}

export const ContestantManagementHeader: React.FC<ContestantManagementHeaderProps> = ({
  onAddClick
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Houseguest Management</h2>
      <Button 
        onClick={onAddClick}
        className="flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Add Houseguest
      </Button>
    </div>
  );
};