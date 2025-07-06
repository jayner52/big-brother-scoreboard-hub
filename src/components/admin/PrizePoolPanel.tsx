import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Trophy, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';

interface PrizeDistribution {
  first_place_percentage: number;
  second_place_percentage: number;
  third_place_percentage: number;
  first_place_amount: number;
  second_place_amount: number;
  third_place_amount: number;
}

export const PrizePoolPanel: React.FC = () => {
  const { activePool, updatePool } = usePool();
  const { toast } = useToast();
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [distribution, setDistribution] = useState<PrizeDistribution>({
    first_place_percentage: 50,
    second_place_percentage: 30,
    third_place_percentage: 20,
    first_place_amount: 0,
    second_place_amount: 0,
    third_place_amount: 0
  });

  useEffect(() => {
    if (activePool?.id) {
      loadData();
    }
  }, [activePool?.id]);

  const loadData = async () => {
    if (!activePool?.id) return;
    
    try {
      console.log('PrizePoolPanel: Loading data for pool', activePool.id);
      
      // Get number of entries
      const { data: entriesData } = await supabase
        .from('pool_entries')
        .select('id')
        .eq('pool_id', activePool.id);
      
      const entryCount = entriesData?.length || 0;
      setTotalEntries(entryCount);
      
      // Load prize distribution from pool settings
      const poolDistribution = activePool.prize_distribution || {
        first_place_percentage: 50,
        second_place_percentage: 30,
        third_place_percentage: 20,
        first_place_amount: 0,
        second_place_amount: 0,
        third_place_amount: 0
      };
      
      // Calculate total pot and amounts
      const totalPot = entryCount * (activePool.entry_fee_amount || 0);
      const updatedDistribution = {
        ...poolDistribution,
        first_place_amount: Math.round((totalPot * poolDistribution.first_place_percentage) / 100),
        second_place_amount: Math.round((totalPot * poolDistribution.second_place_percentage) / 100),
        third_place_amount: Math.round((totalPot * poolDistribution.third_place_percentage) / 100)
      };
      
      setDistribution(updatedDistribution);
    } catch (error) {
      console.error('Error loading prize pool data:', error);
      toast({
        title: "Error",
        description: "Failed to load prize pool data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePercentage = (key: string, value: number) => {
    const newDistribution = { ...distribution, [key]: value };
    
    // Ensure percentages add up to 100
    const totalPercentage = newDistribution.first_place_percentage + 
                           newDistribution.second_place_percentage + 
                           newDistribution.third_place_percentage;
    
    if (totalPercentage > 100) {
      toast({
        title: "Invalid Distribution",
        description: "Percentages cannot exceed 100%",
        variant: "destructive",
      });
      return;
    }
    
    // Recalculate amounts
    const totalPot = totalEntries * (activePool?.entry_fee_amount || 0);
    newDistribution.first_place_amount = Math.round((totalPot * newDistribution.first_place_percentage) / 100);
    newDistribution.second_place_amount = Math.round((totalPot * newDistribution.second_place_percentage) / 100);
    newDistribution.third_place_amount = Math.round((totalPot * newDistribution.third_place_percentage) / 100);
    
    setDistribution(newDistribution);
  };

  const savePrizeDistribution = async () => {
    if (!activePool) return;
    
    setSaving(true);
    try {
      const success = await updatePool(activePool.id, {
        prize_distribution: distribution
      });
      
      if (success) {
        toast({
          title: "Success",
          description: "Prize distribution updated successfully",
        });
      } else {
        throw new Error('Failed to update pool');
      }
    } catch (error) {
      console.error('Error saving prize distribution:', error);
      toast({
        title: "Error",
        description: "Failed to save prize distribution",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading prize pool management...</div>;
  }

  const totalPot = totalEntries * (activePool?.entry_fee_amount || 0);
  const totalAllocated = distribution.first_place_amount + distribution.second_place_amount + distribution.third_place_amount;
  const currency = activePool?.entry_fee_currency || 'CAD';
  const totalPercentage = distribution.first_place_percentage + distribution.second_place_percentage + distribution.third_place_percentage;

  return (
    <div className="p-6 space-y-6">
      {/* Prize Pool Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Total Entries</h4>
              <p className="text-2xl font-bold text-blue-900">{totalEntries}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Total Prize Pool</h4>
              <p className="text-2xl font-bold text-green-900">
                {currency} ${totalPot.toFixed(0)}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800">Allocated</h4>
              <p className="text-2xl font-bold text-purple-900">
                {currency} ${totalAllocated.toFixed(0)}
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800">Remaining</h4>
              <p className="text-2xl font-bold text-yellow-900">
                {currency} ${(totalPot - totalAllocated).toFixed(0)}
              </p>
            </div>
          </div>
          
          {totalPercentage !== 100 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800">
                ⚠️ Prize percentages total {totalPercentage}%. Consider adjusting to equal 100%.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prize Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Prize Distribution for {activePool?.name}
          </CardTitle>
          <CardDescription>
            Configure how the prize pool is distributed among winners
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* First Place */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🥇</div>
              <div>
                <h4 className="font-semibold">1st Place</h4>
                <p className="text-2xl font-bold text-green-600">
                  {currency} ${distribution.first_place_amount.toFixed(0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={distribution.first_place_percentage}
                onChange={(e) => updatePercentage('first_place_percentage', Number(e.target.value) || 0)}
                className="w-20"
                min="0"
                max="100"
              />
              <span>%</span>
            </div>
          </div>

          {/* Second Place */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🥈</div>
              <div>
                <h4 className="font-semibold">2nd Place</h4>
                <p className="text-2xl font-bold text-green-600">
                  {currency} ${distribution.second_place_amount.toFixed(0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={distribution.second_place_percentage}
                onChange={(e) => updatePercentage('second_place_percentage', Number(e.target.value) || 0)}
                className="w-20"
                min="0"
                max="100"
              />
              <span>%</span>
            </div>
          </div>

          {/* Third Place */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🥉</div>
              <div>
                <h4 className="font-semibold">3rd Place</h4>
                <p className="text-2xl font-bold text-green-600">
                  {currency} ${distribution.third_place_amount.toFixed(0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={distribution.third_place_percentage}
                onChange={(e) => updatePercentage('third_place_percentage', Number(e.target.value) || 0)}
                className="w-20"
                min="0"
                max="100"
              />
              <span>%</span>
            </div>
          </div>

          <Button 
            onClick={savePrizeDistribution} 
            disabled={saving}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Prize Distribution'}
          </Button>
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Prize amounts are calculated based on current number of entries ({totalEntries}) × entry fee (${activePool?.entry_fee_amount || 0})</p>
            <p>• Amounts will update automatically as more participants join</p>
            <p>• This distribution is specific to this pool only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};