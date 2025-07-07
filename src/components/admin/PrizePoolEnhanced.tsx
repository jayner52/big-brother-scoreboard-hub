import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, Trophy, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';

interface PrizeDistribution {
  mode: 'percentage' | 'custom';
  first_place_percentage: number;
  second_place_percentage: number;
  third_place_percentage: number;
  first_place_amount: number;
  second_place_amount: number;
  third_place_amount: number;
}

interface PrizeCardProps {
  emoji: string;
  place: string;
  amount: number;
  currency: string;
  children: React.ReactNode;
}

const PrizeCard: React.FC<PrizeCardProps> = ({ emoji, place, amount, currency, children }) => (
  <Card className="relative">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{emoji}</span>
        <span className="font-medium">{place}</span>
      </div>
      <div className="text-2xl font-bold text-primary mb-3">
        {currency} ${amount.toFixed(0)}
      </div>
      {children}
    </CardContent>
  </Card>
);

export const PrizePoolEnhanced: React.FC = () => {
  const { activePool, updatePool } = usePool();
  const { toast } = useToast();
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prizeMode, setPrizeMode] = useState<'percentage' | 'custom'>('percentage');
  const [percentages, setPercentages] = useState({
    first: 50,
    second: 30,
    third: 20
  });
  const [customAmounts, setCustomAmounts] = useState({
    first: 0,
    second: 0,
    third: 0
  });

  useEffect(() => {
    if (activePool?.id) {
      loadData();
    }
  }, [activePool?.id]);

  const loadData = async () => {
    if (!activePool?.id) return;
    
    try {
      console.log('PrizePoolEnhanced: Loading data for pool', activePool.id);
      
      // Get number of entries
      const { data: entriesData } = await supabase
        .from('pool_entries')
        .select('id')
        .eq('pool_id', activePool.id);
      
      const entryCount = entriesData?.length || 0;
      setTotalEntries(entryCount);
      
      // Load prize distribution from pool settings
      const poolDistribution = activePool.prize_distribution as PrizeDistribution || {
        mode: 'percentage',
        first_place_percentage: 50,
        second_place_percentage: 30,
        third_place_percentage: 20,
        first_place_amount: 0,
        second_place_amount: 0,
        third_place_amount: 0
      };
      
      setPrizeMode(poolDistribution.mode || 'percentage');
      setPercentages({
        first: poolDistribution.first_place_percentage || 50,
        second: poolDistribution.second_place_percentage || 30,
        third: poolDistribution.third_place_percentage || 20
      });
      setCustomAmounts({
        first: poolDistribution.first_place_amount || 0,
        second: poolDistribution.second_place_amount || 0,
        third: poolDistribution.third_place_amount || 0
      });
      
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

  // Calculate totals
  const totalCollected = totalEntries * (activePool?.entry_fee_amount || 0);
  const percentageBasedPool = totalCollected;
  const customTotal = customAmounts.first + customAmounts.second + customAmounts.third;
  const displayPrizePool = prizeMode === 'custom' ? customTotal : percentageBasedPool;
  const isOverBudget = prizeMode === 'custom' && customTotal > percentageBasedPool;
  const overBudgetAmount = isOverBudget ? customTotal - percentageBasedPool : 0;

  const updatePercentage = (key: string, value: number) => {
    setPercentages(prev => ({ ...prev, [key]: value }));
  };

  const updateCustomAmount = (key: string, value: number) => {
    setCustomAmounts(prev => ({ ...prev, [key]: value }));
  };

  const savePrizeConfiguration = async () => {
    if (!activePool) return;
    
    setSaving(true);
    try {
      const distribution: PrizeDistribution = {
        mode: prizeMode,
        first_place_percentage: percentages.first,
        second_place_percentage: percentages.second,
        third_place_percentage: percentages.third,
        first_place_amount: prizeMode === 'percentage' 
          ? Math.round(percentageBasedPool * percentages.first / 100)
          : customAmounts.first,
        second_place_amount: prizeMode === 'percentage'
          ? Math.round(percentageBasedPool * percentages.second / 100)
          : customAmounts.second,
        third_place_amount: prizeMode === 'percentage'
          ? Math.round(percentageBasedPool * percentages.third / 100)
          : customAmounts.third
      };

      const success = await updatePool(activePool.id, {
        prize_distribution: distribution,
        prize_mode: prizeMode
      } as any);
      
      if (success) {
        toast({
          title: "Success",
          description: "Prize configuration saved successfully",
        });
      } else {
        throw new Error('Failed to update pool');
      }
    } catch (error) {
      console.error('Error saving prize distribution:', error);
      toast({
        title: "Error",
        description: "Failed to save prize configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading prize pool management...</div>;
  }

  const currency = activePool?.entry_fee_currency || 'CAD';
  const totalPercentage = percentages.first + percentages.second + percentages.third;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-blue-600 font-medium">Total Entries</p>
            <p className="text-2xl font-bold text-blue-900">{totalEntries}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-green-600 font-medium">Total Collected</p>
            <p className="text-2xl font-bold text-green-900">{currency} ${totalCollected}</p>
          </CardContent>
        </Card>
        <Card className={`${isOverBudget ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'}`}>
          <CardContent className="p-4 text-center">
            <p className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-purple-600'}`}>
              Prize Pool
            </p>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-900' : 'text-purple-900'}`}>
              {currency} ${displayPrizePool}
            </p>
          </CardContent>
        </Card>
        {isOverBudget && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-amber-600 font-medium">Over Budget</p>
              <p className="text-2xl font-bold text-amber-900">{currency} ${overBudgetAmount}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Over Budget Warning */}
      {isOverBudget && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Over Budget:</strong> Prize pool exceeds collected amount by {currency} ${overBudgetAmount}. 
            Admin will need to contribute the difference.
          </AlertDescription>
        </Alert>
      )}

      {/* Prize Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Prize Distribution Mode</CardTitle>
          <CardDescription>Choose how prizes are calculated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setPrizeMode('percentage')}
              variant={prizeMode === 'percentage' ? 'default' : 'outline'}
              className="h-auto py-4 px-6"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="font-medium">Percentage Based</div>
                <div className="text-xs text-muted-foreground">Auto-calculated from entries</div>
              </div>
            </Button>
            <Button
              onClick={() => setPrizeMode('custom')}
              variant={prizeMode === 'custom' ? 'default' : 'outline'}
              className="h-auto py-4 px-6"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">💰</div>
                <div className="font-medium">Custom Amounts</div>
                <div className="text-xs text-muted-foreground">Fixed prize amounts</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prize Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Prize Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {prizeMode === 'percentage' ? (
              <>
                <PrizeCard
                  emoji="🥇"
                  place="1st Place"
                  amount={Math.round(percentageBasedPool * percentages.first / 100)}
                  currency={currency}
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={percentages.first}
                      onChange={(e) => updatePercentage('first', Number(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm">%</span>
                  </div>
                </PrizeCard>
                
                <PrizeCard
                  emoji="🥈"
                  place="2nd Place"
                  amount={Math.round(percentageBasedPool * percentages.second / 100)}
                  currency={currency}
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={percentages.second}
                      onChange={(e) => updatePercentage('second', Number(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm">%</span>
                  </div>
                </PrizeCard>
                
                <PrizeCard
                  emoji="🥉"
                  place="3rd Place"
                  amount={Math.round(percentageBasedPool * percentages.third / 100)}
                  currency={currency}
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={percentages.third}
                      onChange={(e) => updatePercentage('third', Number(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm">%</span>
                  </div>
                </PrizeCard>
              </>
            ) : (
              <>
                <PrizeCard
                  emoji="🥇"
                  place="1st Place"
                  amount={customAmounts.first}
                  currency={currency}
                >
                  <Input
                    type="number"
                    value={customAmounts.first}
                    onChange={(e) => updateCustomAmount('first', Number(e.target.value) || 0)}
                    className="w-full"
                    placeholder="Amount"
                    min="0"
                  />
                </PrizeCard>
                
                <PrizeCard
                  emoji="🥈"
                  place="2nd Place"
                  amount={customAmounts.second}
                  currency={currency}
                >
                  <Input
                    type="number"
                    value={customAmounts.second}
                    onChange={(e) => updateCustomAmount('second', Number(e.target.value) || 0)}
                    className="w-full"
                    placeholder="Amount"
                    min="0"
                  />
                </PrizeCard>
                
                <PrizeCard
                  emoji="🥉"
                  place="3rd Place"
                  amount={customAmounts.third}
                  currency={currency}
                >
                  <Input
                    type="number"
                    value={customAmounts.third}
                    onChange={(e) => updateCustomAmount('third', Number(e.target.value) || 0)}
                    className="w-full"
                    placeholder="Amount"
                    min="0"
                  />
                </PrizeCard>
              </>
            )}
          </div>

          {/* Validation Messages */}
          {prizeMode === 'percentage' && totalPercentage !== 100 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Prize percentages total {totalPercentage}%. Consider adjusting to equal 100%.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={savePrizeConfiguration} 
            disabled={saving}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Prize Configuration'}
          </Button>
        </CardContent>
      </Card>

      {/* Prize Visibility Controls */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Prize Display Settings</CardTitle>
          <CardDescription>Control what participants can see</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
              <div>
                <div className="font-medium">Show Total Prize Pool</div>
                <div className="text-sm text-muted-foreground">Participants can see total collected amount</div>
              </div>
              <input 
                type="checkbox"
                defaultChecked={activePool?.show_prize_total ?? true}
                onChange={async (e) => {
                  if (activePool) {
                    await updatePool(activePool.id, { show_prize_total: e.target.checked } as any);
                  }
                }}
                className="h-4 w-4"
              />
            </label>
            
            <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
              <div>
                <div className="font-medium">Show Prize Amounts</div>
                <div className="text-sm text-muted-foreground">Participants can see individual prize breakdowns</div>
              </div>
              <input 
                type="checkbox"
                defaultChecked={activePool?.show_prize_amounts ?? true}
                onChange={async (e) => {
                  if (activePool) {
                    await updatePool(activePool.id, { show_prize_amounts: e.target.checked } as any);
                  }
                }}
                className="h-4 w-4"
              />
            </label>
          </div>
          
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground space-y-2">
              <div><strong>Current Mode:</strong> {prizeMode === 'percentage' ? 'Percentage' : 'Custom'} distribution</div>
              {prizeMode === 'percentage' ? (
                <>
                  <p>• Prize amounts are calculated based on current number of entries ({totalEntries}) × entry fee (${activePool?.entry_fee_amount || 0})</p>
                  <p>• Amounts will update automatically as more participants join</p>
                </>
              ) : (
                <>
                  <p>• Prize amounts are fixed regardless of entry count</p>
                  <p>• Total prize pool: {currency} ${customTotal}</p>
                  {isOverBudget && <p>• Admin must contribute {currency} ${overBudgetAmount} additional funds</p>}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};