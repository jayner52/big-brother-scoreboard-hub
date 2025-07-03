import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentInfoDisplay } from './PaymentInfoDisplay';
import { usePoolData } from '@/hooks/usePoolData';

export const DraftSummaryBox: React.FC = () => {
  const { poolSettings } = usePoolData();

  if (!poolSettings) return null;

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6">
        <PaymentInfoDisplay poolSettings={poolSettings} />
      </CardContent>
    </Card>
  );
};