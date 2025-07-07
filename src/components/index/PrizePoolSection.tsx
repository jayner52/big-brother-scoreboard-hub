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

  // Don't show if no buy-in, no prizes configured, or no participants yet
  if (!activePool || !activePool.has_buy_in || prizeCalculation.prizes.length === 0 || totalEntries === 0) {
    return null;
  }

  // Dynamic grid layout based on number of prizes
  const getGridCols = (prizeCount: number) => {
    if (prizeCount === 1) return 'grid-cols-1 max-w-md mx-auto';
    if (prizeCount === 2) return 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto';
    if (prizeCount === 3) return 'grid-cols-1 md:grid-cols-3';
    if (prizeCount === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Prize Pool - {activePool.name}
        </CardTitle>
        {prizeCalculation.mode === 'percentage' && (
          <p className="text-sm text-muted-foreground">
            Percentage-based prizes calculated from entry fees
          </p>
        )}
        {prizeCalculation.mode === 'custom' && (
          <p className="text-sm text-muted-foreground">
            Fixed prize amounts
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${getGridCols(prizeCalculation.prizes.length)}`}>
          {prizeCalculation.prizes.map((prize, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;
            
            return (
              <div 
                key={prize.place} 
                className={`text-center p-4 rounded-lg border-2 ${
                  isFirst ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300' :
                  isSecond ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300' :
                  isThird ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300' :
                  'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300'
                }`}
              >
                <div className={`text-lg font-semibold mb-2 ${
                  isFirst ? 'text-yellow-700' :
                  isSecond ? 'text-gray-700' :
                  isThird ? 'text-orange-700' :
                  'text-blue-700'
                }`}>
                  {getPlaceText(prize.place)}
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-xl font-bold py-2 px-4 ${
                    isFirst ? 'bg-yellow-200 text-yellow-800' :
                    isSecond ? 'bg-gray-200 text-gray-800' :
                    isThird ? 'bg-orange-200 text-orange-800' :
                    'bg-blue-200 text-blue-800'
                  }`}
                >
                  {formatPrize(prize.amount, currency)}
                </Badge>
                {prize.description && prize.description !== getPlaceText(prize.place) && (
                  <p className="text-sm text-muted-foreground mt-2">{prize.description}</p>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Winners determined by final ranking at season end • Based on {totalEntries} current {totalEntries === 1 ? 'entry' : 'entries'}
        </div>
      </CardContent>
    </Card>
  );
};