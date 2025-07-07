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

      // Load weekly results to get the actual event data that was recorded
      const { data: completedWeeks, error: weeklyResultsError } = await supabase
        .from('weekly_results')
        .select(`
          week_number,
          hoh_winner,
          pov_winner,
          evicted_contestant,
          nominees,
          replacement_nominee,
          pov_used,
          pov_used_on,
          is_double_eviction,
          second_hoh_winner,
          second_pov_winner,
          second_evicted_contestant,
          second_nominees,
          second_replacement_nominee,
          second_pov_used,
          second_pov_used_on
        `)
        .eq('pool_id', activePool.id)
        .eq('is_draft', false)
        .order('week_number', { ascending: true });

      // Load contestants
      const { data: contestants, error: contestantsError } = await supabase
        .from('contestants')
        .select('id, name')
        .eq('pool_id', activePool.id)
        .eq('is_active', true);

      // Load scoring rules
      const { data: rawScoringRules, error: scoringRulesError } = await supabase
        .from('detailed_scoring_rules')
        .select('*')
        .eq('is_active', true);

      // Load special events
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

      // Load BB Arena events
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

      if (weeklyResultsError || contestantsError || scoringRulesError || specialError || bbArenaError) {
        throw weeklyResultsError || contestantsError || scoringRulesError || specialError || bbArenaError;
      }

      // Transform scoring rules to match the expected format
      const scoringRules = (rawScoringRules || []).map(rule => ({
        ...rule,
        created_at: new Date(rule.created_at)
      }));

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

      // Import the points calculation logic from weeklyEventsUtils
      const { calculatePoints } = await import('@/utils/weeklyEventsUtils');

      // Calculate scores by week using the same logic as Weekly Events Preview
      const scoresByWeek: Record<number, ContestantScore[]> = {};
      const cumulativeScores: Record<string, number> = {};

      // Process each completed week
      (completedWeeks || []).forEach(weekResult => {
        const weekNumber = weekResult.week_number;
        const weekContestantScores: Record<string, number> = {};

        // Initialize all contestants with 0 points for this week
        (contestants || []).forEach(contestant => {
          weekContestantScores[contestant.name] = 0;
        });

        // Calculate points using the same logic as Weekly Events Preview
        
        // HOH points
        if (weekResult.hoh_winner) {
          weekContestantScores[weekResult.hoh_winner] += calculatePoints('hoh_winner', undefined, scoringRules);
        }
        
        // POV points
        if (weekResult.pov_winner) {
          weekContestantScores[weekResult.pov_winner] += calculatePoints('pov_winner', undefined, scoringRules);
        }
        
        // POV used on someone points
        if (weekResult.pov_used && weekResult.pov_used_on) {
          weekContestantScores[weekResult.pov_used_on] += calculatePoints('pov_used_on', undefined, scoringRules);
        }
        
        // Nominee points
        if (weekResult.nominees) {
          weekResult.nominees.forEach(nominee => {
            if (nominee && weekContestantScores[nominee] !== undefined) {
              weekContestantScores[nominee] += calculatePoints('nominee', undefined, scoringRules);
            }
          });
        }
        
        // Replacement nominee points
        if (weekResult.replacement_nominee) {
          weekContestantScores[weekResult.replacement_nominee] += calculatePoints('replacement_nominee', undefined, scoringRules);
        }

        // Double eviction second round points
        if (weekResult.is_double_eviction) {
          if (weekResult.second_hoh_winner) {
            weekContestantScores[weekResult.second_hoh_winner] += calculatePoints('hoh_winner', undefined, scoringRules);
          }
          if (weekResult.second_pov_winner) {
            weekContestantScores[weekResult.second_pov_winner] += calculatePoints('pov_winner', undefined, scoringRules);
          }
          if (weekResult.second_pov_used && weekResult.second_pov_used_on) {
            weekContestantScores[weekResult.second_pov_used_on] += calculatePoints('pov_used_on', undefined, scoringRules);
          }
          if (weekResult.second_nominees) {
            weekResult.second_nominees.forEach(nominee => {
              if (nominee && weekContestantScores[nominee] !== undefined) {
                weekContestantScores[nominee] += calculatePoints('nominee', undefined, scoringRules);
              }
            });
          }
          if (weekResult.second_replacement_nominee) {
            weekContestantScores[weekResult.second_replacement_nominee] += calculatePoints('replacement_nominee', undefined, scoringRules);
          }
        }

        // Get evicted contestants up to this week for survival calculation
        const evictedUpToThisWeek = (completedWeeks || [])
          .filter(wr => wr.week_number <= weekNumber)
          .flatMap(wr => [wr.evicted_contestant, wr.second_evicted_contestant])
          .filter(Boolean);

        // Calculate current week evictions
        const evictedThisWeek = [weekResult.evicted_contestant, weekResult.second_evicted_contestant].filter(Boolean);

        // Survival points for non-evicted contestants
        (contestants || []).forEach(contestant => {
          if (!evictedThisWeek.includes(contestant.name) && !evictedUpToThisWeek.includes(contestant.name)) {
            weekContestantScores[contestant.name] += calculatePoints('survival', undefined, scoringRules);
          }
        });

        // Special events points for this week
        allSpecialEvents
          ?.filter(event => event.week_number === weekNumber)
          .forEach(event => {
            const contestantName = (event.contestants as any)?.name;
            if (contestantName && weekContestantScores[contestantName] !== undefined) {
              weekContestantScores[contestantName] += calculatePoints(event.event_type, event.points_awarded, scoringRules);
            }
          });

        // Convert to ContestantScore format with cumulative totals
        const weekScores: ContestantScore[] = Object.entries(weekContestantScores)
          .map(([name, weeklyTotal]) => {
            cumulativeScores[name] = (cumulativeScores[name] || 0) + weeklyTotal;
            return {
              name,
              weeklyTotal,
              cumulativeTotal: cumulativeScores[name]
            };
          });

        scoresByWeek[weekNumber] = weekScores.sort((a, b) => b.weeklyTotal - a.weeklyTotal);
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