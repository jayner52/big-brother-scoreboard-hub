import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Shield, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WeeklyResult {
  week_number: number;
  hoh_winner: string | null;
  pov_winner: string | null;
  evicted_contestant: string | null;
}

export const LiveResults: React.FC = () => {
  const [weeklyResults, setWeeklyResults] = useState<WeeklyResult[]>([]);
  const [loading, setLoading] = useState(true);

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
              Week {weeklyResults[0].week_number} - Latest Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <Users className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-red-800">Evicted</h4>
                <p className="text-xl font-bold text-red-900">
                  {weeklyResults[0].evicted_contestant || "TBD"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Weekly Results */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Season Results</CardTitle>
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
                    <TableHead>Evicted</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyResults.map((week) => (
                    <TableRow key={week.week_number}>
                      <TableCell className="font-bold">
                        Week {week.week_number}
                      </TableCell>
                      <TableCell>
                        {week.hoh_winner ? (
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{week.hoh_winner}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">TBD</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {week.pov_winner ? (
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold">{week.pov_winner}</span>
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
                        <Badge variant={
                          week.hoh_winner && week.pov_winner && week.evicted_contestant
                            ? "default"
                            : "secondary"
                        }>
                          {week.hoh_winner && week.pov_winner && week.evicted_contestant
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

      {/* Scoring Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Scoring System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Competition Points</h4>
              <ul className="space-y-1">
                <li>• Head of Household: <span className="font-bold">3 points</span></li>
                <li>• Power of Veto: <span className="font-bold">3 points</span></li>
                <li>• Being Nominated: <span className="font-bold">1 point</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Other Points</h4>
              <ul className="space-y-1">
                <li>• Survival (per week): <span className="font-bold">1 point</span></li>
                <li>• Making Jury: <span className="font-bold">2 points</span></li>
                <li>• Prize Won: <span className="font-bold">2 points</span></li>
                <li>• Punishment: <span className="font-bold">-1 points</span></li>
                <li>• Bonus Questions: <span className="font-bold">1-10 points</span></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};