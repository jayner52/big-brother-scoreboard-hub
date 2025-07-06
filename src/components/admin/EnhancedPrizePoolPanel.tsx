import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Trophy, Save, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';

interface CustomPrize {
  id: string;
  place: number;
  amount: number;
  description: string;
}

interface PrizeConfiguration {
  mode: 'percentage' | 'custom';
  admin_fee: number;
  percentage_distribution: {
    first_place_percentage: number;
    second_place_percentage: number;
    third_place_percentage: number;
  };
  custom_prizes: CustomPrize[];
}

export const EnhancedPrizePoolPanel: React.FC = () => {
  const { activePool, updatePool } = usePool();
  const { toast } = useToast();
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<PrizeConfiguration>({
    mode: 'percentage',
    admin_fee: 0,
    percentage_distribution: {
      first_place_percentage: 50,
      second_place_percentage: 30,
      third_place_percentage: 20,
    },
    custom_prizes: [
      { id: '1', place: 1, amount: 0, description: '1st Place' },
      { id: '2', place: 2, amount: 0, description: '2nd Place' },
      { id: '3', place: 3, amount: 0, description: '3rd Place' }
    ]
  });

  useEffect(() => {
    if (activePool?.id) {
      loadData();
    }
  }, [activePool?.id]);

  const loadData = async () => {
    if (!activePool?.id) return;
    
    try {
      // Get number of entries
      const { data: entriesData } = await supabase
        .from('pool_entries')
        .select('id')
        .eq('pool_id', activePool.id);
      
      const entryCount = entriesData?.length || 0;
      setTotalEntries(entryCount);
      
      // Load existing configuration from pool
      const existingConfig = activePool.prize_distribution;
      if (existingConfig && existingConfig.mode) {
        setConfig({
          mode: existingConfig.mode || 'percentage',
          admin_fee: existingConfig.admin_fee || 0,
          percentage_distribution: existingConfig.percentage_distribution || {
            first_place_percentage: 50,
            second_place_percentage: 30,
            third_place_percentage: 20,
          },
          custom_prizes: existingConfig.custom_prizes || [
            { id: '1', place: 1, amount: 0, description: '1st Place' },
            { id: '2', place: 2, amount: 0, description: '2nd Place' },
            { id: '3', place: 3, amount: 0, description: '3rd Place' }
          ]
        });
      }
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

  const getTotalPot = () => {
    return totalEntries * (activePool?.entry_fee_amount || 0);
  };

  const getAvailablePrizePool = () => {
    return getTotalPot() - config.admin_fee;
  };

  const calculatePercentageAmounts = () => {
    const availablePool = getAvailablePrizePool();
    return {
      first: Math.round((availablePool * config.percentage_distribution.first_place_percentage) / 100),
      second: Math.round((availablePool * config.percentage_distribution.second_place_percentage) / 100),
      third: Math.round((availablePool * config.percentage_distribution.third_place_percentage) / 100)
    };
  };

  const getTotalCustomPrizes = () => {
    return config.custom_prizes.reduce((sum, prize) => sum + prize.amount, 0);
  };

  const updatePercentage = (key: keyof typeof config.percentage_distribution, value: number) => {
    const newDistribution = { ...config.percentage_distribution, [key]: value };
    
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
    
    setConfig({ ...config, percentage_distribution: newDistribution });
  };

  const addCustomPrize = () => {
    const newPlace = config.custom_prizes.length + 1;
    const newPrize: CustomPrize = {
      id: Date.now().toString(),
      place: newPlace,
      amount: 0,
      description: `${newPlace}${newPlace === 1 ? 'st' : newPlace === 2 ? 'nd' : newPlace === 3 ? 'rd' : 'th'} Place`
    };
    setConfig({ ...config, custom_prizes: [...config.custom_prizes, newPrize] });
  };

  const removeCustomPrize = (id: string) => {
    setConfig({ 
      ...config, 
      custom_prizes: config.custom_prizes.filter(p => p.id !== id)
    });
  };

  const updateCustomPrize = (id: string, field: keyof CustomPrize, value: any) => {
    setConfig({
      ...config,
      custom_prizes: config.custom_prizes.map(prize =>
        prize.id === id ? { ...prize, [field]: value } : prize
      )
    });
  };

  const savePrizeConfiguration = async () => {
    if (!activePool) return;
    
    setSaving(true);
    try {
      const success = await updatePool(activePool.id, {
        prize_distribution: config
      });
      
      if (success) {
        toast({
          title: "Success",
          description: "Prize pool configuration updated successfully",
        });
      } else {
        throw new Error('Failed to update pool');
      }
    } catch (error) {
      console.error('Error saving prize configuration:', error);
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

  const totalPot = getTotalPot();
  const availablePool = getAvailablePrizePool();
  const currency = activePool?.entry_fee_currency || 'CAD';
  const percentageAmounts = calculatePercentageAmounts();
  const totalCustom = getTotalCustomPrizes();
  const totalPercentage = config.percentage_distribution.first_place_percentage + 
                         config.percentage_distribution.second_place_percentage + 
                         config.percentage_distribution.third_place_percentage;

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
              <h4 className="font-semibold text-green-800">Total Collected</h4>
              <p className="text-2xl font-bold text-green-900">
                {currency} ${totalPot.toFixed(0)}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-800">Admin Fee</h4>
              <p className="text-2xl font-bold text-orange-900">
                {currency} ${config.admin_fee.toFixed(0)}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800">Prize Pool</h4>
              <p className="text-2xl font-bold text-purple-900">
                {currency} ${availablePool.toFixed(0)}
              </p>
            </div>
          </div>
          
          {/* Admin Fee Configuration */}
          <div className="mb-6 p-4 border rounded-lg bg-orange-50">
            <Label htmlFor="admin_fee" className="text-base font-medium mb-2 block">
              Admin Fee (${currency})
            </Label>
            <Input
              id="admin_fee"
              type="number"
              value={config.admin_fee}
              onChange={(e) => setConfig({ ...config, admin_fee: Number(e.target.value) || 0 })}
              placeholder="0"
              className="w-32"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Amount deducted from total pot for pool administration
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Prize Configuration Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Prize Configuration for {activePool?.name}
          </CardTitle>
          <CardDescription>
            Choose how prizes are calculated and distributed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="flex items-center space-x-4">
            <Label>Prize Mode:</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={config.mode === 'custom'}
                onCheckedChange={(checked) => setConfig({ ...config, mode: checked ? 'custom' : 'percentage' })}
              />
              <Label>
                {config.mode === 'percentage' ? 'Percentage-based' : 'Custom amounts'}
              </Label>
            </div>
          </div>

          {/* Percentage Mode */}
          {config.mode === 'percentage' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🥇</span>
                    <h4 className="font-semibold">1st Place</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    {currency} ${percentageAmounts.first.toFixed(0)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={config.percentage_distribution.first_place_percentage}
                      onChange={(e) => updatePercentage('first_place_percentage', Number(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🥈</span>
                    <h4 className="font-semibold">2nd Place</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    {currency} ${percentageAmounts.second.toFixed(0)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={config.percentage_distribution.second_place_percentage}
                      onChange={(e) => updatePercentage('second_place_percentage', Number(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🥉</span>
                    <h4 className="font-semibold">3rd Place</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    {currency} ${percentageAmounts.third.toFixed(0)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={config.percentage_distribution.third_place_percentage}
                      onChange={(e) => updatePercentage('third_place_percentage', Number(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>

              {totalPercentage !== 100 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800">
                    ⚠️ Prize percentages total {totalPercentage}%. Consider adjusting to equal 100%.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Custom Mode */}
          {config.mode === 'custom' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Custom Prize Structure</h4>
                <Button onClick={addCustomPrize} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Prize
                </Button>
              </div>

              <div className="space-y-3">
                {config.custom_prizes.map((prize, index) => (
                  <div key={prize.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}${index + 1 === 1 ? 'st' : index + 1 === 2 ? 'nd' : index + 1 === 3 ? 'rd' : 'th'}`}
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={prize.description}
                          onChange={(e) => updateCustomPrize(prize.id, 'description', e.target.value)}
                          placeholder="Prize description"
                        />
                      </div>
                      <div>
                        <Label>Amount ({currency})</Label>
                        <Input
                          type="number"
                          value={prize.amount}
                          onChange={(e) => updateCustomPrize(prize.id, 'amount', Number(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-end">
                        {config.custom_prizes.length > 1 && (
                          <Button
                            onClick={() => removeCustomPrize(prize.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm">
                <span>Total Allocated: {currency} ${totalCustom.toFixed(0)}</span>
                <span>Remaining: {currency} ${(availablePool - totalCustom).toFixed(0)}</span>
              </div>

              {totalCustom > availablePool && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">
                    ⚠️ Total prizes ({currency} ${totalCustom}) exceed available pool ({currency} ${availablePool}).
                  </p>
                </div>
              )}
            </div>
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

      {/* Information */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Prize amounts are calculated based on current number of entries ({totalEntries}) × entry fee (${activePool?.entry_fee_amount || 0})</p>
            <p>• Amounts will update automatically as more participants join</p>
            <p>• Admin fee is deducted from the total pot before prize distribution</p>
            <p>• This configuration is specific to this pool only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};