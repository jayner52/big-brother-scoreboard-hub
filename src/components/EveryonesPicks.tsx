import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry, BonusQuestion } from '@/types/pool';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const EveryonesPicks: React.FC = () => {
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { houseguestPoints, loading: pointsLoading, error: pointsError } = useHouseguestPoints();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const [entriesResult, questionsResult] = await Promise.all([
        supabase.from('pool_entries').select('*').order('participant_name'),
        supabase.from('bonus_questions').select('*').eq('is_active', true).order('sort_order')
      ]);

      if (entriesResult.error) throw entriesResult.error;
      if (questionsResult.error) throw questionsResult.error;

      const mappedEntries = entriesResult.data?.map(entry => ({
        ...entry,
        bonus_answers: entry.bonus_answers as Record<string, any>,
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      })) || [];

      setPoolEntries(mappedEntries);
      
      // Map bonus questions to match our type interface
      const mappedQuestions = (questionsResult.data || []).map(q => ({
        ...q,
        question_type: q.question_type as 'player_select' | 'dual_player_select' | 'yes_no' | 'number'
      }));
      setBonusQuestions(mappedQuestions);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Memoize expensive calculations
  const enhancedPoolEntries = useMemo(() => {
    return poolEntries.map(entry => ({
      ...entry,
      totalPoints: [entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5]
        .reduce((sum, player) => sum + (houseguestPoints[player] || 0), 0)
    }));
  }, [poolEntries, houseguestPoints]);

  if (loading || pointsLoading) {
    return <div className="text-center py-8">Loading everyone's picks...</div>;
  }

  if (error || pointsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error || pointsError || 'Failed to load data'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      {/* Team Picks */}
      <Card>
        <CardHeader>
          <CardTitle>Team Selections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Player 1</TableHead>
                  <TableHead>Player 2</TableHead>
                  <TableHead>Player 3</TableHead>
                  <TableHead>Player 4</TableHead>
                  <TableHead>Player 5</TableHead>
                  <TableHead>Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enhancedPoolEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.participant_name}</TableCell>
                    <TableCell className="text-blue-600 font-semibold">{entry.team_name}</TableCell>
                    <TableCell>{entry.player_1} {houseguestPoints[entry.player_1] !== undefined && `(${houseguestPoints[entry.player_1]} pts)`}</TableCell>
                    <TableCell>{entry.player_2} {houseguestPoints[entry.player_2] !== undefined && `(${houseguestPoints[entry.player_2]} pts)`}</TableCell>
                    <TableCell>{entry.player_3} {houseguestPoints[entry.player_3] !== undefined && `(${houseguestPoints[entry.player_3]} pts)`}</TableCell>
                    <TableCell>{entry.player_4} {houseguestPoints[entry.player_4] !== undefined && `(${houseguestPoints[entry.player_4]} pts)`}</TableCell>
                    <TableCell>{entry.player_5} {houseguestPoints[entry.player_5] !== undefined && `(${houseguestPoints[entry.player_5]} pts)`}</TableCell>
                    <TableCell>
                      <Badge variant={entry.payment_confirmed ? "default" : "destructive"}>
                        {entry.payment_confirmed ? "Paid" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bonus Question Answers */}
      <Card>
        <CardHeader>
          <CardTitle>Bonus Question Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bonusQuestions.map((question) => (
              <div key={question.id} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{question.question_text}</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Answer</TableHead>
                        {question.answer_revealed && (
                          <TableHead className="text-green-600">Correct Answer</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {poolEntries.map((entry) => {
                        const isCorrect = question.answer_revealed && 
                          entry.bonus_answers[question.id] === question.correct_answer;
                        
                        return (
                          <TableRow key={entry.id}>
                            <TableCell className="font-semibold">{entry.team_name}</TableCell>
                            <TableCell className={question.answer_revealed ? (isCorrect ? "text-green-600 font-semibold" : "text-red-600") : ""}>
                              {entry.bonus_answers[question.id] || "No answer"}
                            </TableCell>
                            {question.answer_revealed && (
                              <TableCell className="text-green-600 font-semibold">
                                {question.correct_answer}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </ErrorBoundary>
  );
};