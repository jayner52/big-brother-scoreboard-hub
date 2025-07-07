import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';
import { calculatePrizes, formatPrize, getPlaceText } from '@/utils/prizeCalculation';

export const PrizePoolSection: React.FC = () => {
  const { activePool } = usePool();
  const [totalEntries, setTotalEntries] = useState(0);

  useEffect(() => {
    if (activePool?.id) {
      loadEntryCount();
    }
  }, [activePool?.id]);

  const loadEntryCount = async () => {
    if (!activePool?.id) return;
    
    try {
      const { count } = await supabase
        .from('pool_entries')
        .select('id', { count: 'exact' })
        .eq('pool_id', activePool.id);
      
      setTotalEntries(count || 0);
    } catch (error) {
      console.error('Error loading entry count:', error);
      setTotalEntries(0);
    }
  };

  if (!activePool || !activePool.has_buy_in) {
    return null;
  }

  const prizeCalculation = calculatePrizes(activePool, totalEntries);
  const currency = activePool?.entry_fee_currency || 'CAD';

  if (!activePool || !activePool.has_buy_in || prizeCalculation.prizes.length === 0 || totalEntries === 0) {
    return null;
  }

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Prize Pool - {activePool.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {prizeCalculation.prizes.map((prize) => (
            <div key={prize.place} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="text-lg font-semibold text-gray-700 mb-2">
                {getPlaceText(prize.place)}
              </div>
              <Badge variant="secondary" className="text-xl font-bold py-2 px-4">
                {formatPrize(prize.amount, currency)}
              </Badge>
              {prize.description && prize.description !== getPlaceText(prize.place) && (
                <p className="text-sm text-gray-600 mt-2">{prize.description}</p>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4 text-sm text-gray-600">
          Winners will be determined based on final ranking at the end of the season • Based on {totalEntries} current {totalEntries === 1 ? 'entry' : 'entries'}
        </div>
      </CardContent>
    </Card>
  );
};