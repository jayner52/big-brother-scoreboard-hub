import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry, BonusQuestion } from '@/types/pool';

export const EveryonesPicksMatrix: React.FC = () => {
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [entriesResponse, questionsResponse] = await Promise.all([
        supabase
          .from('pool_entries')
          .select('*')
          .eq('payment_confirmed', true)
          .order('team_name'),
        supabase
          .from('bonus_questions')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')
      ]);

      if (entriesResponse.error) throw entriesResponse.error;
      if (questionsResponse.error) throw questionsResponse.error;

      const mappedEntries = entriesResponse.data?.map(entry => ({
        ...entry,
        bonus_answers: entry.bonus_answers as Record<string, any>,
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      })) || [];

      setPoolEntries(mappedEntries);
      setBonusQuestions(questionsResponse.data?.map(q => ({
        ...q,
        question_type: q.question_type as BonusQuestion['question_type'],
        created_at: new Date(q.created_at),
        updated_at: new Date(q.updated_at)
      })) || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnswerDisplay = (entry: PoolEntry, question: BonusQuestion) => {
    const answer = entry.bonus_answers[question.id];
    
    if (!answer) return <span className="text-muted-foreground">—</span>;
    
    if (question.question_type === 'dual_player_select' && typeof answer === 'object') {
      return (
        <div className="space-y-1">
          <div className="text-xs">{answer.player1}</div>
          <div className="text-xs">{answer.player2}</div>
        </div>
      );
    }
    
    return <span className="text-sm">{answer}</span>;
  };

  const getCorrectAnswerDisplay = (question: BonusQuestion) => {
    if (!question.answer_revealed || !question.correct_answer) {
      return <span className="text-muted-foreground font-medium">TBD</span>;
    }
    
    if (question.question_type === 'dual_player_select') {
      try {
        const parsed = JSON.parse(question.correct_answer);
        return (
          <div className="space-y-1">
            <div className="text-xs font-medium text-green-700">{parsed.player1}</div>
            <div className="text-xs font-medium text-green-700">{parsed.player2}</div>
          </div>
        );
      } catch {
        return <span className="text-sm font-medium text-green-700">{question.correct_answer}</span>;
      }
    }
    
    return <span className="text-sm font-medium text-green-700">{question.correct_answer}</span>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading everyone's picks...</div>;
  }

  if (bonusQuestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Everyone's Bonus Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No bonus questions available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Everyone's Bonus Predictions
          <Badge variant="secondary">{poolEntries.length} Teams</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="sticky left-0 bg-muted/50 border-r min-w-[200px] font-bold">
                  Question
                </TableHead>
                <TableHead className="text-center font-bold min-w-[120px] bg-green-50 border-r">
                  Correct Answer
                </TableHead>
                {poolEntries.map((entry) => (
                  <TableHead key={entry.id} className="text-center font-bold min-w-[120px] border-r">
                    <div className="space-y-1">
                      <div className="font-semibold">{entry.team_name}</div>
                      <div className="text-xs text-muted-foreground">{entry.participant_name}</div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bonusQuestions.map((question) => (
                <TableRow key={question.id} className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background border-r font-medium max-w-[200px]">
                    <div className="space-y-1">
                      <div className="text-sm">{question.question_text}</div>
                      <Badge variant="outline" className="text-xs">
                        {question.points_value} pts
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center bg-green-50 border-r">
                    {getCorrectAnswerDisplay(question)}
                  </TableCell>
                  {poolEntries.map((entry) => (
                    <TableCell key={entry.id} className="text-center border-r">
                      {getAnswerDisplay(entry, question)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};