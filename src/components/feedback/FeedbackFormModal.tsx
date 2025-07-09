
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FeedbackFormModalProps {
  children: React.ReactNode;
}

export const FeedbackFormModal: React.FC<FeedbackFormModalProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white shadow-xl">
        {children}
      </Card>
    </div>
  );
};
