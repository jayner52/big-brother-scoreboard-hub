import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';
import { ResultTile } from './weekly-overview/ResultTile';
import { PointsEarnedSection } from './weekly-overview/PointsEarnedSection';
import { DoubleEvictionDisplay } from './weekly-overview/DoubleEvictionDisplay';

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
  second_nominees?: string[] | null;
  second_pov_used?: boolean | null;
  second_pov_used_on?: string | null;
  second_replacement_nominee?: string | null;
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
                   
                  {/* Display double eviction or regular week */}
                  {week.is_double_eviction ? (
                    <DoubleEvictionDisplay 
                      week={week}
                      contestantScores={contestantScores[week.week_number]}
                      specialEvents={specialEvents}
                    />
                  ) : (
                    <div className="space-y-4">
                      {/* Regular Week Summary with Nominees Tile */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ResultTile 
                          label="HOH" 
                          value={week.hoh_winner || "N/A"} 
                          iconType="hoh" 
                          colorScheme="yellow"
                        />
                        <ResultTile 
                          label="Nominees" 
                          value={
                            week.nominees && week.nominees.length > 0 
                              ? week.nominees.join(' & ')
                              : "N/A"
                          }
                          iconType="nominees"
                          colorScheme="orange"
                        />
                        <ResultTile 
                          label="POV" 
                          value={week.pov_winner || "N/A"} 
                          iconType="pov" 
                          colorScheme="green"
                          subtitle={week.pov_used ? `Used on ${week.pov_used_on}${week.replacement_nominee ? ` → ${week.replacement_nominee}` : ''}` : undefined}
                        />
                        <ResultTile 
                          label="Evicted" 
                          value={week.evicted_contestant || "N/A"} 
                          iconType="evicted" 
                          colorScheme="red"
                        />
                      </div>

                      {/* Points Section - Always show */}
                      <PointsEarnedSection 
                        weekNumber={week.week_number}
                        contestantScores={contestantScores[week.week_number]}
                        nominees={week.nominees || []}
                        replacementNominee={week.replacement_nominee}
                        povUsed={week.pov_used}
                        povUsedOn={week.pov_used_on}
                        specialEvents={specialEvents}
                      />
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