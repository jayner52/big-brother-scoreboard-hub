import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Eye, EyeOff } from 'lucide-react';
import { BigBrotherIcon } from '@/components/BigBrotherIcons';
import { supabase } from '@/integrations/supabase/client';
import { formatEventType, getEventDisplayText } from '@/utils/eventFormatters';
import { useCurrentWeek } from '@/contexts/CurrentWeekContext';
import { useActivePool } from '@/hooks/useActivePool';

interface WeeklyResult {
  week_number: number;
  hoh_winner: string | null;
  pov_winner: string | null;
  evicted_contestant: string | null;
  nominees: string[] | null;
  pov_used: boolean | null;
  pov_used_on: string | null;
  replacement_nominee: string | null;
  is_double_eviction: boolean | null;
  is_triple_eviction: boolean | null;
  jury_phase_started: boolean | null;
  is_draft: boolean | null;
  // Double eviction fields
  second_hoh_winner: string | null;
  second_pov_winner: string | null;
  second_evicted_contestant: string | null;
  second_nominees: string[] | null;
  second_pov_used: boolean | null;
  second_pov_used_on: string | null;
  second_replacement_nominee: string | null;
}

interface SpecialEvent {
  week_number: number;
  event_type: string;
  description: string | null;
  houseguest_name: string;
  points_awarded: number;
}

export const LiveResults: React.FC = () => {
  const [weeklyResults, setWeeklyResults] = useState<WeeklyResult[]>([]);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const { currentWeek } = useCurrentWeek();
  const activePool = useActivePool();
  const [currentWeekData, setCurrentWeekData] = useState<WeeklyResult | null>(null);

  useEffect(() => {
    if (activePool?.id) {
      loadWeeklyResults();
      
      // Auto-refresh every 5 seconds to get live updates
      const interval = setInterval(loadWeeklyResults, 5000);
      
      return () => clearInterval(interval);
    }
  }, [activePool?.id]);

  const loadWeeklyResults = async () => {
    if (!activePool?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('weekly_results')
        .select('*')
        .eq('pool_id', activePool.id)
        .order('week_number', { ascending: false });

      if (error) throw error;
      setWeeklyResults(data || []);

      // Load special events from all sources with points
      const [specialData, bbArenaData, draftEventsData, scoringRulesData] = await Promise.all([
        supabase
          .from('special_events')
          .select(`
            week_number,
            event_type,
            description,
            points_awarded,
            contestants(name)
          `)
          .eq('pool_id', activePool.id)
          .order('week_number', { ascending: false }),
        supabase
          .from('weekly_events')
          .select(`
            week_number,
            event_type,
            points_awarded,
            contestants(name)
          `)
          .eq('event_type', 'bb_arena_winner')
          .eq('pool_id', activePool.id)
          .order('week_number', { ascending: false }),
        supabase
          .from('weekly_results')
          .select('week_number, draft_special_events')
          .eq('pool_id', activePool.id)
          .eq('is_draft', true)
          .not('draft_special_events', 'is', null),
        supabase
          .from('detailed_scoring_rules')
          .select('*')
          .eq('is_active', true)
      ]);

      if (specialData.error) throw specialData.error;
      if (bbArenaData.error) throw bbArenaData.error;
      if (draftEventsData.error) throw draftEventsData.error;
      if (scoringRulesData.error) throw scoringRulesData.error;
      
      const allSpecialEvents: SpecialEvent[] = [];

      // Add database special events
      const mappedSpecialEvents = (specialData.data || []).map(event => ({
        week_number: event.week_number,
        event_type: event.event_type,
        description: event.description,
        houseguest_name: (event.contestants as any)?.name || 'Unknown',
        points_awarded: event.points_awarded || 0
      }));

      // Add BB Arena events
      const mappedBBArenaEvents = (bbArenaData.data || []).map(event => ({
        week_number: event.week_number,
        event_type: 'bb_arena_winner',
        description: 'BB Arena Winner',
        houseguest_name: (event.contestants as any)?.name || 'Unknown',
        points_awarded: event.points_awarded || 0
      }));

      // Add draft special events
      const mappedDraftEvents: SpecialEvent[] = [];
      if (draftEventsData.data) {
        draftEventsData.data.forEach(week => {
          if (week.draft_special_events) {
            try {
              const draftEvents = JSON.parse(week.draft_special_events);
              if (Array.isArray(draftEvents)) {
                draftEvents.forEach((event: any) => {
                  if (event.contestant && event.eventType) {
                    // Get points from scoring rules or use custom points
                    let eventPoints = event.customPoints || 0;
                    if (!eventPoints && event.eventType !== 'custom_event') {
                      const rule = scoringRulesData.data?.find(r => r.subcategory === event.eventType);
                      eventPoints = rule?.points || 0;
                    }

                    mappedDraftEvents.push({
                      week_number: week.week_number,
                      event_type: event.eventType,
                      description: event.eventType === 'custom_event' ? event.customDescription : event.description,
                      houseguest_name: event.contestant,
                      points_awarded: eventPoints
                    });
                  }
                });
              }
            } catch (error) {
              console.error('Error parsing draft special events for week', week.week_number, error);
            }
          }
        });
      }

      allSpecialEvents.push(...mappedSpecialEvents, ...mappedBBArenaEvents, ...mappedDraftEvents);
      
      setSpecialEvents(allSpecialEvents);
      
      // Find the current in-progress week (first week with is_draft=true)
      const inProgressWeek = data?.find(week => week.is_draft === true);
      
      if (inProgressWeek) {
        setCurrentWeekData(inProgressWeek);
      } else {
        // If no in-progress week found, use the current week as placeholder
        setCurrentWeekData({
          week_number: currentWeek,
          hoh_winner: null,
          pov_winner: null,
          evicted_contestant: null,
          nominees: null,
          pov_used: null,
          pov_used_on: null,
          replacement_nominee: null,
          is_double_eviction: null,
          is_triple_eviction: null,
          jury_phase_started: null,
          is_draft: true,
          second_hoh_winner: null,
          second_pov_winner: null,
          second_evicted_contestant: null,
          second_nominees: null,
          second_pov_used: null,
          second_pov_used_on: null,
          second_replacement_nominee: null
        });
      }
    } catch (error) {
      console.error('Error loading weekly results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading live results...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Current Week Highlights */}
      {currentWeekData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Week {currentWeekData.week_number} - In Progress
              <div className="flex gap-2 ml-auto">
                {currentWeekData.is_draft && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSpoilers(!showSpoilers)}
                    className="flex items-center gap-2"
                  >
                    {showSpoilers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showSpoilers ? 'Hide Spoilers' : 'Show Spoilers'}
                  </Button>
                )}
                 {currentWeekData.is_double_eviction && (
                   <Badge variant="destructive">Double Eviction</Badge>
                 )}
                 {currentWeekData.is_triple_eviction && (
                   <Badge variant="destructive">Triple Eviction</Badge>
                 )}
                 {currentWeekData.jury_phase_started && (
                   <Badge className="bg-purple-600 text-white font-bold text-sm px-3 py-1">
                     ⚖️ JURY PHASE STARTED
                   </Badge>
                 )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Show spoiler-protected content for in-progress weeks */}
            {currentWeekData.is_draft && !showSpoilers ? (
              <div className="text-center py-8 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold mb-2">Week {currentWeekData.week_number} In Progress</p>
                <p>Click "Show Spoilers" to see current results</p>
              </div>
            ) : currentWeekData.is_double_eviction ? (
              <div className="double-eviction-container space-y-4">
                <div className="double-eviction-badge bg-gradient-to-r from-coral to-orange text-white py-2 px-4 rounded-lg text-center font-bold">
                  ⚡ DOUBLE EVICTION NIGHT ⚡
                </div>
                
                {/* First Eviction */}
                <div className="eviction-block bg-card border-2 border-brand-teal rounded-lg p-4 shadow-sm">
                  <h4 className="text-lg font-semibold mb-3 text-foreground">First Eviction</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <BigBrotherIcon type="hoh" className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm font-medium text-yellow-800 block">HOH</span>
                      <span className="font-bold text-yellow-900">{currentWeekData.hoh_winner || "TBD"}</span>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <BigBrotherIcon type="nominees" className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm font-medium text-orange-800 block">Nominees</span>
                      <span className="text-sm font-bold text-orange-900">{currentWeekData.nominees?.join(' & ') || "TBD"}</span>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <BigBrotherIcon type="pov" className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm font-medium text-green-800 block">Veto Winner</span>
                      <span className="font-bold text-green-900">{currentWeekData.pov_winner || "TBD"}</span>
                      {currentWeekData.pov_used && (
                        <p className="text-xs text-green-600 mt-1">Used on {currentWeekData.pov_used_on}</p>
                      )}
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <BigBrotherIcon type="evicted" className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm font-medium text-red-800 block">Evicted</span>
                      <span className="font-bold text-red-900">{currentWeekData.evicted_contestant || "TBD"}</span>
                    </div>
                  </div>
                </div>

                {/* Second Eviction */}
                <div className="eviction-block bg-card border-2 border-brand-teal rounded-lg p-4 shadow-sm">
                  <h4 className="text-lg font-semibold mb-3 text-foreground">Second Eviction (Live HOH)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <BigBrotherIcon type="hoh" className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm font-medium text-yellow-800 block">HOH</span>
                      <span className="font-bold text-yellow-900">{currentWeekData.second_hoh_winner || "TBD"}</span>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <BigBrotherIcon type="nominees" className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm font-medium text-orange-800 block">Nominees</span>
                      <span className="text-sm font-bold text-orange-900">{currentWeekData.second_nominees?.join(' & ') || "TBD"}</span>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <BigBrotherIcon type="pov" className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm font-medium text-green-800 block">Veto Winner</span>
                      <span className="font-bold text-green-900">{currentWeekData.second_pov_winner || "TBD"}</span>
                      {currentWeekData.second_pov_used && (
                        <p className="text-xs text-green-600 mt-1">Used on {currentWeekData.second_pov_used_on}</p>
                      )}
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <BigBrotherIcon type="evicted" className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm font-medium text-red-800 block">Evicted</span>
                      <span className="font-bold text-red-900">{currentWeekData.second_evicted_contestant || "TBD"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <BigBrotherIcon type="hoh" className="h-8 w-8 mx-auto mb-2" />
                  <h4 className="font-semibold text-yellow-800">Head of Household</h4>
                  <p className="text-xl font-bold text-yellow-900">
                    {currentWeekData.hoh_winner || "TBD"}
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <BigBrotherIcon type="nominees" className="h-8 w-8 mx-auto mb-2" />
                  <h4 className="font-semibold text-orange-800">Nominees</h4>
                  <p className="text-sm font-bold text-orange-900">
                    {currentWeekData.nominees?.join(', ') || "TBD"}
                  </p>
                  {currentWeekData.replacement_nominee && (
                    <p className="text-xs text-orange-600 mt-1">
                      Replacement: {currentWeekData.replacement_nominee}
                    </p>
                  )}
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <BigBrotherIcon type="pov" className="h-8 w-8 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-800">Power of Veto</h4>
                  <p className="text-xl font-bold text-green-900">
                    {currentWeekData.pov_winner || "TBD"}
                  </p>
                  {currentWeekData.pov_used && (
                    <p className="text-sm text-green-600 mt-1">
                      Used on {currentWeekData.pov_used_on}
                    </p>
                  )}
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <BigBrotherIcon type="evicted" className="h-8 w-8 mx-auto mb-2" />
                  <h4 className="font-semibold text-red-800">Evicted</h4>
                  <p className="text-xl font-bold text-red-900">
                    {currentWeekData.evicted_contestant || "TBD"}
                  </p>
                </div>
              </div>
            )}

            {/* Special Events for Current Week */}
            {(!currentWeekData.is_draft || showSpoilers) && specialEvents.filter(event => event.week_number === currentWeekData.week_number).length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Special Events This Week</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                   {specialEvents
                     .filter(event => event.week_number === currentWeekData.week_number)
                     .map((event, index) => (
                       <div key={index} className="bg-purple-50 p-2 rounded-md border border-purple-200">
                         <div className="flex items-center justify-between mb-1">
                           <span className="font-medium text-purple-900 text-sm">{event.houseguest_name}</span>
                           <Badge 
                             variant={event.points_awarded > 0 ? "default" : event.points_awarded < 0 ? "destructive" : "secondary"} 
                             className="text-xs"
                           >
                             {event.points_awarded > 0 ? '+' : ''}{event.points_awarded} pts
                           </Badge>
                         </div>
                         <div className="text-purple-700 text-xs">
                           {getEventDisplayText(event.event_type, event.description)}
                         </div>
                       </div>
                     ))}
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completed Weekly Results */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Weeks</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyResults.filter(week => !week.is_draft).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No completed weeks yet. Check back after the first week is finalized!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {weeklyResults.filter(week => !week.is_draft).map((week) => (
                <div key={week.week_number} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Week {week.week_number}</h3>
                    <div className="flex gap-2">
                      {week.is_double_eviction && (
                        <Badge variant="destructive">Double Eviction</Badge>
                      )}
                      {week.is_triple_eviction && (
                        <Badge variant="destructive">Triple Eviction</Badge>
                       )}
                        {week.jury_phase_started && (
                          <Badge className="bg-purple-600 text-white font-bold text-sm px-3 py-1">
                            ⚖️ JURY STARTED
                          </Badge>
                        )}
                    </div>
                  </div>
                  
                   {/* Week Summary */}
                   {week.is_double_eviction ? (
                     <div className="double-eviction-container space-y-4">
                       <div className="double-eviction-badge bg-gradient-to-r from-coral to-orange text-white py-2 px-4 rounded-lg text-center font-bold mb-4">
                         ⚡ DOUBLE EVICTION NIGHT ⚡
                       </div>
                       
                       {/* First Eviction */}
                       <div className="eviction-block bg-card border-2 border-brand-teal rounded-lg p-4 shadow-sm">
                         <h4 className="text-lg font-semibold mb-3 text-foreground">First Eviction</h4>
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                           <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                             <BigBrotherIcon type="hoh" className="h-6 w-6 mx-auto mb-1" />
                             <span className="text-sm font-medium text-yellow-800 block">HOH</span>
                             <span className="font-bold text-yellow-900">{week.hoh_winner || "N/A"}</span>
                           </div>
                           <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                             <BigBrotherIcon type="nominees" className="h-6 w-6 mx-auto mb-1" />
                             <span className="text-sm font-medium text-orange-800 block">Nominees</span>
                             <span className="text-sm font-bold text-orange-900">{week.nominees?.join(' & ') || "N/A"}</span>
                           </div>
                           <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                             <BigBrotherIcon type="pov" className="h-6 w-6 mx-auto mb-1" />
                             <span className="text-sm font-medium text-green-800 block">Veto Winner</span>
                             <span className="font-bold text-green-900">{week.pov_winner || "N/A"}</span>
                             {week.pov_used && (
                               <p className="text-xs text-green-600 mt-1">Used on {week.pov_used_on}</p>
                             )}
                           </div>
                           <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                             <BigBrotherIcon type="evicted" className="h-6 w-6 mx-auto mb-1" />
                             <span className="text-sm font-medium text-red-800 block">Evicted</span>
                             <span className="font-bold text-red-900">{week.evicted_contestant || "N/A"}</span>
                           </div>
                         </div>
                       </div>

                       {/* Second Eviction */}
                       <div className="eviction-block bg-card border-2 border-brand-teal rounded-lg p-4 shadow-sm">
                         <h4 className="text-lg font-semibold mb-3 text-foreground">Second Eviction (Live HOH)</h4>
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                           <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                             <BigBrotherIcon type="hoh" className="h-6 w-6 mx-auto mb-1" />
                             <span className="text-sm font-medium text-yellow-800 block">HOH</span>
                             <span className="font-bold text-yellow-900">{week.second_hoh_winner || "N/A"}</span>
                           </div>
                           <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                             <BigBrotherIcon type="nominees" className="h-6 w-6 mx-auto mb-1" />
                             <span className="text-sm font-medium text-orange-800 block">Nominees</span>
                             <span className="text-sm font-bold text-orange-900">{week.second_nominees?.join(' & ') || "N/A"}</span>
                           </div>
                           <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                             <BigBrotherIcon type="pov" className="h-6 w-6 mx-auto mb-1" />
                             <span className="text-sm font-medium text-green-800 block">Veto Winner</span>
                             <span className="font-bold text-green-900">{week.second_pov_winner || "N/A"}</span>
                             {week.second_pov_used && (
                               <p className="text-xs text-green-600 mt-1">Used on {week.second_pov_used_on}</p>
                             )}
                           </div>
                           <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                             <BigBrotherIcon type="evicted" className="h-6 w-6 mx-auto mb-1" />
                             <span className="text-sm font-medium text-red-800 block">Evicted</span>
                             <span className="font-bold text-red-900">{week.second_evicted_contestant || "N/A"}</span>
                           </div>
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                       <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                         <BigBrotherIcon type="hoh" className="h-6 w-6 mx-auto mb-1" />
                         <p className="text-sm font-medium text-yellow-800">HOH</p>
                         <p className="font-bold text-yellow-900">{week.hoh_winner || "N/A"}</p>
                       </div>
                       <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                         <BigBrotherIcon type="pov" className="h-6 w-6 mx-auto mb-1" />
                         <p className="text-sm font-medium text-green-800">POV</p>
                         <p className="font-bold text-green-900">{week.pov_winner || "N/A"}</p>
                       </div>
                       <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                         <Users className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                         <p className="text-sm font-medium text-orange-800">POV Used</p>
                         <p className="font-bold text-orange-900">
                           {week.pov_used ? `Yes (on ${week.pov_used_on})` : "No"}
                         </p>
                       </div>
                       <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                         <BigBrotherIcon type="evicted" className="h-6 w-6 mx-auto mb-1" />
                         <p className="text-sm font-medium text-red-800">Evicted</p>
                         <p className="font-bold text-red-900">{week.evicted_contestant || "N/A"}</p>
                       </div>
                     </div>
                   )}

                  {/* Nominees and Special Events */}
                  <div className="text-xs text-gray-500 space-y-2">
                    {(week.nominees || []).length > 0 && (
                      <div>
                        <span className="font-medium">Nominees: </span>
                        {(week.nominees || []).map((nominee, index) => {
                          const isSavedByVeto = week.pov_used && week.pov_used_on === nominee;
                          const isSavedByArena = specialEvents.some(event => 
                            event.week_number === week.week_number && 
                            event.event_type === 'bb_arena_winner' && 
                            event.houseguest_name === nominee
                          );
                          return (
                            <span key={index}>
                              {index > 0 && ', '}
                              {isSavedByVeto || isSavedByArena ? (
                                <span className="line-through">{nominee}</span>
                              ) : (
                                nominee
                              )}
                            </span>
                          );
                        })}
                        {week.replacement_nominee && (
                          <span>, Replacement: {week.replacement_nominee}</span>
                        )}
                      </div>
                    )}

                    {/* Special Events for this week */}
                    {specialEvents?.filter(event => event.week_number === week.week_number).length > 0 && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <h5 className="font-semibold mb-2 flex items-center gap-2 text-purple-800 text-sm">
                          <span className="text-purple-600">⚡</span>
                          Special Events
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {specialEvents
                            ?.filter(event => event.week_number === week.week_number)
                            .map((event, index) => (
                              <div key={index} className="bg-white/80 p-2 rounded-md border border-purple-200/50 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-purple-900 text-sm">{event.houseguest_name}</span>
                                  <Badge 
                                    variant={event.points_awarded > 0 ? "default" : event.points_awarded < 0 ? "destructive" : "secondary"} 
                                    className="text-xs"
                                  >
                                    {event.points_awarded > 0 ? '+' : ''}{event.points_awarded} pts
                                  </Badge>
                                </div>
                                <div className="text-purple-700 text-xs">
                                  {getEventDisplayText(event.event_type, event.description)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};