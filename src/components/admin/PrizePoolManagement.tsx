import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, Trophy, Save, Plus, Trash2, AlertTriangle, Eye, EyeOff, X, CreditCard, CheckCircle2 } from 'lucide-react';
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
  const [confirmedEntries, setConfirmedEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPrizeTotal, setShowPrizeTotal] = useState(true);
  const [showPrizeAmounts, setShowPrizeAmounts] = useState(true);
  const [lemonsqueezyLoaded, setLemonsqueezyLoaded] = useState(false);
  
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
    
    // Load LemonSqueezy script
    if (!document.querySelector('script[src*="lemon.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://assets.lemonsqueezy.com/lemon.js';
      script.async = true;
      script.onload = () => setLemonsqueezyLoaded(true);
      document.head.appendChild(script);
    } else {
      setLemonsqueezyLoaded(true);
    }
  }, [activePool?.id]);

  const loadData = async () => {
    if (!activePool?.id) return;
    
    try {
      console.log('PrizePoolManagement: Loading data for pool', activePool.id);
      
      // Get number of entries and confirmed payments
      const { data: entriesData } = await supabase
        .from('pool_entries')
        .select('id, payment_confirmed')
        .eq('pool_id', activePool.id);
      
      const entryCount = entriesData?.length || 0;
      const confirmedCount = entriesData?.filter(entry => entry.payment_confirmed).length || 0;
      
      setTotalEntries(entryCount);
      setConfirmedEntries(confirmedCount);
      
      // Load visibility settings
      setShowPrizeTotal(activePool.show_prize_total ?? true);
      setShowPrizeAmounts(activePool.show_prize_amounts ?? true);
      
      // Load existing configuration from new prize_configuration field
      const existingConfig = activePool.prize_configuration;
      if (existingConfig && existingConfig.mode) {
        // Default admin fee to 5% of total expected if not set
        const defaultAdminFee = existingConfig.admin_fee || Math.round((entryCount * (activePool?.entry_fee_amount || 0)) * 0.05);
        setConfig({
          mode: existingConfig.mode || 'percentage',
          admin_fee: defaultAdminFee,
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
            admin_fee: Math.round((entryCount * (activePool?.entry_fee_amount || 0)) * 0.05),
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

  const getTotalExpected = () => {
    return totalEntries * (activePool?.entry_fee_amount || 0);
  };

  const getTotalCollected = () => {
    return confirmedEntries * (activePool?.entry_fee_amount || 0);
  };

  const getAvailablePrizePool = () => {
    const tipJarAmount = calculateTipJarAmount();
    return getTotalExpected() - config.admin_fee - tipJarAmount;
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

  const addPercentagePlace = () => {
    const currentPlaces = Object.keys(config.percentage_distribution).length;
    const newPlace = currentPlaces + 1;
    const placeKey = getPlaceKey(newPlace);
    
    setConfig({
      ...config,
      percentage_distribution: {
        ...config.percentage_distribution,
        [placeKey]: 0
      }
    });
  };

  const removePercentagePlace = (placeKey: string) => {
    if (Object.keys(config.percentage_distribution).length <= 3) {
      toast({
        title: "Cannot Remove",
        description: "At least three prize places must remain",
        variant: "destructive",
      });
      return;
    }
    
    const newDistribution = { ...config.percentage_distribution };
    delete newDistribution[placeKey as keyof typeof newDistribution];
    
    setConfig({
      ...config,
      percentage_distribution: newDistribution
    });
  };

  const getPlaceKey = (place: number): string => {
    const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
    return `${ordinals[place - 1] || `place_${place}`}_place_percentage`;
  };

  const getPlaceFromKey = (key: string): number => {
    if (key.startsWith('first_')) return 1;
    if (key.startsWith('second_')) return 2;
    if (key.startsWith('third_')) return 3;
    if (key.startsWith('fourth_')) return 4;
    if (key.startsWith('fifth_')) return 5;
    if (key.startsWith('sixth_')) return 6;
    if (key.startsWith('seventh_')) return 7;
    if (key.startsWith('eighth_')) return 8;
    if (key.startsWith('ninth_')) return 9;
    if (key.startsWith('tenth_')) return 10;
    return 1;
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

  const handleAdminFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setConfig({ ...config, admin_fee: 0 });
    } else {
      setConfig({ ...config, admin_fee: Number(value) || 0 });
    }
  };

  const handleCustomPrizeAmountChange = (id: string, value: string) => {
    const numericValue = value === '' ? 0 : (Number(value) || 0);
    updateCustomPrize(id, 'amount', numericValue);
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

  const calculateTipJarAmount = () => {
    const totalExpected = getTotalExpected();
    const tipPercentage = (activePool as any)?.tip_jar_percentage || 10;
    return Math.round((totalExpected * tipPercentage) / 100);
  };

  const handleTipJarPayment = () => {
    // Open LemonSqueezy store in new tab
    window.open('https://store.poolside-picks.com/buy/87195c18-1f73-4e1d-8ef7-2057c8c6c27d', '_blank');
  };

  const handleTipJarPercentageChange = async (newPercentage: number) => {
    if (!activePool) return;

    try {
      const success = await updatePool(activePool.id, {
        tip_jar_percentage: newPercentage
      } as any);

      if (success) {
        toast({
          title: "Success",
          description: "Tip jar percentage updated",
        });
      }
    } catch (error) {
      console.error('Error updating tip jar percentage:', error);
      toast({
        title: "Error",
        description: "Failed to update tip jar percentage",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading prize pool management...</div>;
  }

  const totalExpected = getTotalExpected();
  const totalCollected = getTotalCollected();
  const availablePool = getAvailablePrizePool();
  const currency = activePool?.entry_fee_currency || 'CAD';
  const percentageAmounts = calculatePercentageAmounts();
  const totalCustom = getTotalCustomPrizes();
  const totalPercentage = getTotalPercentage();
  const isOverBudget = config.mode === 'custom' && totalCustom > availablePool;
  const overBudgetAmount = isOverBudget ? totalCustom - availablePool : 0;
  const tipJarAmount = calculateTipJarAmount();
  const tipJarPercentage = (activePool as any)?.tip_jar_percentage || 10;
  const tipJarPaid = (activePool as any)?.tip_jar_paid || false;

  // Check if all entry fees are collected and draft is closed
  const allFeesCollected = totalExpected > 0 && totalExpected === totalCollected;
  const draftClosed = !activePool?.draft_open;
  const showPayNowNotification = allFeesCollected && draftClosed && tipJarPercentage > 0 && !tipJarPaid;

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
            Control whether participants can see prize information on the About page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <div className="font-medium">Show Prize Information to Participants</div>
              <div className="text-sm text-muted-foreground">
                {showPrizeAmounts 
                  ? 'Participants can see prize breakdowns' 
                  : 'Prize information is hidden from participants'
                }
              </div>
            </div>
            <Switch 
              checked={showPrizeAmounts}
              onCheckedChange={(checked) => updateVisibilitySetting('show_prize_amounts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Support the Platform (Tip Jar) */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💝 Support the Platform (Optional)
          </CardTitle>
          <CardDescription>
            Thank you for considering supporting Poolside Picks! This is completely optional and helps us maintain and improve the platform. 
            Any amount you choose makes a difference! 🙏
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Show glowing notification when ready to pay */}
            {showPayNowNotification && (
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg animate-pulse shadow-lg">
                <div className="flex items-center gap-2 text-yellow-800 font-medium">
                  ✨ All entry fees collected - pay support now!
                </div>
              </div>
            )}

            {/* Friendly Support Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tip_percentage">Support Percentage (Pay What You Want)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="tip_percentage"
                    type="number"
                    value={tipJarPercentage}
                    onChange={(e) => handleTipJarPercentageChange(Number(e.target.value) || 0)}
                    min="0"
                    max="50"
                    className="w-24"
                    placeholder="0"
                  />
                  <span className="text-sm text-muted-foreground">% of total expected</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose any percentage you're comfortable with. Every bit helps! 💚
                </p>
              </div>
              <div className="space-y-2">
                <Label>Support Amount</Label>
                <div className="text-2xl font-bold text-purple-600">
                  {currency} ${tipJarAmount}
                </div>
                {tipJarPercentage > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    🎉 Thank you for supporting the platform!
                  </p>
                )}
              </div>
            </div>

            {/* Payment Status and Action */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                {tipJarPaid ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <CreditCard className="h-6 w-6 text-purple-500" />
                )}
                <div>
                  <div className="font-medium">
                    {tipJarPaid ? '✨ Platform Support Paid - Thank You!' : 'Platform Support Payment'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tipJarPaid 
                      ? `Paid ${currency} $${tipJarAmount} on ${(activePool as any)?.tip_jar_paid_at ? new Date((activePool as any).tip_jar_paid_at).toLocaleDateString() : 'Unknown date'}`
                      : tipJarPercentage > 0 
                        ? `${tipJarPercentage}% of total expected (${currency} $${tipJarAmount}) - Pay after collecting entries`
                        : 'Set a percentage above to contribute to platform development'
                    }
                  </div>
                </div>
              </div>
              
              {!tipJarPaid && tipJarPercentage > 0 && (
                <a
                  href="https://store.poolside-picks.com/buy/87195c18-1f73-4e1d-8ef7-2057c8c6c27d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lemonsqueezy-button inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700"
                  style={{
                    display: totalEntries === 0 ? 'none' : 'inline-flex',
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Support Poolside Picks →
                </a>
              )}
            </div>

            {tipJarPercentage > 0 && totalEntries === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Platform support payment will be available once participants join the pool. 
                  Thank you for choosing to support us! 🙏
                </AlertDescription>
              </Alert>
            )}

            {tipJarPercentage === 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  💡 <strong>Supporting the platform is completely optional!</strong> Any amount helps us maintain and improve Poolside Picks for everyone. 
                  Even a small percentage makes a difference and is greatly appreciated!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-blue-600 font-medium">Total Entries</p>
            <p className="text-2xl font-bold text-blue-900">{totalEntries}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-green-600 font-medium">Entry Fees</p>
            <div className="text-lg font-bold text-green-900">
              <div>Expected: {currency} ${totalExpected}</div>
              <div className="text-sm">Collected: {currency} ${totalCollected}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-orange-600 font-medium">Admin Fee</p>
            <p className="text-2xl font-bold text-orange-900">{currency} ${config.admin_fee}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-purple-600 font-medium">Platform Support</p>
            <p className="text-2xl font-bold text-purple-900">{currency} ${tipJarAmount}</p>
          </CardContent>
        </Card>
        <Card className={`${isOverBudget ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <CardContent className="p-4 text-center">
            <p className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
              Prize Pool
            </p>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-900' : 'text-emerald-900'}`}>
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
            <strong>Over Budget:</strong> Prize pool exceeds available amount by {currency} ${overBudgetAmount}. 
            Admin will need to contribute the difference.
          </AlertDescription>
        </Alert>
      )}

      {/* Admin Fee Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Fee Configuration</CardTitle>
          <CardDescription>Your time has value. Set aside funds for pool administration costs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="admin_fee" className="font-medium">
              Admin Fee ({currency})
            </Label>
            <Input
              id="admin_fee"
              type="number"
              value={config.admin_fee === 0 ? '' : config.admin_fee.toString()}
              onChange={handleAdminFeeChange}
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
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Percentage Distribution</h4>
                <Button onClick={addPercentagePlace} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Place
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(config.percentage_distribution)
                  .sort(([keyA], [keyB]) => getPlaceFromKey(keyA) - getPlaceFromKey(keyB))
                  .map(([key, percentage]) => {
                  const placeNumber = getPlaceFromKey(key);
                  const amount = Math.round((availablePool * percentage) / 100);
                  
                  return (
                    <div key={key} className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getPlaceEmoji(placeNumber - 1)}</span>
                        <span className="font-medium">{getPlaceText(placeNumber)}</span>
                        {Object.keys(config.percentage_distribution).length > 3 && (
                          <Button
                            onClick={() => removePercentagePlace(key)}
                            size="sm"
                            variant="ghost"
                            className="ml-auto h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
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
                          value={prize.amount === 0 ? '' : prize.amount.toString()}
                          onChange={(e) => handleCustomPrizeAmountChange(prize.id, e.target.value)}
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
