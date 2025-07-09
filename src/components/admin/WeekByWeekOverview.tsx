
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePool } from '@/contexts/PoolContext';
import { ResultTile } from './weekly-overview/ResultTile';
import { PointsEarnedSection } from './weekly-overview/PointsEarnedSection';
import { DoubleEvictionDisplay } from './weekly-overview/DoubleEvictionDisplay';
import { InstructionAccordion } from './InstructionAccordion';
import { getScoringRuleEmoji } from '@/utils/scoringCategoryEmojis';
import { useScoringRules } from '@/hooks/useScoringRules';

interface WeekSummary {
  week_number: number;
  hoh_winner: string | null;
  pov_winner: string | null;
  evicted_contestant: string | null;
  is_double_eviction: boolean | null;
  is_triple_eviction?: boolean | null;
  second_hoh_winner: string | null;
  second_pov_winner: string | null;
  second_evicted_contestant: string | null;
  third_evicted_contestant?: string | null;
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

interface SpecialEvent {
  week_number: number;
  contestant_name: string;
  event_type: string;
  description?: string;
  points_awarded: number;
}

export const WeekByWeekOverview: React.FC = () => {
  const { activePool } = usePool();
  const { scoringRules } = useScoringRules();
  const [weeklyResults, setWeeklyResults] = useState<WeekSummary[]>([]);
  const [contestantScores, setContestantScores] = useState<Record<number, ContestantScore[]>>({});
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [contestants, setContestants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get proper event details from scoring rules
  const getEventDetails = (eventType: string, customDescription?: string) => {
    // For custom events, use the custom description
    if (eventType === 'custom_event' || eventType === 'custom') {
      return {
        name: customDescription || 'Custom Event',
        emoji: '✨',
        points: null // Will use the actual points from the event
      };
    }

    // Find the scoring rule for this event type
    const rule = scoringRules.find(r => 
      r.id === eventType || 
      r.subcategory === eventType || 
      (r.category === 'special_events' && r.subcategory === eventType)
    );

    if (rule) {
      const emoji = getScoringRuleEmoji(rule.category, rule.subcategory, rule.emoji);
      return {
        name: rule.description || rule.subcategory?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        emoji,
        points: rule.points
      };
    }

    // Fallback for unknown event types
    return {
      name: eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      emoji: '📝',
      points: null
    };
  };

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

      // Load contestants
      const { data: contestants, error: contestantsError } = await supabase
        .from('contestants')
        .select('id, name, is_active')
        .eq('pool_id', activePool.id);

      if (contestantsError) throw contestantsError;
      setContestants(contestants || []);

      // Load scoring rules
      const { data: rawScoringRules, error: scoringRulesError } = await supabase
        .from('detailed_scoring_rules')
        .select('*')
        .eq('is_active', true);

      if (scoringRulesError) throw scoringRulesError;

      // Transform scoring rules to match the expected interface
      const transformedScoringRules = (rawScoringRules || []).map(rule => ({
        ...rule,
        created_at: new Date(rule.created_at)
      }));

      // Load ALL special events for this pool with proper deduplication
      const allSpecialEvents: SpecialEvent[] = [];
      const eventKeys = new Set<string>(); // Track unique events with week_number:contestant_name:event_type

      // 1. Load completed special events from special_events table
      const { data: dbSpecialEvents, error: dbSpecialError } = await supabase
        .from('special_events')
        .select(`
          week_number,
          event_type,
          description,
          points_awarded,
          contestant_id,
          contestants(name)
        `)
        .eq('pool_id', activePool.id)
        .order('week_number', { ascending: true });

      if (dbSpecialError) throw dbSpecialError;

      // Add database special events with deduplication
      if (dbSpecialEvents) {
        dbSpecialEvents.forEach(event => {
          const contestantName = (event.contestants as any)?.name || '';
          const eventKey = `${event.week_number}:${contestantName}:${event.event_type}`;
          
          if (!eventKeys.has(eventKey)) {
            eventKeys.add(eventKey);
            allSpecialEvents.push({
              week_number: event.week_number,
              contestant_name: contestantName,
              event_type: event.event_type,
              description: event.description || '',
              points_awarded: event.points_awarded || 0
            });
          }
        });
      }

      // 2. Load all weekly results to extract BB Arena winners and draft special events
      const { data: allWeeklyResults, error: allWeeklyError } = await supabase
        .from('weekly_results')
        .select('week_number, ai_arena_winner, draft_special_events')
        .eq('pool_id', activePool.id);

      if (allWeeklyError) throw allWeeklyError;

      // Process each week's results
      if (allWeeklyResults) {
        allWeeklyResults.forEach(week => {
          // Add BB Arena winner as special event with deduplication
          if (week.ai_arena_winner) {
            const eventKey = `${week.week_number}:${week.ai_arena_winner}:bb_arena_winner`;
            if (!eventKeys.has(eventKey)) {
              eventKeys.add(eventKey);
              const bbArenaRule = rawScoringRules?.find(r => r.subcategory === 'bb_arena_winner');
              allSpecialEvents.push({
                week_number: week.week_number,
                contestant_name: week.ai_arena_winner,
                event_type: 'bb_arena_winner',
                description: 'BB Arena Winner',
                points_awarded: bbArenaRule?.points || 0
              });
            }
          }

          // Parse and add draft special events with deduplication
          if (week.draft_special_events) {
            try {
              const draftEvents = JSON.parse(week.draft_special_events);
              if (Array.isArray(draftEvents)) {
                draftEvents.forEach((event: any) => {
                  if (event.contestant && event.eventType) {
                    const eventKey = `${week.week_number}:${event.contestant}:${event.eventType}`;
                    
                    // Only add if we haven't seen this exact combination
                    if (!eventKeys.has(eventKey)) {
                      eventKeys.add(eventKey);
                      
                      // Get points from scoring rules - check both ID and subcategory
                      let eventPoints = event.customPoints;
                      if (eventPoints === undefined || eventPoints === null) {
                        // First try to find by ID (for new events)
                        let rule = rawScoringRules?.find(r => r.id === event.eventType);
                        // If not found, try subcategory (for legacy events)
                        if (!rule) {
                          rule = rawScoringRules?.find(r => r.subcategory === event.eventType);
                        }
                        eventPoints = rule?.points || 0;
                      }

                      allSpecialEvents.push({
                        week_number: week.week_number,
                        contestant_name: event.contestant,
                        event_type: event.eventType,
                        description: event.eventType === 'custom_event' ? event.customDescription : event.description,
                        points_awarded: eventPoints
                      });
                    }
                  }
                });
              }
            } catch (error) {
              console.error('Error parsing draft special events for week', week.week_number, error);
            }
          }
        });
      }

      // 3. Load BB Arena events from weekly_events with deduplication
      const { data: bbArenaEvents, error: bbArenaError } = await supabase
        .from('weekly_events')
        .select(`
          week_number,
          contestant_id,
          event_type,
          points_awarded,
          contestants(name)
        `)
        .eq('pool_id', activePool.id)
        .eq('event_type', 'bb_arena_winner')
        .order('week_number', { ascending: true });

      if (bbArenaError) throw bbArenaError;

      // Add BB Arena events with deduplication
      if (bbArenaEvents) {
        bbArenaEvents.forEach(event => {
          const contestantName = (event.contestants as any)?.name || '';
          const eventKey = `${event.week_number}:${contestantName}:bb_arena_winner`;
          
          if (!eventKeys.has(eventKey)) {
            eventKeys.add(eventKey);
            allSpecialEvents.push({
              week_number: event.week_number,
              contestant_name: contestantName,
              event_type: 'bb_arena_winner',
              description: 'BB Arena Winner',
              points_awarded: event.points_awarded || 0
            });
          }
        });
      }

      console.log('All special events loaded with deduplication:', allSpecialEvents);
      setSpecialEvents(allSpecialEvents);

      // Calculate scores by week using the same logic as Weekly Events Preview
      const { getPointsPreview } = await import('@/utils/weeklyEventsUtils');
      const scoresByWeek: Record<number, ContestantScore[]> = {};
      const cumulativeScores: Record<string, number> = {};

      // Process each completed week
      (weeklyData || []).forEach(weekResult => {
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

        // Get evicted contestants up to the previous week
        const evictedUpToPreviousWeek = (weeklyData || [])
          .filter(wr => wr.week_number < weekNumber)
          .flatMap(wr => [wr.evicted_contestant, wr.second_evicted_contestant, wr.third_evicted_contestant])
          .filter(Boolean);

        // Add special events for this week to the form
        const weekSpecialEvents = allSpecialEvents.filter(event => event.week_number === weekNumber);
        eventForm.specialEvents = weekSpecialEvents.map(event => ({
          contestant: event.contestant_name,
          eventType: event.event_type,
          customPoints: event.points_awarded
        }));

        // Transform contestants to match ContestantWithBio interface
        const transformedContestants = (contestants || []).map(c => ({
          ...c,
          isActive: c.is_active
        }));

        // Calculate points for this week
        const weekContestantScores = getPointsPreview(
          eventForm as any,
          transformedContestants as any,
          evictedUpToPreviousWeek,
          transformedScoringRules
        );

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
      <InstructionAccordion 
        title="Week by Week Overview" 
        tabKey="week_overview"
      >
        <div className="space-y-2">
          <p>View a read-only summary of all weekly results and point changes. To make changes, use the Weekly Events tab.</p>
          <p><strong>What you can see here:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>All completed weeks with winners and evicted houseguests</li>
            <li>Point changes for each week broken down by contestant</li>
            <li>Special events like double evictions and AI Arena wins</li>
            <li>Running totals and weekly scoreboard updates</li>
          </ul>
          <p className="text-blue-700 font-medium">💡 This is for viewing only - edit results in the Weekly Events tab.</p>
        </div>
      </InstructionAccordion>
      
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
                   
                   {/* Display double/triple eviction or regular week */}
                   {week.is_double_eviction ? (
                     <DoubleEvictionDisplay 
                       week={week}
                       contestantScores={contestantScores[week.week_number]}
                       specialEvents={specialEvents}
                       allContestants={contestants?.map(c => ({ name: c.name, is_active: c.is_active })) || []}
                       evictedThisWeek={[week.evicted_contestant, week.second_evicted_contestant].filter(Boolean)}
                     />
                   ) : week.is_triple_eviction ? (
                     <div className="space-y-6">
                       {/* Triple Eviction Banner */}
                       <div className="text-center py-2 px-4 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg font-bold">
                         ⚡⚡ TRIPLE EVICTION NIGHT ⚡⚡
                       </div>
                       
                       {/* Triple eviction content would go here - for now show basic layout */}
                       <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                         <p className="text-red-800 font-medium">Triple Eviction Week</p>
                         <p className="text-sm text-red-600 mt-1">
                           Evicted: {[week.evicted_contestant, week.second_evicted_contestant, week.third_evicted_contestant].filter(Boolean).join(', ') || 'N/A'}
                         </p>
                       </div>
                       
                       {/* Points Section for triple eviction */}
                       <PointsEarnedSection 
                         weekNumber={week.week_number}
                         contestantScores={contestantScores[week.week_number]}
                         nominees={week.nominees || []}
                         replacementNominee={week.replacement_nominee}
                         povUsed={week.pov_used}
                         povUsedOn={week.pov_used_on}
                         specialEvents={specialEvents}
                         allContestants={contestants?.map(c => ({ name: c.name, is_active: c.is_active })) || []}
                         evictedThisWeek={[week.evicted_contestant, week.second_evicted_contestant, week.third_evicted_contestant].filter(Boolean)}
                       />
                     </div>
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

                      {/* Points Section */}
                      <PointsEarnedSection 
                        weekNumber={week.week_number}
                        contestantScores={contestantScores[week.week_number]}
                        nominees={week.nominees || []}
                        replacementNominee={week.replacement_nominee}
                        povUsed={week.pov_used}
                        povUsedOn={week.pov_used_on}
                        specialEvents={specialEvents}
                        allContestants={contestants?.map(c => ({ name: c.name, is_active: c.is_active })) || []}
                        evictedThisWeek={[week.evicted_contestant, week.second_evicted_contestant].filter(Boolean)}
                      />
                    </div>
                  )}

                  {/* Special Events for this week - Compact Display */}
                  {specialEvents?.filter(event => event.week_number === week.week_number).length > 0 && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-800">
                        <span className="text-purple-600">⚡</span>
                        Special Events
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {specialEvents
                          ?.filter(event => event.week_number === week.week_number)
                          .map((event, index) => {
                            const eventDetails = getEventDetails(event.event_type, event.description);
                            
                            // Fix points calculation: only use event.points_awarded if it's not null/undefined
                            // If it's 0, that's a valid value and should be used
                            // If it's null/undefined, look up from scoring rules
                            const actualPoints = event.points_awarded !== null && event.points_awarded !== undefined 
                              ? event.points_awarded 
                              : (eventDetails.points || 0);
                            
                            console.log(`Event: ${event.event_type}, DB Points: ${event.points_awarded}, Rule Points: ${eventDetails.points}, Using: ${actualPoints}`);
                            
                            return (
                              <div key={index} className="bg-white/80 p-2 rounded-md border border-purple-200/50 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-purple-900 text-sm">{event.contestant_name}</span>
                                  <Badge 
                                    variant={actualPoints > 0 ? "default" : actualPoints < 0 ? "destructive" : "secondary"} 
                                    className="text-xs"
                                  >
                                    {actualPoints > 0 ? '+' : ''}{actualPoints} pts
                                  </Badge>
                                </div>
                                <div className="text-purple-700 text-xs flex items-center gap-1">
                                  <span>{eventDetails.emoji}</span>
                                  <span>{eventDetails.name}</span>
                                </div>
                              </div>
                            );
                          })}
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
