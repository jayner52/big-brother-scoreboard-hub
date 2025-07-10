import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PaymentInfoDisplay } from './PaymentInfoDisplay';
import { usePool } from '@/contexts/PoolContext';
import { usePoolData } from '@/hooks/usePoolData';

export const DraftSummaryBox: React.FC = () => {
  const { activePool } = usePool();
  const { activePool: poolData } = usePoolData({ poolId: activePool?.id });

  if (!poolData) return null;

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6">
        <PaymentInfoDisplay poolSettings={poolData} />
      </CardContent>
    </Card>
  );
};