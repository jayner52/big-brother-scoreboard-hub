import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PrizePool {
  id: string;
  place_number: number;
  prize_amount: number;
  currency: string;
  description?: string;
}

export const PrizePoolInAbout: React.FC = () => {
  const [prizes, setPrizes] = useState<PrizePool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    try {
      const { data, error } = await supabase
        .from('prize_pools')
        .select('*')
        .eq('is_active', true)
        .order('place_number');

      if (error) throw error;
      setPrizes(data || []);
    } catch (error) {
      console.error('Error loading prizes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading prizes...</div>;
  }

  if (prizes.length === 0) {
    return null;
  }

  const formatPrize = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getPlaceText = (place: number) => {
    if (place === 1) return '1st Place';
    if (place === 2) return '2nd Place';
    if (place === 3) return '3rd Place';
    return `${place}th Place`;
  };

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Prize Pool
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {prizes.map((prize) => (
            <div key={prize.id} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="text-lg font-semibold text-gray-700 mb-2">
                {getPlaceText(prize.place_number)}
              </div>
              <Badge variant="secondary" className="text-xl font-bold py-2 px-4">
                {formatPrize(prize.prize_amount, prize.currency)}
              </Badge>
              {prize.description && (
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