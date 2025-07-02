import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Shield, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WeekSummary {
  week_number: number;
  hoh_winner: string | null;
  pov_winner: string | null;
  evicted_contestant: string | null;
  is_double_eviction: boolean | null;
  second_hoh_winner: string | null;
  second_pov_winner: string | null;
  second_evicted_contestant: string | null;
}

interface ContestantScore {
  name: string;
  weeklyTotal: number;
  cumulativeTotal: number;
}

export const WeekByWeekOverview: React.FC = () => {
  const [weeklyResults, setWeeklyResults] = useState<WeekSummary[]>([]);
  const [contestantScores, setContestantScores] = useState<Record<number, ContestantScore[]>>({});
  const [specialEvents, setSpecialEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeekByWeekData();
  }, []);

const loadWeekByWeekData = async () => {
    try {
      // Load weekly results
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('weekly_results')
        .select('*')
        .order('week_number', { ascending: true });

      if (weeklyError) throw weeklyError;
      setWeeklyResults(weeklyData || []);

      // Load all weekly events and special events to calculate scores
      const { data: weeklyEvents, error: eventsError } = await supabase
        .from('weekly_events')
        .select(`
          week_number,
          contestant_id,
          event_type,
          points_awarded,
          contestants(name)
        `)
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
        .order('week_number', { ascending: true });

      if (eventsError || specialError) throw eventsError || specialError;

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
        specialEvents
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
      setSpecialEvents(specialEvents || []);

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
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <Crown className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-yellow-800">HOH</p>
                      <p className="font-bold text-yellow-900">{week.hoh_winner || "N/A"}</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Shield className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-blue-800">POV</p>
                      <p className="font-bold text-blue-900">{week.pov_winner || "N/A"}</p>
                      {week.second_pov_winner && (
                        <p className="text-xs text-blue-600">2nd: {week.second_pov_winner}</p>
                      )}
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <Users className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-orange-800">POV Used</p>
                      <p className="font-bold text-orange-900">
                        {week.second_pov_winner ? "Yes" : "No"}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <Users className="h-6 w-6 text-red-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-red-800">Evicted</p>
                      <p className="font-bold text-red-900">{week.evicted_contestant || "N/A"}</p>
                    </div>
                    {week.is_double_eviction && (
                      <div className="text-center p-3 bg-red-100 rounded-lg">
                        <Users className="h-6 w-6 text-red-700 mx-auto mb-1" />
                        <p className="text-sm font-medium text-red-900">2nd Evicted</p>
                        <p className="font-bold text-red-900">{week.second_evicted_contestant || "N/A"}</p>
                      </div>
                    )}
                  </div>

                   {/* Points Summary for this week - show all surviving contestants */}
                  {contestantScores[week.week_number] && (
                    <div>
                      <h4 className="font-medium mb-2">Points Earned This Week (All Survivors)</h4>
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