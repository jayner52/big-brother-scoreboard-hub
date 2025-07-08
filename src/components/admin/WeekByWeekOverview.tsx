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
          second_pov_used_on,
          ai_arena_winner,
          third_evicted_contestant,
          is_triple_eviction,
          jury_phase_started
        `)
        .eq('pool_id', activePool.id)
        .eq('is_draft', false)
        .order('week_number', { ascending: true });

      // Load contestants
      const { data: contestants, error: contestantsError } = await supabase
        .from('contestants')
        .select('id, name, is_active')
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
      const { getPointsPreview, calculatePoints } = await import('@/utils/weeklyEventsUtils');

      // Calculate scores by week using the same logic as Weekly Events Preview
      const scoresByWeek: Record<number, ContestantScore[]> = {};
      const cumulativeScores: Record<string, number> = {};

      // Process each completed week
      (completedWeeks || []).forEach(weekResult => {
        const weekNumber = weekResult.week_number;
        
        // Convert weekly_results to WeeklyEventForm format
        const eventForm = {
          hohWinner: weekResult.hoh_winner || '',
          povWinner: weekResult.pov_winner || '',
          povUsed: weekResult.pov_used || false,
          povUsedOn: weekResult.pov_used_on || '',
          nominees: weekResult.nominees || [],
          replacementNominee: weekResult.replacement_nominee || '',
          evicted: weekResult.evicted_contestant || '',
          aiArenaWinner: weekResult.ai_arena_winner || '',
          isDoubleEviction: weekResult.is_double_eviction || false,
          secondHohWinner: weekResult.second_hoh_winner || '',
          secondPovWinner: weekResult.second_pov_winner || '',
          secondPovUsed: weekResult.second_pov_used || false,
          secondPovUsedOn: weekResult.second_pov_used_on || '',
          secondNominees: weekResult.second_nominees || [],
          secondReplacementNominee: weekResult.second_replacement_nominee || '',
          secondEvicted: weekResult.second_evicted_contestant || '',
          thirdEvicted: weekResult.third_evicted_contestant || '',
          isTripleEviction: weekResult.is_triple_eviction || false,
          isJuryPhase: weekResult.jury_phase_started || false,
          specialEvents: []
        };

        // Get evicted contestants up to the previous week (not including this week)
        const evictedUpToPreviousWeek = (completedWeeks || [])
          .filter(wr => wr.week_number < weekNumber)
          .flatMap(wr => [wr.evicted_contestant, wr.second_evicted_contestant, wr.third_evicted_contestant])
          .filter(Boolean);

        // Add special events to the form
        const weekSpecialEvents = allSpecialEvents?.filter(event => event.week_number === weekNumber) || [];
        eventForm.specialEvents = weekSpecialEvents.map(event => ({
          contestant: (event.contestants as any)?.name || '',
          eventType: event.event_type,
          customPoints: event.points_awarded
        }));

        // Transform contestants to match ContestantWithBio interface
        const transformedContestants = (contestants || []).map(c => ({
          ...c,
          isActive: c.is_active
        }));

        // Use the exact same calculation as Weekly Events Preview
        const weekContestantScores = getPointsPreview(
          eventForm as any,
          transformedContestants as any,
          evictedUpToPreviousWeek,
          scoringRules
        );

        console.log(`Week ${weekNumber} points calculation:`, {
          eventForm,
          evictedUpToPreviousWeek,
          weekContestantScores
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