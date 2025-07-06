import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';
import { RotateCcw } from 'lucide-react';
import { useEvictedContestants } from '@/hooks/useEvictedContestants';

export const HouseguestRevivalSection: React.FC = () => {
  const { toast } = useToast();
  const { activePool } = usePool();
  const { evictedContestants, refreshEvicted } = useEvictedContestants();
  const [selectedHouseguest, setSelectedHouseguest] = React.useState<string>('');
  const [isReviving, setIsReviving] = React.useState(false);

  const handleRevival = async () => {
    if (!selectedHouseguest || !activePool) return;
    
    setIsReviving(true);
    try {
      // Find the contestant
      const { data: contestant, error: findError } = await supabase
        .from('contestants')
        .select('*')
        .eq('name', selectedHouseguest)
        .eq('pool_id', activePool.id)
        .single();

      if (findError || !contestant) {
        throw new Error('Houseguest not found');
      }

      // Update contestant status to active
      const { error: updateError } = await supabase
        .from('contestants')
        .update({ 
          is_active: true,
          final_placement: null 
        })
        .eq('id', contestant.id);

      if (updateError) throw updateError;

      // Remove eviction events for this contestant
      const { error: removeEvictionError } = await supabase
        .from('weekly_events')
        .delete()
        .eq('contestant_id', contestant.id)
        .eq('event_type', 'evicted')
        .eq('pool_id', activePool.id);

      if (removeEvictionError) throw removeEvictionError;

      // Add special event for returning
      const { error: specialEventError } = await supabase
        .from('special_events')
        .insert({
          contestant_id: contestant.id,
          pool_id: activePool.id,
          event_type: 'returned_to_game',
          description: `${selectedHouseguest} returned to the game after being evicted`,
          points_awarded: 10, // Bonus points for returning
          week_number: 1 // Will be updated when we know current week
        });

      if (specialEventError) throw specialEventError;

      toast({
        title: "Houseguest Revived!",
        description: `${selectedHouseguest} has returned to the game and is now active`,
      });

      setSelectedHouseguest('');
      refreshEvicted();
    } catch (error) {
      console.error('Error reviving houseguest:', error);
      toast({
        title: "Error",
        description: "Failed to revive houseguest",
        variant: "destructive",
      });
    } finally {
      setIsReviving(false);
    }
  };

  if (evictedContestants.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <RotateCcw className="h-5 w-5" />
          Houseguest Revival
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="font-semibold">
            Select Evicted Houseguest to Return
          </Label>
          <Select 
            value={selectedHouseguest} 
            onValueChange={setSelectedHouseguest}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose houseguest..." />
            </SelectTrigger>
            <SelectContent>
              {evictedContestants.map(name => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRevival}
            disabled={!selectedHouseguest || isReviving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isReviving ? 'Reviving...' : 'Revive Houseguest'}
          </Button>
          <p className="text-sm text-green-700">
            This will make them active and available for all competitions again
          </p>
        </div>
      </CardContent>
    </Card>
  );
};