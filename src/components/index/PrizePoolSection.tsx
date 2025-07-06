import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';

export const PrizePoolSection: React.FC = () => {
  const { activePool } = usePool();

  if (!activePool || !activePool.has_buy_in) {
    return null;
  }

  const prizeConfig = activePool.prize_distribution;
  const currency = activePool.entry_fee_currency || 'CAD';
  
  // Calculate total entries - this would need to be passed as prop or fetched
  // For now, we'll use a placeholder
  const totalEntries = 10; // This should be passed as prop or fetched
  const totalPot = totalEntries * activePool.entry_fee_amount;
  const adminFee = prizeConfig?.admin_fee || 0;
  const availablePool = totalPot - adminFee;

  const getPrizes = () => {
    if (!prizeConfig) return [];
    
    if (prizeConfig.mode === 'custom' && prizeConfig.custom_prizes) {
      return prizeConfig.custom_prizes
        .sort((a, b) => a.place - b.place)
        .map(prize => ({
          place: prize.place,
          amount: prize.amount,
          description: prize.description
        }));
    } else if (prizeConfig.mode === 'percentage' && prizeConfig.percentage_distribution) {
      const percentages = prizeConfig.percentage_distribution;
      return [
        {
          place: 1,
          amount: Math.round((availablePool * percentages.first_place_percentage) / 100),
          description: '1st Place'
        },
        {
          place: 2,
          amount: Math.round((availablePool * percentages.second_place_percentage) / 100),
          description: '2nd Place'
        },
        {
          place: 3,
          amount: Math.round((availablePool * percentages.third_place_percentage) / 100),
          description: '3rd Place'
        }
      ].filter(prize => prize.amount > 0);
    }
    
    return [];
  };

  const prizes = getPrizes();

  if (prizes.length === 0) {
    return null;
  }

  const formatPrize = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getPlaceText = (place: number) => {
    if (place === 1) return '1st Place';
    if (place === 2) return '2nd Place';
    if (place === 3) return '3rd Place';
    return `${place}${place === 4 ? 'th' : place === 5 ? 'th' : 'th'} Place`;
  };

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
          {prizes.map((prize) => (
            <div key={prize.place} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="text-lg font-semibold text-gray-700 mb-2">
                {getPlaceText(prize.place)}
              </div>
              <Badge variant="secondary" className="text-xl font-bold py-2 px-4">
                {formatPrize(prize.amount)}
              </Badge>
              {prize.description && prize.description !== getPlaceText(prize.place) && (
                <p className="text-sm text-gray-600 mt-2">{prize.description}</p>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4 text-sm text-gray-600">
          Winners will be determined based on final ranking at the end of the season
        </div>
      </CardContent>
    </Card>
  );
};