import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Trophy, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';

interface PrizePool {
  id: string;
  place_number: number;
  prize_amount: number;
  currency: string;
  description?: string;
  is_active: boolean;
}

interface PoolSettings {
  entry_fee_amount: number;
  entry_fee_currency: string;
}

interface PrizeConfiguration {
  mode: 'percentage' | 'custom';
  admin_fee: number;
  percentage_distribution: {
    first_place_percentage: number;
    second_place_percentage: number;
    third_place_percentage: number;
  };
  custom_prizes: Array<{
    id: string;
    place: number;
    amount: number;
    description: string;
  }>;
}

export const PrizePoolDisplay: React.FC = () => {
  const { activePool } = usePool();
  const [prizePools, setPrizePools] = useState<PrizePool[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<PrizeConfiguration | null>(null);

  useEffect(() => {
    if (activePool?.id) {
      loadData();
    }
  }, [activePool?.id]);

  const loadData = async () => {
    if (!activePool?.id) return;
    
    try {
      const [prizeResult, entriesResult] = await Promise.all([
        supabase.from('prize_pools').select('*').eq('is_active', true).order('place_number'),
        supabase.from('pool_entries').select('id').eq('pool_id', activePool.id)
      ]);

      if (prizeResult.data) {
        setPrizePools(prizeResult.data);
      }

      setTotalEntries(entriesResult.data?.length || 0);
      
      // Load prize configuration from pool
      if (activePool.prize_distribution && activePool.prize_distribution.mode) {
        setConfig(activePool.prize_distribution);
      }
    } catch (error) {
      console.error('Error loading prize pool data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading prize information...</div>;
  }

  const totalExpected = activePool ? (totalEntries * activePool.entry_fee_amount) : 0;
  const adminFee = config?.admin_fee || 0;  
  const availablePool = totalExpected - adminFee;
  
  let totalPrizes = 0;
  let isOverBudget = false;
  
  if (config?.mode === 'custom') {
    totalPrizes = config.custom_prizes.reduce((sum, prize) => sum + prize.amount, 0);
    isOverBudget = totalPrizes > availablePool;
  } else {
    totalPrizes = prizePools.reduce((sum, prize) => sum + prize.prize_amount, 0);
  }
  
  const currency = activePool?.entry_fee_currency || 'CAD';

  const getOrdinalSuffix = (num: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  };

  return (
    <div className="space-y-6">
      {/* Prize Pool Overview */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <DollarSign className="h-6 w-6" />
            Prize Pool
          </CardTitle>
          <CardDescription className="text-green-100">
            Current prize structure for the Big Brother Fantasy Pool
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <Users className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <h4 className="font-semibold text-blue-800">Total Participants</h4>
              <p className="text-2xl font-bold text-blue-900">{totalEntries}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <DollarSign className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <h4 className="font-semibold text-green-800">Total Pool</h4>
              <p className="text-2xl font-bold text-green-900">
                {currency} ${Math.round(totalExpected)}
              </p>
            </div>
            <div className={`text-center p-4 rounded-lg border ${isOverBudget ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'}`}>
              <Trophy className={`h-6 w-6 mx-auto mb-2 ${isOverBudget ? 'text-red-600' : 'text-purple-600'}`} />
              <h4 className={`font-semibold ${isOverBudget ? 'text-red-800' : 'text-purple-800'}`}>
                Total Prizes {isOverBudget && '(Over Budget)'}
              </h4>
              <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-900' : 'text-purple-900'}`}>
                {currency} ${Math.round(totalPrizes)}
              </p>
              {isOverBudget && (
                <p className="text-xs text-red-600 mt-1">
                  Over by ${Math.round(totalPrizes - availablePool)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prize Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Prize Breakdown
          </CardTitle>
          <CardDescription>
            What each placing position will win at the end of the season
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prizePools.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Prize structure will be announced soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prizePools.map((prize, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;
                
                return (
                  <div 
                    key={prize.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      isFirst ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' :
                      isSecond ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300' :
                      isThird ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                        isFirst ? 'bg-yellow-500 text-white' :
                        isSecond ? 'bg-gray-500 text-white' :
                        isThird ? 'bg-orange-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {prize.place_number}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {prize.place_number}{getOrdinalSuffix(prize.place_number)} Place
                        </h3>
                        {prize.description && (
                          <p className="text-sm text-gray-600">{prize.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        isFirst ? 'text-yellow-700' :
                        isSecond ? 'text-gray-700' :
                        isThird ? 'text-orange-700' :
                        'text-blue-700'
                      }`}>
                        {currency} ${Math.round(prize.prize_amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {activePool && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Entry Fee</h3>
              <p className="text-3xl font-bold text-primary">
                {currency} ${Math.round(activePool.entry_fee_amount)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                per participant
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};