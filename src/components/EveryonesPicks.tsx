import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry, BonusQuestion } from '@/types/pool';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';
import { useActivePool } from '@/hooks/useActivePool';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, EyeOff } from 'lucide-react';
import { evaluateBonusAnswer, formatBonusAnswer, formatCorrectAnswers } from '@/utils/bonusQuestionUtils';
import { LockOverlay } from '@/components/ui/lock-overlay';

export const EveryonesPicks: React.FC = () => {
  const activePool = useActivePool();
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [contestants, setContestants] = useState<{name: string, isActive: boolean}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { houseguestPoints, loading: pointsLoading, error: pointsError } = useHouseguestPoints();

  useEffect(() => {
    if (activePool?.id) {
      loadData();
    }
  }, [activePool?.id]);

  const loadData = async () => {
    if (!activePool?.id) return;
    
    try {
      setError(null);
      setLoading(true);
      console.log('EveryonesPicks: Loading data for pool', activePool.id);
      
      const [entriesResult, questionsResult, contestantsResult] = await Promise.all([
        supabase.from('pool_entries').select('*').eq('pool_id', activePool.id).is('deleted_at', null).order('participant_name'),
        supabase.from('bonus_questions').select('*').eq('pool_id', activePool.id).eq('is_active', true).order('sort_order'),
        supabase.from('contestants').select('name, is_active').eq('pool_id', activePool.id)
      ]);

      if (entriesResult.error) throw entriesResult.error;
      if (questionsResult.error) throw questionsResult.error;
      if (contestantsResult.error) throw contestantsResult.error;

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
      
      // Set contestants data
      if (contestantsResult.data) {
        setContestants(contestantsResult.data.map(c => ({ name: c.name, isActive: c.is_active })));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Use pool_entries total_points instead of calculating from individual points
  const enhancedPoolEntries = useMemo(() => {
    return poolEntries.map(entry => ({
      ...entry,
      totalPoints: entry.total_points || 0
    }));
  }, [poolEntries]);

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

  // Check if picks should be hidden
  const picksAreHidden = activePool?.hide_picks_until_draft_closed || false;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      {/* Team Picks */}
      <LockOverlay
        isLocked={picksAreHidden}
        title="Picks Currently Hidden"
        message="Team selections will be revealed when the draft period closes. Check back later to see everyone's picks!"
      >
        <Card>
          <CardHeader>
            <CardTitle>Team Selections</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-3">
             {enhancedPoolEntries.map((entry) => (
               <div key={entry.id} className="bg-background border rounded-lg p-4 shadow-sm">
                 <div className="flex items-center gap-4">
                  {/* Team Info - more compact */}
                  <div className="flex-shrink-0 min-w-[140px]">
                    <div className="font-semibold text-base">{entry.participant_name}</div>
                    <div className="text-primary text-sm font-medium">{entry.team_name}</div>
                    <Badge variant={entry.payment_confirmed ? "default" : "destructive"} className="text-xs">
                      {entry.payment_confirmed ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                  
                   {/* Players - responsive layout for different team sizes */}
                   <div className={`flex-1 grid gap-3 ${
                     (activePool?.picks_per_team || 5) <= 5 ? 'grid-cols-5' :
                     (activePool?.picks_per_team || 5) <= 8 ? 'grid-cols-4' : 'grid-cols-3'
                   }`}>
                       {Array.from({ length: activePool?.picks_per_team || 5 }, (_, i) => {
                         const playerKey = `player_${i + 1}` as keyof typeof entry;
                         return entry[playerKey];
                       }).filter(Boolean).map((player, index) => {
                         // Find contestant to check if evicted
                         const contestant = contestants.find(c => c.name === player);
                         const isEvicted = contestant && !contestant.isActive;
                         
                         return (
                           <div key={index} className="bg-muted/50 rounded p-3 text-center min-h-[65px] flex flex-col justify-center">
                             <div className="text-xs text-muted-foreground mb-1">P{index + 1}</div>
                             <div className={`text-sm font-medium ${isEvicted ? 'text-red-600 line-through' : ''}`}>
                               {player as string}
                               {isEvicted && <span className="text-red-500 text-xs block">(Evicted)</span>}
                             </div>
                             {houseguestPoints[player as string] !== undefined && (
                               <div className="text-xs text-primary font-semibold">
                                 {houseguestPoints[player as string]}pts
                               </div>
                             )}
                           </div>
                         );
                       })}
                   </div>
                  
                  {/* Total Points - right aligned */}
                  <div className="flex-shrink-0 text-right min-w-[80px]">
                    <div className="text-lg font-bold text-green-600">
                      {entry.totalPoints}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </LockOverlay>

      {/* Bonus Question Answers */}
      <LockOverlay
        isLocked={picksAreHidden}
        title="Bonus Answers Hidden"
        message="Bonus question answers will be revealed when the draft period closes."
      >
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
      </LockOverlay>
      </div>
    </ErrorBoundary>
  );
};