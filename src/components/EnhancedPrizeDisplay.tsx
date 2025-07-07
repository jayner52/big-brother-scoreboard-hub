import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Trophy, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';
import { calculatePrizes, formatPrize, getPlaceText } from '@/utils/prizeCalculation';
import { useToast } from '@/hooks/use-toast';

interface EnhancedPrizeDisplayProps {
  isAdmin?: boolean;
}

export const EnhancedPrizeDisplay: React.FC<EnhancedPrizeDisplayProps> = ({ isAdmin = false }) => {
  const { activePool, updatePool } = usePool();
  const { toast } = useToast();
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPrizeTotal, setShowPrizeTotal] = useState(true);
  const [showPrizeAmounts, setShowPrizeAmounts] = useState(true);

  useEffect(() => {
    if (activePool?.id) {
      loadData();
    }
  }, [activePool?.id]);

  const loadData = async () => {
    if (!activePool?.id) return;
    
    try {
      console.log('🎯 Enhanced Prize Display - Loading data for pool:', activePool.id);
      
      // Get number of entries
      const { data: entriesData } = await supabase
        .from('pool_entries')
        .select('id')
        .eq('pool_id', activePool.id);

      const entryCount = entriesData?.length || 0;
      setTotalEntries(entryCount);
      
      // Load visibility settings from pool
      setShowPrizeTotal(activePool.show_prize_total ?? true);
      setShowPrizeAmounts(activePool.show_prize_amounts ?? true);
      
      console.log('📊 Enhanced Prize Display - Entries:', entryCount, 'Visibility:', { 
        showTotal: activePool.show_prize_total, 
        showAmounts: activePool.show_prize_amounts,
        prizeMode: activePool.prize_mode
      });
      
    } catch (error) {
      console.error('Error loading enhanced prize display data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVisibilitySetting = async (field: string, value: boolean) => {
    if (!activePool || !isAdmin) return;
    
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

  if (loading) {
    return <div className="text-center py-8">Loading prize information...</div>;
  }

  if (!activePool?.has_buy_in && !isAdmin) {
    return null;
  }

  // Calculate prizes from new prize_configuration or fallback to old structure
  const prizeCalculation = calculatePrizes(activePool, totalEntries);
  const currency = activePool?.entry_fee_currency || 'CAD';
  
  // Debug logging
  console.log('🎯 Enhanced Prize Display - Active pool config:', activePool?.prize_configuration);
  console.log('📊 Prize Calculation result:', prizeCalculation);

  // Don't show if both toggles are off (unless admin)
  if (!showPrizeTotal && !showPrizeAmounts && !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Admin Controls */}
      {isAdmin && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Prize Display Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Total Prize Pool to Participants</label>
              <Switch 
                checked={showPrizeTotal}
                onCheckedChange={(checked) => updateVisibilitySetting('show_prize_total', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Individual Prize Amounts</label>
              <Switch 
                checked={showPrizeAmounts}
                onCheckedChange={(checked) => updateVisibilitySetting('show_prize_amounts', checked)}
              />
            </div>
            
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Currently using:</span> {' '}
                <Badge variant={prizeCalculation.mode === 'percentage' ? 'default' : 'secondary'}>
                  {prizeCalculation.mode === 'percentage' ? 'Percentage' : 'Custom'} distribution
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prize Display */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-coral to-orange text-white">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Prize Pool
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {(showPrizeTotal || isAdmin) && (
            <div className="text-center mb-6">
              <div className="text-sm text-muted-foreground mb-2">Total Prize Pool</div>
              <div className="text-3xl font-bold text-coral">
                {formatPrize(prizeCalculation.totalPrizePool, currency)}
              </div>
              <div className="text-sm text-muted-foreground">
                from {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
              </div>
            </div>
          )}
          
          {(showPrizeAmounts || isAdmin) && prizeCalculation.prizes.length > 0 && (
            <div className="space-y-3">
              <div className="text-center mb-4">
                <div className="text-sm text-muted-foreground">Prize Breakdown</div>
                {prizeCalculation.mode === 'percentage' && (
                  <Badge variant="outline" className="mt-1">Percentage-based distribution</Badge>
                )}
                {prizeCalculation.mode === 'custom' && (
                  <Badge variant="outline" className="mt-1">Custom amount distribution</Badge>
                )}
              </div>
              
              {prizeCalculation.prizes.map((prize) => (
                <div key={prize.place} className="flex justify-between items-center p-3 bg-cream rounded-lg border border-brand-teal/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-teal text-brand-teal-foreground flex items-center justify-center text-sm font-bold">
                      {prize.place}
                    </div>
                    <span className="font-medium text-dark">{getPlaceText(prize.place)}</span>
                  </div>
                  <div className="text-lg font-bold text-coral">
                    {formatPrize(prize.amount, currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {prizeCalculation.prizes.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Prize structure will be announced soon!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};