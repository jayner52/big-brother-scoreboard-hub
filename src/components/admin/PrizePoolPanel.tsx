import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Trophy, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';

interface PrizePool {
  id: string;
  place_number: number;
  prize_amount: number;
  currency: string;
  description?: string;
  is_active: boolean;
}

export const PrizePoolPanel: React.FC = () => {
  const { activePool } = usePool();
  const { toast } = useToast();
  const [prizePools, setPrizePools] = useState<PrizePool[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newPrize, setNewPrize] = useState({
    place_number: 1,
    prize_amount: 0,
    description: ''
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
      const [prizeResult, entriesResult] = await Promise.all([
        supabase.from('prize_pools').select('*').order('place_number'),
        supabase.from('pool_entries').select('id').eq('pool_id', activePool.id)
      ]);

      if (prizeResult.data) {
        setPrizePools(prizeResult.data);
      }

      setTotalEntries(entriesResult.data?.length || 0);
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

  const addPrize = async () => {
    try {
      const { error } = await supabase
        .from('prize_pools')
        .insert({
          place_number: newPrize.place_number,
          prize_amount: newPrize.prize_amount,
          description: newPrize.description || null,
          currency: activePool?.entry_fee_currency || 'CAD'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prize added successfully",
      });

      setNewPrize({ place_number: 1, prize_amount: 0, description: '' });
      loadData();
    } catch (error) {
      console.error('Error adding prize:', error);
      toast({
        title: "Error",
        description: "Failed to add prize",
        variant: "destructive",
      });
    }
  };

  const updatePrize = async (id: string, updates: Partial<PrizePool>) => {
    try {
      const { error } = await supabase
        .from('prize_pools')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prize updated successfully",
      });

      loadData();
    } catch (error) {
      console.error('Error updating prize:', error);
      toast({
        title: "Error",
        description: "Failed to update prize",
        variant: "destructive",
      });
    }
  };

  const deletePrize = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prize_pools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prize deleted successfully",
      });

      loadData();
    } catch (error) {
      console.error('Error deleting prize:', error);
      toast({
        title: "Error",
        description: "Failed to delete prize",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading prize pool management...</div>;
  }

  const totalExpected = activePool ? (totalEntries * activePool.entry_fee_amount) : 0;
  const totalPrizes = prizePools.reduce((sum, prize) => sum + prize.prize_amount, 0);
  const currency = activePool?.entry_fee_currency || 'CAD';

  return (
    <div className="p-6 space-y-6">
      {/* Prize Pool Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Total Entries</h4>
              <p className="text-2xl font-bold text-blue-900">{totalEntries}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Expected Collection</h4>
              <p className="text-2xl font-bold text-green-900">
                {currency} ${Math.round(totalExpected)}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800">Total Prizes</h4>
              <p className="text-2xl font-bold text-purple-900">
                {currency} ${Math.round(totalPrizes)}
              </p>
              <Badge variant={totalPrizes <= totalExpected ? "default" : "destructive"} className="mt-1">
                {totalPrizes <= totalExpected ? "Within Budget" : "Over Budget"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Prize Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Current Prize Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prizePools.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No prizes configured yet</p>
          ) : (
            <div className="space-y-3">
              {prizePools.map((prize) => (
                <div key={prize.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{prize.place_number}st Place</Badge>
                    <span className="font-semibold">
                      {currency} ${Math.round(prize.prize_amount)}
                    </span>
                    {prize.description && (
                      <span className="text-sm text-gray-600">- {prize.description}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={prize.prize_amount.toString()}
                      onChange={(e) => updatePrize(prize.id, { prize_amount: parseFloat(e.target.value) || 0 })}
                      className="w-24"
                      step="1"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePrize(prize.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Prize */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Prize
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="place">Place</Label>
              <Input
                id="place"
                type="number"
                value={newPrize.place_number}
                onChange={(e) => setNewPrize(prev => ({ ...prev, place_number: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="amount">Prize Amount ({currency})</Label>
              <Input
                id="amount"
                type="number"
                value={newPrize.prize_amount}
                onChange={(e) => setNewPrize(prev => ({ ...prev, prize_amount: parseFloat(e.target.value) || 0 }))}
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={newPrize.description}
                onChange={(e) => setNewPrize(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Winner, Runner-up"
              />
            </div>
          </div>
          <Button onClick={addPrize} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Prize
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};