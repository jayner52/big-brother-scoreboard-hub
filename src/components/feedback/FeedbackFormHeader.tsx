import React from 'react';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { getFormTitle, getFormDescription } from './feedbackFormConfig';

interface FeedbackFormHeaderProps {
  type: 'bug' | 'feature' | 'comment';
  onClose: () => void;
}

export const FeedbackFormHeader: React.FC<FeedbackFormHeaderProps> = ({ type, onClose }) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <div>
        <CardTitle>{getFormTitle(type)}</CardTitle>
        <CardDescription>{getFormDescription(type)}</CardDescription>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </CardHeader>
  );
};