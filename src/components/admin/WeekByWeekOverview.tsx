import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users } from 'lucide-react';
import { BigBrotherIcon } from '@/components/BigBrotherIcons';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';

interface WeekSummary {
  week_number: number;
  hoh_winner: string | null;
  pov_winner: string | null;
  evicted_contestant: string | null;
  is_double_eviction: boolean | null;
  second_hoh_winner: string | null;
  second_pov_winner: string | null;
  second_evicted_contestant: string | null;
  pov_used: boolean | null;
  pov_used_on: string | null;
  nominees: string[] | null;
  replacement_nominee: string | null;
}

interface ContestantScore {
  name: string;
  weeklyTotal: number;
  cumulativeTotal: number;
}

export const WeekByWeekOverview: React.FC = () => {
  const { activePool } = usePool();
  const [weeklyResults, setWeeklyResults] = useState<WeekSummary[]>([]);
  const [contestantScores, setContestantScores] = useState<Record<number, ContestantScore[]>>({});
  const [specialEvents, setSpecialEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeekByWeekData();
  }, []);

const loadWeekByWeekData = async () => {
    if (!activePool?.id) return;
    
    try {
      // Load weekly results for this pool only
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('weekly_results')
        .select('*')
        .eq('pool_id', activePool.id)
        .order('week_number', { ascending: true });

      if (weeklyError) throw weeklyError;
      setWeeklyResults(weeklyData || []);

      // Load all weekly events and special events to calculate scores (pool-specific)
      const { data: weeklyEvents, error: eventsError } = await supabase
        .from('weekly_events')
        .select(`
          week_number,
          contestant_id,
          event_type,
          points_awarded,
          contestants(name)
        `)
        .eq('pool_id', activePool.id)
        .order('week_number', { ascending: true });

      const { data: specialEvents, error: specialError } = await supabase
        .from('special_events')
        .select(`
          week_number,
          contestant_id,
          event_type,
          description,
          points_awarded,
          contestants(name)
        `)
        .eq('pool_id', activePool.id)
        .order('week_number', { ascending: true });

      // Load BB Arena winners from weekly_events (pool-specific)
      const { data: bbArenaEvents, error: bbArenaError } = await supabase
        .from('weekly_events')
        .select(`
          week_number,
          contestant_id,
          event_type,
          contestants(name)
        `)
        .eq('pool_id', activePool.id)
        .eq('event_type', 'bb_arena_winner')
        .order('week_number', { ascending: true });

      if (eventsError || specialError || bbArenaError) throw eventsError || specialError || bbArenaError;

      // Combine special events with BB Arena events
      const allSpecialEvents = [
        ...(specialEvents || []),
        ...(bbArenaEvents || []).map(event => ({
          ...event,
          event_type: 'bb_arena_winner',
          description: 'BB Arena Winner',
          points_awarded: 0
        }))
      ];

      // Calculate scores by week
      const scoresByWeek: Record<number, ContestantScore[]> = {};
      const cumulativeScores: Record<string, number> = {};

      // Process all weeks
      const allWeeks = [...new Set([
        ...(weeklyEvents || []).map(e => e.week_number),
        ...(specialEvents || []).map(e => e.week_number)
      ])].sort((a, b) => a - b);

      allWeeks.forEach(weekNumber => {
        const weekContestantScores: Record<string, number> = {};

        // Add weekly event points
        weeklyEvents
          ?.filter(event => event.week_number === weekNumber)
          .forEach(event => {
            const contestantName = (event.contestants as any)?.name;
            if (contestantName) {
              weekContestantScores[contestantName] = (weekContestantScores[contestantName] || 0) + (event.points_awarded || 0);
            }
          });

        // Add special event points
        allSpecialEvents
          ?.filter(event => event.week_number === weekNumber)
          .forEach(event => {
            const contestantName = (event.contestants as any)?.name;
            if (contestantName) {
              weekContestantScores[contestantName] = (weekContestantScores[contestantName] || 0) + (event.points_awarded || 0);
            }
          });

        // Convert to ContestantScore format with cumulative totals
        const weekScores: ContestantScore[] = Object.entries(weekContestantScores).map(([name, weeklyTotal]) => {
          cumulativeScores[name] = (cumulativeScores[name] || 0) + weeklyTotal;
          return {
            name,
            weeklyTotal,
            cumulativeTotal: cumulativeScores[name]
          };
        });

        scoresByWeek[weekNumber] = weekScores.sort((a, b) => b.cumulativeTotal - a.cumulativeTotal);
      });

      setContestantScores(scoresByWeek);

      // Store special events for use in component
      setSpecialEvents(allSpecialEvents || []);

    } catch (error) {
      console.error('Error loading week by week data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading week by week overview...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            Week by Week Results Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No results recorded yet. Check back after the first week!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {weeklyResults.map((week) => (
                <div key={week.week_number} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Week {week.week_number}</h3>
                    {week.is_double_eviction && (
                      <Badge variant="destructive">Double Eviction</Badge>
                    )}
                  </div>
                  
                   {/* Week Summary */}
                   <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                     <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                       <BigBrotherIcon type="hoh" className="h-6 w-6 mx-auto mb-1" />
                       <p className="text-sm font-medium text-yellow-800">HOH</p>
                       <p className="font-bold text-yellow-900">{week.hoh_winner || "N/A"}</p>
                     </div>
                     <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                       <BigBrotherIcon type="pov" className="h-6 w-6 mx-auto mb-1" />
                       <p className="text-sm font-medium text-green-800">POV</p>
                       <p className="font-bold text-green-900">{week.pov_winner || "N/A"}</p>
                       {week.second_pov_winner && (
                         <p className="text-xs text-green-600">2nd: {week.second_pov_winner}</p>
                       )}
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
                     {week.is_double_eviction && (
                       <div className="text-center p-3 bg-red-100 rounded-lg border border-red-300">
                         <BigBrotherIcon type="evicted" className="h-6 w-6 mx-auto mb-1" />
                         <p className="text-sm font-medium text-red-900">2nd Evicted</p>
                         <p className="font-bold text-red-900">{week.second_evicted_contestant || "N/A"}</p>
                       </div>
                     )}
                   </div>

                   {/* Points Summary for this week */}
                  {contestantScores[week.week_number] && (
                    <div>
                      <h4 className="font-medium mb-2">Points Earned This Week</h4>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                        {contestantScores[week.week_number]
                          .sort((a, b) => b.weeklyTotal - a.weeklyTotal)
                          .map((contestant) => (
                            <div key={contestant.name} className="flex justify-between bg-gray-50 p-2 rounded">
                              <span className="truncate">{contestant.name}</span>
                              <span className="font-bold text-green-600">+{contestant.weeklyTotal}</span>
                            </div>
                          ))}
                      </div>
                       <div className="text-xs text-gray-500 mt-1">
                         {(week.nominees || []).length > 0 && (
                           <div>
                             Nominees: {(week.nominees || []).map((nominee, index) => {
                               const isSavedByVeto = week.pov_used && week.pov_used_on === nominee;
                               const isSavedByArena = specialEvents.some(event => 
                                 event.week_number === week.week_number && 
                                 event.event_type === 'bb_arena_winner' && 
                                 (event.contestants as any)?.name === nominee
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
                       </div>
                    </div>
                  )}

                  {/* Special Events for this week */}
                  {specialEvents?.filter(event => event.week_number === week.week_number).length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Special Events</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {specialEvents
                          ?.filter(event => event.week_number === week.week_number)
                          .map((event, index) => (
                            <div key={index} className="bg-purple-50 p-2 rounded border-l-2 border-purple-200">
                              <span className="font-medium">{(event.contestants as any)?.name}</span>: {event.description || event.event_type.replace(/_/g, ' ')}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};