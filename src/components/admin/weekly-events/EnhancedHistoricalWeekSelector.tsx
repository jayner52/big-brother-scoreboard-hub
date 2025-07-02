import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WeeklyEventForm } from '@/types/admin';

interface EnhancedHistoricalWeekSelectorProps {
  onLoadWeek: (weekData: WeeklyEventForm) => void;
  currentWeek: number;
}

interface WeekSummary {
  week_number: number;
  hoh_winner: string | null;
  pov_winner: string | null;
  evicted_contestant: string | null;
  is_double_eviction: boolean;
  is_triple_eviction: boolean;
  is_draft: boolean;
  nominees: string[] | null;
  pov_used: boolean;
  pov_used_on: string | null;
  replacement_nominee: string | null;
  second_hoh_winner: string | null;
  second_pov_winner: string | null;
  second_evicted_contestant: string | null;
  second_nominees: string[] | null;
  second_pov_used: boolean;
  second_pov_used_on: string | null;
  second_replacement_nominee: string | null;
  third_hoh_winner: string | null;
  third_pov_winner: string | null;
  third_evicted_contestant: string | null;
  jury_phase_started: boolean;
}

export const EnhancedHistoricalWeekSelector: React.FC<EnhancedHistoricalWeekSelectorProps> = ({
  onLoadWeek,
  currentWeek
}) => {
  const { toast } = useToast();
  const [historicalWeeks, setHistoricalWeeks] = useState<WeekSummary[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [contestants, setContestants] = useState<any[]>([]);

  useEffect(() => {
    loadHistoricalWeeks();
    loadContestants();
  }, []);

  const loadContestants = async () => {
    try {
      const { data, error } = await supabase
        .from('contestants')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setContestants(data || []);
    } catch (error) {
      console.error('Error loading contestants:', error);
    }
  };

  const loadHistoricalWeeks = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_results')
        .select('*')
        .order('week_number', { ascending: false });

      if (error) throw error;
      setHistoricalWeeks(data || []);
    } catch (error) {
      console.error('Error loading historical weeks:', error);
    }
  };

  const getContestantName = (contestantId: string): string => {
    const contestant = contestants.find(c => c.id === contestantId);
    return contestant?.name || '';
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
        .select('*, contestants(name)')
        .eq('week_number', weekNumber);

      if (specialError) throw specialError;

      // Transform data to match WeeklyEventForm structure
      const loadedWeekData: WeeklyEventForm = {
        week: weekNumber,
        hohWinner: weekData.hoh_winner || '',
        povWinner: weekData.pov_winner || '',
        evicted: weekData.evicted_contestant || '',
        isDoubleEviction: weekData.is_double_eviction || false,
        isTripleEviction: weekData.is_triple_eviction || false,
        isFinalWeek: false, // This would need to be determined
        isJuryPhase: weekData.jury_phase_started || false,
        nominees: weekData.nominees || ['', ''],
        secondNominees: weekData.second_nominees || ['', ''],
        povUsed: weekData.pov_used || false,
        povUsedOn: weekData.pov_used_on || '',
        replacementNominee: weekData.replacement_nominee || '',
        secondHohWinner: weekData.second_hoh_winner || '',
        secondPovWinner: weekData.second_pov_winner || '',
        secondPovUsed: weekData.second_pov_used || false,
        secondPovUsedOn: weekData.second_pov_used_on || '',
        secondReplacementNominee: weekData.second_replacement_nominee || '',
        secondEvicted: weekData.second_evicted_contestant || '',
        thirdHohWinner: weekData.third_hoh_winner || '',
        thirdPovWinner: weekData.third_pov_winner || '',
        thirdEvicted: weekData.third_evicted_contestant || '',
        thirdNominees: ['', ''],
        thirdPovUsed: false,
        thirdPovUsedOn: '',
        thirdReplacementNominee: '',
        maxNominees: 4,
        winner: '',
        runnerUp: '',
        americasFavorite: '',
        specialEvents: specialEvents?.map(se => ({
          contestant: (se.contestants as any)?.name || '',
          eventType: se.event_type,
          description: se.description || '',
          customPoints: se.points_awarded || 0
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
                  Week {week.week_number} - {week.hoh_winner || 'No HoH'} vs {week.evicted_contestant || 'No eviction'}
                  {week.is_draft && ' (DRAFT)'}
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