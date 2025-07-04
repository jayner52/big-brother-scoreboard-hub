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
}

interface SpecialEvent {
  week_number: number;
  event_type: string;
  description: string | null;
  houseguest_name: string;
}

export const LiveResults: React.FC = () => {
  const [weeklyResults, setWeeklyResults] = useState<WeeklyResult[]>([]);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const { currentWeek } = useCurrentWeek();
  const [currentWeekData, setCurrentWeekData] = useState<WeeklyResult | null>(null);

  useEffect(() => {
    loadWeeklyResults();
    
    // Auto-refresh every 30 seconds to get live updates
    const interval = setInterval(loadWeeklyResults, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadWeeklyResults = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_results')
        .select('*')
        .order('week_number', { ascending: false });

      if (error) throw error;
      setWeeklyResults(data || []);

      // Load special events from both special_events and weekly_events (for BB Arena)
      const [specialData, bbArenaData] = await Promise.all([
        supabase
          .from('special_events')
          .select(`
            week_number,
            event_type,
            description,
            contestants(name)
          `)
          .order('week_number', { ascending: false }),
        supabase
          .from('weekly_events')
          .select(`
            week_number,
            event_type,
            contestants(name)
          `)
          .eq('event_type', 'bb_arena_winner')
          .order('week_number', { ascending: false })
      ]);

      if (specialData.error) throw specialData.error;
      if (bbArenaData.error) throw bbArenaData.error;
      
      const mappedSpecialEvents = (specialData.data || []).map(event => ({
        week_number: event.week_number,
        event_type: event.event_type,
        description: event.description,
        houseguest_name: (event.contestants as any)?.name || 'Unknown'
      }));

      const mappedBBArenaEvents = (bbArenaData.data || []).map(event => ({
        week_number: event.week_number,
        event_type: 'bb_arena_winner',
        description: 'BB Arena Winner',
        houseguest_name: (event.contestants as any)?.name || 'Unknown'
      }));
      
      setSpecialEvents([...mappedSpecialEvents, ...mappedBBArenaEvents]);
      
      // Find the current week data or create placeholder
      const currentWeekResult = data?.find(week => week.week_number === currentWeek);
      setCurrentWeekData(currentWeekResult || {
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
        is_draft: true
      });
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
                 <div className="flex flex-wrap gap-2">
                   {specialEvents
                     .filter(event => event.week_number === currentWeekData.week_number)
                     .map((event, index) => (
                       <Badge key={index} variant="outline" className="text-xs">
                         <span className="font-medium">{event.houseguest_name}</span>: {getEventDisplayText(event.event_type, event.description)}
                       </Badge>
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
                      <div>
                        <span className="font-medium">Special Events: </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-1">
                          {specialEvents
                            ?.filter(event => event.week_number === week.week_number)
                            .map((event, index) => (
                              <div key={index} className="bg-purple-50 p-2 rounded border-l-2 border-purple-200">
                                <span className="font-medium">{event.houseguest_name}</span>: {getEventDisplayText(event.event_type, event.description)}
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