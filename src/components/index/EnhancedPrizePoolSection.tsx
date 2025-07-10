import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, AlertCircle } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';
import { calculatePrizes, formatPrize, getPlaceText } from '@/utils/prizeCalculation';

export const EnhancedPrizePoolSection: React.FC = () => {
  const { activePool } = usePool();
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (activePool?.id) {
      loadEntryCount();
    } else {
      setLoading(false);
    }
  }, [activePool?.id]);

  const loadEntryCount = async () => {
    if (!activePool?.id) return;
    
    console.log('🏆 PrizePool Debug - Loading entry count for pool:', activePool.id);
    
    try {
      const { count, error } = await supabase
        .from('pool_entries')
        .select('id', { count: 'exact' })
        .eq('pool_id', activePool.id);
      
      if (error) {
        console.error('❌ PrizePool Debug - Error loading entries:', error);
        setTotalEntries(0);
      } else {
        console.log('✅ PrizePool Debug - Entry count loaded:', count);
        setTotalEntries(count || 0);
      }
    } catch (error) {
      console.error('❌ PrizePool Debug - Exception loading entries:', error);
      setTotalEntries(0);
    } finally {
      setLoading(false);
    }
  };

  // Debug logging
  useEffect(() => {
    if (activePool && !loading) {
      const prizeCalculation = calculatePrizes(activePool, totalEntries);
      console.log('🏆 PrizePool Debug - Full calculation:', {
        activePool: {
          id: activePool.id,
          name: activePool.name,
          has_buy_in: activePool.has_buy_in,
          entry_fee_amount: activePool.entry_fee_amount,
          entry_fee_currency: activePool.entry_fee_currency,
          prize_distribution: activePool.prize_distribution
        },
        totalEntries,
        prizeCalculation
      });
      
      setDebugInfo({
        activePool: !!activePool,
        hasBuyIn: activePool.has_buy_in,
        totalEntries,
        prizesLength: prizeCalculation.prizes.length,
        calculation: prizeCalculation
      });
    }
  }, [activePool, totalEntries, loading]);

  if (loading) {
    return (
      <Card className="mb-12">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <span className="ml-3 text-muted-foreground">Loading prize pool...</span>
        </CardContent>
      </Card>
    );
  }

  // Early return checks with detailed logging
  if (!activePool) {
    console.log('❌ PrizePool Debug - No active pool');
    return null;
  }

  if (!activePool.has_buy_in) {
    console.log('❌ PrizePool Debug - Pool has no buy-in');
    return null;
  }

  const prizeCalculation = calculatePrizes(activePool, totalEntries);
  const currency = activePool?.entry_fee_currency || 'CAD';

  console.log('🏆 PrizePool Debug - Final render decision:', {
    hasBuyIn: activePool.has_buy_in,
    prizesCount: prizeCalculation.prizes.length,
    totalEntries,
    showComponent: activePool.has_buy_in && prizeCalculation.prizes.length > 0 && totalEntries > 0
  });

  // Show message if no entries yet
  if (totalEntries === 0) {
    return (
      <Card className="mb-12 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Prize Pool - {activePool.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Prize Pool Building...
          </h3>
          <p className="text-yellow-700">
            The prize pool will be calculated once participants join the pool.
          </p>
          {activePool.has_buy_in && (
            <p className="text-sm text-yellow-600 mt-2">
              Entry Fee: {formatPrize(activePool.entry_fee_amount, currency)} per person
            </p>
          )}
        </div>
        </CardContent>
      </Card>
    );
  }

  // Show message if no prizes configured
  if (prizeCalculation.prizes.length === 0) {
    return (
      <Card className="mb-12 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trophy className="h-6 w-6 text-orange-600" />
            Prize Pool - {activePool.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-orange-800 mb-2">
              Prize Distribution Not Set
            </h3>
            <p className="text-orange-700 mb-2">
              The pool administrator needs to configure prize distribution.
            </p>
            <p className="text-sm text-orange-600">
              Total collected: {formatPrize(prizeCalculation.totalPrizePool, currency)} from {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
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
    <Card className="mb-12 border-yellow-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-600" />
          Prize Pool - {activePool.name}
        </CardTitle>
        {prizeCalculation.mode === 'percentage' && (
          <p className="text-sm text-muted-foreground">
            Percentage-based prizes calculated from {totalEntries} entry fees
          </p>
        )}
        {prizeCalculation.mode === 'custom' && (
          <p className="text-sm text-muted-foreground">
            Fixed prize amounts for {totalEntries} participants
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <div className={`grid gap-4 ${getGridCols(prizeCalculation.prizes.length)}`}>
          {prizeCalculation.prizes.map((prize, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;
            
            return (
              <div 
                key={prize.place} 
                className={`text-center p-6 rounded-xl border-2 shadow-md hover:shadow-lg transition-all duration-300 ${
                  isFirst ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300' :
                  isSecond ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300' :
                  isThird ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300' :
                  'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300'
                }`}
              >
                <div className={`text-lg font-semibold mb-3 ${
                  isFirst ? 'text-yellow-700' :
                  isSecond ? 'text-gray-700' :
                  isThird ? 'text-orange-700' :
                  'text-blue-700'
                }`}>
                  {getPlaceText(prize.place)}
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-2xl font-bold py-3 px-6 ${
                    isFirst ? 'bg-yellow-200 text-yellow-800' :
                    isSecond ? 'bg-gray-200 text-gray-800' :
                    isThird ? 'bg-orange-200 text-orange-800' :
                    'bg-blue-200 text-blue-800'
                  }`}
                >
                  {formatPrize(prize.amount, currency)}
                </Badge>
                {prize.description && prize.description !== getPlaceText(prize.place) && (
                  <p className="text-sm text-muted-foreground mt-3">{prize.description}</p>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-medium">
              Winners determined by final ranking at season end
            </p>
            <p className="mt-1">
              Based on {totalEntries} current {totalEntries === 1 ? 'entry' : 'entries'} • 
              Total Prize Pool: {formatPrize(prizeCalculation.totalPrizePool, currency)}
            </p>
            {prizeCalculation.totalPrizePool !== prizeCalculation.availablePrizePool && (
              <p className="text-xs mt-1">
                Available after fees: {formatPrize(prizeCalculation.availablePrizePool, currency)}
              </p>
            )}
          </div>
        </div>

        {/* Debug Info - Only show in development */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <details className="mt-4">
            <summary className="text-xs text-muted-foreground cursor-pointer">Debug Info</summary>
            <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};