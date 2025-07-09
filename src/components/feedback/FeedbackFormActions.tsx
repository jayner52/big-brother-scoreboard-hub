import React from 'react';
import { Button } from '@/components/ui/button';

interface FeedbackFormActionsProps {
  isSubmitting: boolean;
  onClose: () => void;
}

export const FeedbackFormActions: React.FC<FeedbackFormActionsProps> = ({ 
  isSubmitting, 
  onClose 
}) => {
  return (
    <div className="flex gap-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="flex-1"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="flex-1"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </div>
  );
};