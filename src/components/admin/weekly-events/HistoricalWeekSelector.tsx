import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HistoricalWeekSelectorProps {
  onLoadWeek: (weekData: any) => void;
  currentWeek: number;
}

interface WeekSummary {
  week_number: number;
  hoh_winner: string | null;
  pov_winner: string | null;
  evicted_contestant: string | null;
}

export const HistoricalWeekSelector: React.FC<HistoricalWeekSelectorProps> = ({
  onLoadWeek,
  currentWeek
}) => {
  const { toast } = useToast();
  const [historicalWeeks, setHistoricalWeeks] = useState<WeekSummary[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistoricalWeeks();
  }, []);

  const loadHistoricalWeeks = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_results')
        .select('week_number, hoh_winner, pov_winner, evicted_contestant')
        .order('week_number', { ascending: false });

      if (error) throw error;
      setHistoricalWeeks(data || []);
    } catch (error) {
      console.error('Error loading historical weeks:', error);
    }
  };

  const handleLoadWeek = async () => {
    if (!selectedWeek) return;
    
    setLoading(true);
    try {
      const weekNumber = parseInt(selectedWeek);
      
      // Load week data from weekly_results
      const { data: weekData, error: weekError } = await supabase
        .from('weekly_results')
        .select('*')
        .eq('week_number', weekNumber)
        .single();

      if (weekError) throw weekError;

      // Load special events for this week
      const { data: specialEvents, error: specialError } = await supabase
        .from('special_events')
        .select('*')
        .eq('week_number', weekNumber);

      if (specialError) throw specialError;

      // Transform data to match eventForm structure
      const loadedWeekData = {
        week: weekNumber,
        hohWinner: weekData.hoh_winner || '',
        povWinner: weekData.pov_winner || '',
        evicted: weekData.evicted_contestant || '',
        isDoubleEviction: weekData.is_double_eviction || false,
        secondHohWinner: weekData.second_hoh_winner || '',
        secondPovWinner: weekData.second_pov_winner || '',
        secondEvicted: weekData.second_evicted_contestant || '',
        nominees: ['', ''], // Would need to reconstruct from events
        secondNominees: ['', ''],
        povUsed: false,
        secondPovUsed: false,
        replacementNominee: '',
        secondReplacementNominee: '',
        maxNominees: 4,
        specialEvents: specialEvents?.map(se => ({
          contestant: '', // Would need to map from contestant_id
          eventType: se.event_type,
          description: se.description || '',
          customPoints: se.points_awarded
        })) || []
      };

      onLoadWeek(loadedWeekData);
      
      toast({
        title: "Week Loaded",
        description: `Week ${weekNumber} data loaded for editing`,
      });

    } catch (error) {
      console.error('Error loading week:', error);
      toast({
        title: "Error",
        description: "Failed to load week data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearWeek = async () => {
    if (!selectedWeek) return;
    
    if (!confirm(`Are you sure you want to clear all data for Week ${selectedWeek}? This cannot be undone.`)) {
      return;
    }
    
    setLoading(true);
    try {
      const weekNumber = parseInt(selectedWeek);
      
      // Delete from all related tables
      await Promise.all([
        supabase.from('weekly_results').delete().eq('week_number', weekNumber),
        supabase.from('weekly_events').delete().eq('week_number', weekNumber),
        supabase.from('special_events').delete().eq('week_number', weekNumber)
      ]);

      toast({
        title: "Week Cleared",
        description: `Week ${weekNumber} data has been cleared`,
      });
      
      loadHistoricalWeeks();
      setSelectedWeek('');

    } catch (error) {
      console.error('Error clearing week:', error);
      toast({
        title: "Error",
        description: "Failed to clear week data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <History className="h-5 w-5" />
          Historical Week Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a week to edit or clear" />
            </SelectTrigger>
            <SelectContent>
              {historicalWeeks.map((week) => (
                <SelectItem key={week.week_number} value={week.week_number.toString()}>
                  Week {week.week_number} - {week.hoh_winner || 'No HOH'} vs {week.evicted_contestant || 'No eviction'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleLoadWeek}
            disabled={!selectedWeek || loading}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Edit className="h-4 w-4" />
            Load for Editing
          </Button>
          <Button
            onClick={handleClearWeek}
            disabled={!selectedWeek || loading}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Week
          </Button>
        </div>
        
        {historicalWeeks.length === 0 && (
          <p className="text-sm text-blue-700">No historical weeks found.</p>
        )}
      </CardContent>
    </Card>
  );
};