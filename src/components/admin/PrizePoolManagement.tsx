import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, Trophy, Save, Plus, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
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
    fourth_place_percentage: number;
    fifth_place_percentage: number;
  };
  custom_prizes: CustomPrize[];
}

export const PrizePoolManagement: React.FC = () => {
  const { activePool, updatePool } = usePool();
  const { toast } = useToast();
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPrizeTotal, setShowPrizeTotal] = useState(true);
  const [showPrizeAmounts, setShowPrizeAmounts] = useState(true);
  
  const [config, setConfig] = useState<PrizeConfiguration>({
    mode: 'percentage',
    admin_fee: 0,
    percentage_distribution: {
      first_place_percentage: 50,
      second_place_percentage: 30,
      third_place_percentage: 20,
      fourth_place_percentage: 0,
      fifth_place_percentage: 0,
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
      console.log('PrizePoolManagement: Loading data for pool', activePool.id);
      
      // Get number of entries
      const { data: entriesData } = await supabase
        .from('pool_entries')
        .select('id')
        .eq('pool_id', activePool.id);
      
      const entryCount = entriesData?.length || 0;
      setTotalEntries(entryCount);
      
      // Load visibility settings
      setShowPrizeTotal(activePool.show_prize_total ?? true);
      setShowPrizeAmounts(activePool.show_prize_amounts ?? true);
      
      // Load existing configuration from new prize_configuration field
      const existingConfig = activePool.prize_configuration;
      if (existingConfig && existingConfig.mode) {
        setConfig({
          mode: existingConfig.mode || 'percentage',
          admin_fee: existingConfig.admin_fee || 0,
          percentage_distribution: {
            first_place_percentage: existingConfig.percentage_distribution?.first_place_percentage || 50,
            second_place_percentage: existingConfig.percentage_distribution?.second_place_percentage || 30,
            third_place_percentage: existingConfig.percentage_distribution?.third_place_percentage || 20,
            fourth_place_percentage: existingConfig.percentage_distribution?.fourth_place_percentage || 0,
            fifth_place_percentage: existingConfig.percentage_distribution?.fifth_place_percentage || 0,
          },
          custom_prizes: existingConfig.custom_prizes || [
            { id: '1', place: 1, amount: 0, description: '1st Place' },
            { id: '2', place: 2, amount: 0, description: '2nd Place' },
            { id: '3', place: 3, amount: 0, description: '3rd Place' }
          ]
        });
      } else {
        // Try to migrate from old prize_distribution format
        const oldConfig = activePool.prize_distribution;
        if (oldConfig) {
          const migratedConfig = {
            mode: (activePool.prize_mode || 'percentage') as 'percentage' | 'custom',
            admin_fee: 0,
            percentage_distribution: {
              first_place_percentage: oldConfig.first_place_percentage || 50,
              second_place_percentage: oldConfig.second_place_percentage || 30,
              third_place_percentage: oldConfig.third_place_percentage || 20,
              fourth_place_percentage: 0,
              fifth_place_percentage: 0,
            },
            custom_prizes: [
              { id: '1', place: 1, amount: oldConfig.first_place_amount || 0, description: '1st Place' },
              { id: '2', place: 2, amount: oldConfig.second_place_amount || 0, description: '2nd Place' },
              { id: '3', place: 3, amount: oldConfig.third_place_amount || 0, description: '3rd Place' }
            ]
          };
          setConfig(migratedConfig);
          
          // Save migrated config to new field
          await updatePool(activePool.id, {
            prize_configuration: migratedConfig
          } as any);
        }
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
    const dist = config.percentage_distribution;
    return {
      first: Math.round((availablePool * dist.first_place_percentage) / 100),
      second: Math.round((availablePool * dist.second_place_percentage) / 100),
      third: Math.round((availablePool * dist.third_place_percentage) / 100),
      fourth: Math.round((availablePool * dist.fourth_place_percentage) / 100),
      fifth: Math.round((availablePool * dist.fifth_place_percentage) / 100),
    };
  };

  const getTotalCustomPrizes = () => {
    return config.custom_prizes.reduce((sum, prize) => sum + prize.amount, 0);
  };

  const getTotalPercentage = () => {
    const dist = config.percentage_distribution;
    return dist.first_place_percentage + dist.second_place_percentage + 
           dist.third_place_percentage + dist.fourth_place_percentage + dist.fifth_place_percentage;
  };

  const updatePercentage = (key: keyof typeof config.percentage_distribution, value: number) => {
    const newDistribution = { ...config.percentage_distribution, [key]: value };
    
    const totalPercentage = Object.values(newDistribution).reduce((sum, val) => sum + val, 0);
    
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
    const newPlace = Math.max(...config.custom_prizes.map(p => p.place), 0) + 1;
    const newPrize: CustomPrize = {
      id: Date.now().toString(),
      place: newPlace,
      amount: 0,
      description: getPlaceText(newPlace)
    };
    setConfig({ ...config, custom_prizes: [...config.custom_prizes, newPrize] });
  };

  const removeCustomPrize = (id: string) => {
    if (config.custom_prizes.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one prize must remain",
        variant: "destructive",
      });
      return;
    }
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

  const getPlaceText = (place: number): string => {
    if (place === 1) return '1st Place';
    if (place === 2) return '2nd Place';
    if (place === 3) return '3rd Place';
    if (place === 4) return '4th Place';
    if (place === 5) return '5th Place';
    return `${place}th Place`;
  };

  const getPlaceEmoji = (index: number): string => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const updateVisibilitySetting = async (field: string, value: boolean) => {
    if (!activePool) return;
    
    try {
      const success = await updatePool(activePool.id, {
        [field]: value
      } as any);
      
      if (success) {
        if (field === 'show_prize_total') setShowPrizeTotal(value);
        if (field === 'show_prize_amounts') setShowPrizeAmounts(value);
        
        toast({
          title: "Success",
          description: "Prize visibility setting updated",
        });
      }
    } catch (error) {
      console.error('Error updating visibility setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    }
  };

  const savePrizeConfiguration = async () => {
    if (!activePool) return;
    
    setSaving(true);
    try {
      const success = await updatePool(activePool.id, {
        prize_configuration: config,
        prize_mode: config.mode // Keep for backwards compatibility
      } as any);
      
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
  const totalPercentage = getTotalPercentage();
  const isOverBudget = config.mode === 'custom' && totalCustom > availablePool;
  const overBudgetAmount = isOverBudget ? totalCustom - availablePool : 0;

  return (
    <div className="space-y-6">
      {/* Prize Section Visibility Control */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {showPrizeAmounts ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            Prize Section Visibility
          </CardTitle>
          <CardDescription>
            Control whether participants can see prize amounts on the About page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <div className="font-medium">Show Total Prize Pool to Participants</div>
                <div className="text-sm text-muted-foreground">
                  {showPrizeTotal 
                    ? 'Participants can see the total prize pool amount' 
                    : 'Total prize pool amount is hidden from participants'
                  }
                </div>
              </div>
              <Switch 
                checked={showPrizeTotal}
                onCheckedChange={(checked) => updateVisibilitySetting('show_prize_total', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <div className="font-medium">Show Individual Prize Amounts</div>
                <div className="text-sm text-muted-foreground">
                  {showPrizeAmounts 
                    ? 'Participants can see individual prize breakdowns' 
                    : 'Prize breakdown is hidden from participants'
                  }
                </div>
              </div>
              <Switch 
                checked={showPrizeAmounts}
                onCheckedChange={(checked) => updateVisibilitySetting('show_prize_amounts', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
            <p className="text-2xl font-bold text-green-900">{currency} ${totalPot}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-orange-600 font-medium">Admin Fee</p>
            <p className="text-2xl font-bold text-orange-900">{currency} ${config.admin_fee}</p>
          </CardContent>
        </Card>
        <Card className={`${isOverBudget ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'}`}>
          <CardContent className="p-4 text-center">
            <p className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-purple-600'}`}>
              Prize Pool
            </p>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-900' : 'text-purple-900'}`}>
              {currency} ${config.mode === 'custom' ? totalCustom : availablePool}
            </p>
          </CardContent>
        </Card>
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

      {/* Admin Fee Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Fee Configuration</CardTitle>
          <CardDescription>Set aside funds for pool administration costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="admin_fee" className="font-medium">
              Admin Fee ({currency})
            </Label>
            <Input
              id="admin_fee"
              type="number"
              value={config.admin_fee}
              onChange={(e) => setConfig({ ...config, admin_fee: Number(e.target.value) || 0 })}
              placeholder="0"
              className="w-32"
              min="0"
            />
            <div className="text-sm text-muted-foreground">
              Available for prizes: {currency} ${availablePool}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prize Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Prize Distribution Mode</CardTitle>
          <CardDescription>Choose how prizes are calculated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setConfig({ ...config, mode: 'percentage' })}
              variant={config.mode === 'percentage' ? 'default' : 'outline'}
              className="h-auto py-4 px-6"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="font-medium">Percentage Based</div>
                <div className="text-xs text-muted-foreground">Auto-calculated from entries</div>
              </div>
            </Button>
            <Button
              onClick={() => setConfig({ ...config, mode: 'custom' })}
              variant={config.mode === 'custom' ? 'default' : 'outline'}
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
          {config.mode === 'percentage' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(config.percentage_distribution).map(([key, percentage], index) => {
                  if (percentage === 0 && index > 2) return null; // Hide zero percentages beyond first 3
                  
                  const placeNumber = index + 1;
                  const amount = percentageAmounts[key.replace('_percentage', '') as keyof typeof percentageAmounts];
                  
                  return (
                    <div key={key} className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getPlaceEmoji(index)}</span>
                        <span className="font-medium">{getPlaceText(placeNumber)}</span>
                      </div>
                      <div className="text-2xl font-bold text-primary mb-3">
                        {currency} ${amount}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={percentage}
                          onChange={(e) => updatePercentage(key as keyof typeof config.percentage_distribution, Number(e.target.value) || 0)}
                          className="w-20"
                          min="0"
                          max="100"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {totalPercentage !== 100 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Prize percentages total {totalPercentage}%. Consider adjusting to equal 100%.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Custom Prize Structure</h4>
                <Button onClick={addCustomPrize} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Prize
                </Button>
              </div>

              <div className="space-y-3">
                {config.custom_prizes
                  .sort((a, b) => a.place - b.place)
                  .map((prize, index) => (
                  <div key={prize.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="text-2xl">{getPlaceEmoji(index)}</div>
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
                          min="0"
                        />
                      </div>
                      <div className="flex items-end">
                        {config.custom_prizes.length > 1 && (
                          <Button
                            onClick={() => removeCustomPrize(prize.id)}
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
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
                <span>Total Allocated: {currency} ${totalCustom}</span>
                <span>Remaining: {currency} ${(availablePool - totalCustom)}</span>
              </div>
            </div>
          )}

          <Button 
            onClick={savePrizeConfiguration} 
            disabled={saving}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white mt-6"
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Prize Configuration'}
          </Button>
        </CardContent>
      </Card>

      {/* Information Section */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Prize Distribution Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div><strong>Current Mode:</strong> {config.mode === 'percentage' ? 'Percentage' : 'Custom'} distribution</div>
            {config.mode === 'percentage' ? (
              <>
                <p>• Prize amounts are calculated based on current number of entries ({totalEntries}) × entry fee (${activePool?.entry_fee_amount || 0})</p>
                <p>• Amounts will update automatically as more participants join</p>
              </>
            ) : (
              <>
                <p>• Prize amounts are fixed regardless of entry count</p>
                <p>• Total prize pool: {currency} ${totalCustom}</p>
                {isOverBudget && <p>• Admin must contribute {currency} ${overBudgetAmount} additional funds</p>}
              </>
            )}
            <p>• Prize section visibility: {showPrizeAmounts ? 'Visible to participants' : 'Hidden from participants'}</p>
            <p>• Total prize pool amount visibility: {showPrizeTotal ? 'Visible to participants' : 'Hidden from participants'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};