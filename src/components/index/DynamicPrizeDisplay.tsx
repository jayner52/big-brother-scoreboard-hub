import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, DollarSign } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';
import { calculatePrizes, formatPrize, getPlaceText } from '@/utils/prizeCalculation';

interface PrizeInfo {
  place: number;
  amount: number;
  description: string;
}

export const DynamicPrizeDisplay: React.FC = () => {
  const { activePool } = usePool();
  const [totalEntries, setTotalEntries] = useState(0);

  useEffect(() => {
    if (activePool?.id) {
      loadPrizeData();
    }
  }, [activePool?.id]);

  const loadPrizeData = async () => {
    if (!activePool?.id) return;
    
    try {
      // Get entry count
      const { count } = await supabase
        .from('pool_entries')
        .select('id', { count: 'exact' })
        .eq('pool_id', activePool.id);
      
      const entryCount = count || 0;
      setTotalEntries(entryCount);
    } catch (error) {
      console.error('Error loading prize data:', error);
    }
  };

  const prizeCalculation = calculatePrizes(activePool, totalEntries);
  const currency = activePool?.entry_fee_currency || 'CAD';

  if (!activePool || !activePool.has_buy_in || prizeCalculation.prizes.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="text-center py-8">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
          <h3 className="text-xl font-semibold mb-2">Play for Glory!</h3>
          <p className="text-muted-foreground">
            This pool is free to play - compete for bragging rights and the ultimate Big Brother fantasy crown!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Live Prize Pool - {activePool.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Pool Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{totalEntries}</div>
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{formatPrize(activePool.entry_fee_amount, currency)}</div>
              <div className="text-sm text-muted-foreground">Entry Fee</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{formatPrize(prizeCalculation.totalPrizePool, currency)}</div>
              <div className="text-sm text-muted-foreground">Total Pool</div>
            </div>
          </div>

          {/* Prize Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prizeCalculation.prizes.map((prize) => (
              <div 
                key={prize.place} 
                className="text-center p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg border border-yellow-300"
              >
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  {getPlaceText(prize.place)}
                </div>
                <Badge variant="secondary" className="text-xl font-bold py-2 px-4 mb-2">
                  {formatPrize(prize.amount, currency)}
                </Badge>
                <p className="text-sm text-gray-600">
                  {prize.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 p-4 bg-white/40 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              🏆 Winners determined by final season ranking • Prize pool updates with each new participant
            </p>
            <p className="text-xs text-muted-foreground">
              Based on {totalEntries} current {totalEntries === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};