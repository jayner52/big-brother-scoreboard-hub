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
import { evaluateBonusAnswer, formatBonusAnswer, formatCorrectAnswers } from '@/utils/bonusQuestionUtils';

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
          <div className="grid gap-4">
            {enhancedPoolEntries.map((entry) => (
              <div key={entry.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Team Info */}
                  <div className="lg:w-48 flex-shrink-0">
                    <div className="font-semibold text-lg">{entry.participant_name}</div>
                    <div className="text-blue-600 font-medium">{entry.team_name}</div>
                    <Badge variant={entry.payment_confirmed ? "default" : "destructive"} className="mt-1">
                      {entry.payment_confirmed ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                  
                  {/* Players Grid */}
                  <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {[entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5].map((player, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="font-medium text-sm mb-1">Player {index + 1}</div>
                          <div className="text-sm">{player}</div>
                          {houseguestPoints[player] !== undefined && (
                            <div className="text-xs text-blue-600 font-semibold mt-1">
                              {houseguestPoints[player]} pts
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Total Points */}
                    <div className="mt-3 text-right">
                      <span className="text-lg font-bold text-green-600">
                        Total: {entry.totalPoints} pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{question.question_text}</h4>
                  <Badge variant="outline">{question.points_value} pts</Badge>
                </div>
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
                         const answer = entry.bonus_answers[question.id];
                         const displayAnswer = formatBonusAnswer(answer, question.question_type) || "No answer";
                         
                         // Check if answer is correct using proper evaluation
                         const isCorrect = question.answer_revealed && question.correct_answer 
                           ? evaluateBonusAnswer(answer, question.correct_answer, question.question_type)
                           : null;
                         
                         return (
                           <TableRow key={entry.id}>
                             <TableCell className="font-semibold">{entry.team_name}</TableCell>
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 <span className={isCorrect === true ? "text-green-600 font-semibold" : isCorrect === false ? "text-red-600" : ""}>
                                   {displayAnswer}
                                 </span>
                                 {isCorrect === true && <span className="text-green-600">✓</span>}
                                 {isCorrect === false && <span className="text-red-600">✗</span>}
                               </div>
                             </TableCell>
                             {question.answer_revealed && (
                               <TableCell className="text-green-600 font-semibold">
                                 {formatCorrectAnswers(question.correct_answer, question.question_type)}
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