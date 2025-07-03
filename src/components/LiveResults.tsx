import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Crown, Shield, Users, Ban, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatEventType, getEventDisplayText } from '@/utils/eventFormatters';

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

  useEffect(() => {
    loadWeeklyResults();
  }, []);

  const loadWeeklyResults = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_results')
        .select('*')
        .order('week_number', { ascending: false });

      if (error) throw error;
      setWeeklyResults(data || []);

      // Load special events
      const { data: specialData, error: specialError } = await supabase
        .from('special_events')
        .select(`
          week_number,
          event_type,
          description,
          contestants(name)
        `)
        .order('week_number', { ascending: false });

      if (specialError) throw specialError;
      
      const mappedSpecialEvents = (specialData || []).map(event => ({
        week_number: event.week_number,
        event_type: event.event_type,
        description: event.description,
        houseguest_name: (event.contestants as any)?.name || 'Unknown'
      }));
      
      setSpecialEvents(mappedSpecialEvents);
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
      {weeklyResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Week {weeklyResults[0].week_number} - {weeklyResults[0].is_draft ? 'In Progress' : 'Latest Results'}
              <div className="flex gap-2 ml-auto">
                {weeklyResults[0].is_double_eviction && (
                  <Badge variant="destructive">Double Eviction</Badge>
                )}
                {weeklyResults[0].is_triple_eviction && (
                  <Badge variant="destructive">Triple Eviction</Badge>
                )}
                {weeklyResults[0].jury_phase_started && (
                  <Badge className="bg-purple-500">Jury Started</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-semibold text-yellow-800">Head of Household</h4>
                <p className="text-xl font-bold text-yellow-900">
                  {weeklyResults[0].hoh_winner || "TBD"}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-800">Power of Veto</h4>
                <p className="text-xl font-bold text-blue-900">
                  {weeklyResults[0].pov_winner || "TBD"}
                </p>
                {weeklyResults[0].pov_used && (
                  <p className="text-sm text-blue-600 mt-1">
                    Used on {weeklyResults[0].pov_used_on}
                  </p>
                )}
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold text-orange-800">Nominees</h4>
                <p className="text-sm font-bold text-orange-900">
                  {weeklyResults[0].nominees?.join(', ') || "TBD"}
                </p>
                {weeklyResults[0].replacement_nominee && (
                  <p className="text-xs text-orange-600 mt-1">
                    Replacement: {weeklyResults[0].replacement_nominee}
                  </p>
                )}
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <Users className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-red-800">Evicted</h4>
                <p className="text-xl font-bold text-red-900">
                  {weeklyResults[0].evicted_contestant || "TBD"}
                </p>
              </div>
            </div>

            {/* Special Events for Current Week */}
            {specialEvents.filter(event => event.week_number === weeklyResults[0].week_number).length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Special Events This Week</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {specialEvents
                    .filter(event => event.week_number === weeklyResults[0].week_number)
                    .map((event, index) => (
                      <div key={index} className="bg-purple-50 p-2 rounded text-sm">
                        <span className="font-medium">{event.houseguest_name}</span>: {getEventDisplayText(event.event_type, event.description)}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Weekly Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Complete Season Results
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSpoilers(!showSpoilers)}
              className="flex items-center gap-2"
            >
              {showSpoilers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSpoilers ? 'Hide Spoilers' : 'Show Historical Results'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No results posted yet. Check back after the first week!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Head of Household</TableHead>
                    <TableHead>Power of Veto</TableHead>
                    <TableHead>Nominees</TableHead>
                    <TableHead>Evicted</TableHead>
                    <TableHead>Special Events</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyResults
                    .filter((week, index) => showSpoilers || index === 0)
                    .map((week) => (
                    <TableRow key={week.week_number}>
                      <TableCell className="font-bold">
                        <div className="flex items-center gap-2">
                          Week {week.week_number}
                          {week.is_double_eviction && <Badge variant="outline" className="text-xs">2x</Badge>}
                          {week.is_triple_eviction && <Badge variant="outline" className="text-xs">3x</Badge>}
                          {week.jury_phase_started && <Badge variant="outline" className="text-xs bg-purple-100">Jury</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {week.hoh_winner ? (
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-yellow-600 bg-yellow-100 rounded p-1" />
                            <span className="font-semibold text-yellow-800">{week.hoh_winner}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">TBD</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {week.pov_winner ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-600 bg-blue-100 rounded p-1" />
                              <span className="font-semibold text-blue-800">{week.pov_winner}</span>
                            </div>
                            {week.pov_used && (
                              <div className="text-xs text-blue-600">
                                Used on {week.pov_used_on}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">TBD</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {week.nominees?.length ? (
                          <div className="text-sm">
                            {week.nominees.map((nominee, index) => (
                              <div key={index} className="flex items-center gap-1">
                                {week.pov_used && week.pov_used_on === nominee ? (
                                  <>
                                    <span className="line-through text-gray-500">{nominee}</span>
                                    <Ban className="h-3 w-3 text-blue-500" />
                                  </>
                                ) : (
                                  <span>{nominee}</span>
                                )}
                              </div>
                            )).reduce((prev, curr, index) => index === 0 ? [curr] : [...prev, ', ', curr], [])}
                            {week.replacement_nominee && (
                              <div className="text-xs text-orange-600 mt-1">
                                +{week.replacement_nominee}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">TBD</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {week.evicted_contestant ? (
                          <Badge variant="destructive">
                            {week.evicted_contestant}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">TBD</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {specialEvents.filter(event => event.week_number === week.week_number).length > 0 ? (
                          <div className="text-xs space-y-1">
                            {specialEvents
                              .filter(event => event.week_number === week.week_number)
                              .slice(0, 2)
                              .map((event, index) => (
                                <div key={index} className="bg-purple-100 px-2 py-1 rounded">
                                  {event.houseguest_name}: {getEventDisplayText(event.event_type, event.description)}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          week.hoh_winner && week.pov_winner && week.evicted_contestant && !week.is_draft
                            ? "default"
                            : "secondary"
                        }>
                          {week.is_draft ? "In Progress" : 
                           week.hoh_winner && week.pov_winner && week.evicted_contestant
                            ? "Complete"
                            : "In Progress"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};