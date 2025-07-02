import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyEventForm } from '@/types/admin';
import { Clock, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImprovedHistoricalWeekSelectorProps {
  onLoadWeek: (weekData: WeeklyEventForm) => void;
  currentWeek: number;
}

interface WeekSummary {
  week_number: number;
  hoh_winner: string | null;
  pov_winner: string | null;
  evicted_contestant: string | null;
  is_draft: boolean | null;
  is_double_eviction: boolean | null;
  is_triple_eviction: boolean | null;
  jury_phase_started: boolean | null;
  nominees: string[] | null;
  pov_used: boolean | null;
  pov_used_on: string | null;
  replacement_nominee: string | null;
  second_hoh_winner: string | null;
  second_pov_winner: string | null;
  second_nominees: string[] | null;
  second_pov_used: boolean | null;
  second_pov_used_on: string | null;
  second_replacement_nominee: string | null;
  second_evicted_contestant: string | null;
  third_hoh_winner: string | null;
  third_pov_winner: string | null;
  third_evicted_contestant: string | null;
}

export const ImprovedHistoricalWeekSelector: React.FC<ImprovedHistoricalWeekSelectorProps> = ({
  onLoadWeek,
  currentWeek
}) => {
  const { toast } = useToast();
  const [weeks, setWeeks] = useState<WeekSummary[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableWeeks();
  }, []);

  const loadAvailableWeeks = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_results')
        .select('*')
        .order('week_number', { ascending: false });

      if (error) throw error;
      setWeeks(data || []);
    } catch (error) {
      console.error('Error loading weeks:', error);
      toast({
        title: "Error",
        description: "Failed to load historical weeks",
        variant: "destructive",
      });
    }
  };

  const loadWeekData = async (weekNumber: number) => {
    setLoading(true);
    try {
      // Get week from weekly_results
      const { data: weekData, error: weekError } = await supabase
        .from('weekly_results')
        .select('*')
        .eq('week_number', weekNumber)
        .single();

      if (weekError && weekError.code !== 'PGRST116') throw weekError;

      // Get special events for this week
      const { data: specialEvents, error: specialError } = await supabase
        .from('special_events')
        .select(`
          event_type,
          description,
          contestants(name)
        `)
        .eq('week_number', weekNumber);

      if (specialError) throw specialError;

      // Convert to form format
      const formData: WeeklyEventForm = {
        week: weekNumber,
        nominees: weekData?.nominees || ['', ''],
        hohWinner: weekData?.hoh_winner || '',
        povWinner: weekData?.pov_winner || '',
        povUsed: weekData?.pov_used || false,
        povUsedOn: weekData?.pov_used_on || '',
        replacementNominee: weekData?.replacement_nominee || '',
        evicted: weekData?.evicted_contestant || '',
        isDoubleEviction: weekData?.is_double_eviction || false,
        isTripleEviction: weekData?.is_triple_eviction || false,
        isFinalWeek: false,
        isJuryPhase: weekData?.jury_phase_started || false,
        secondHohWinner: weekData?.second_hoh_winner || '',
        secondNominees: weekData?.second_nominees || ['', ''],
        secondPovWinner: weekData?.second_pov_winner || '',
        secondPovUsed: weekData?.second_pov_used || false,
        secondPovUsedOn: weekData?.second_pov_used_on || '',
        secondReplacementNominee: weekData?.second_replacement_nominee || '',
        secondEvicted: weekData?.second_evicted_contestant || '',
        thirdHohWinner: weekData?.third_hoh_winner || '',
        thirdNominees: ['', ''],
        thirdPovWinner: weekData?.third_pov_winner || '',
        thirdPovUsed: false,
        thirdPovUsedOn: '',
        thirdReplacementNominee: '',
        thirdEvicted: weekData?.third_evicted_contestant || '',
        maxNominees: 4,
        specialEvents: (specialEvents || []).map(se => ({
          contestant: (se.contestants as any)?.name || '',
          eventType: se.event_type,
          description: se.description || '',
          customPoints: 0
        })),
        winner: '',
        runnerUp: '',
        americasFavorite: ''
      };

      onLoadWeek(formData);
      
      toast({
        title: "Week loaded",
        description: `Week ${weekNumber} data loaded successfully`,
      });
    } catch (error) {
      console.error('Error loading week data:', error);
      toast({
        title: "Error",
        description: "Failed to load week data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteWeek = async (weekNumber: number) => {
    if (!confirm(`Are you sure you want to delete all data for Week ${weekNumber}? This cannot be undone.`)) {
      return;
    }

    try {
      // Delete from all related tables
      await Promise.all([
        supabase.from('weekly_events').delete().eq('week_number', weekNumber),
        supabase.from('special_events').delete().eq('week_number', weekNumber),
        supabase.from('weekly_results').delete().eq('week_number', weekNumber)
      ]);

      await loadAvailableWeeks(); // Refresh list
      setSelectedWeek('');
      
      toast({
        title: "Week deleted",
        description: `Week ${weekNumber} has been completely removed`,
      });
    } catch (error) {
      console.error('Error deleting week:', error);
      toast({
        title: "Error",
        description: "Failed to delete week",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historical Week Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Select Week to Edit</label>
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a week to edit..." />
              </SelectTrigger>
              <SelectContent>
                {weeks.map((week) => (
                  <SelectItem key={week.week_number} value={week.week_number.toString()}>
                    <div className="flex items-center gap-2">
                      Week {week.week_number}
                      {week.is_draft && <Badge variant="secondary" className="text-xs">Draft</Badge>}
                      {week.is_double_eviction && <Badge variant="destructive" className="text-xs">2x</Badge>}
                      {week.is_triple_eviction && <Badge variant="destructive" className="text-xs">3x</Badge>}
                      {week.jury_phase_started && <Badge variant="outline" className="text-xs">Jury</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => selectedWeek && loadWeekData(parseInt(selectedWeek))}
            disabled={!selectedWeek || loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Load Week'}
          </Button>
          <Button 
            variant="destructive"
            onClick={() => selectedWeek && deleteWeek(parseInt(selectedWeek))}
            disabled={!selectedWeek}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* Week Summary */}
        {selectedWeek && weeks.find(w => w.week_number.toString() === selectedWeek) && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-2">Week {selectedWeek} Summary</h4>
            {(() => {
              const week = weeks.find(w => w.week_number.toString() === selectedWeek)!;
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div><strong>HOH:</strong> {week.hoh_winner || 'None'}</div>
                  <div><strong>POV:</strong> {week.pov_winner || 'None'}</div>
                  <div><strong>Nominees:</strong> {week.nominees?.join(', ') || 'None'}</div>
                  <div><strong>Evicted:</strong> {week.evicted_contestant || 'None'}</div>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};