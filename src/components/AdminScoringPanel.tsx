import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Contestant, BonusQuestion } from '@/types/pool';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ContestantManagement } from '@/components/admin/ContestantManagement';
import { WeeklyEventsPanel } from '@/components/admin/WeeklyEventsPanel';

export const AdminScoringPanel: React.FC = () => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [weeklyData, setWeeklyData] = useState({
    week: 1,
    hohWinner: '',
    povWinner: '',
    evicted: '',
    specialWinners: [] as string[],
  });

  const [bonusAnswers, setBonusAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load contestants
      const { data: contestantsData } = await supabase
        .from('contestants')
        .select('*')
        .order('name');
      
      const mappedContestants = contestantsData?.map(c => ({
        id: c.id,
        name: c.name,
        isActive: c.is_active,
        group_id: c.group_id,
        sort_order: c.sort_order
      })) || [];
      setContestants(mappedContestants);

      // Load bonus questions
      const { data: questionsData } = await supabase
        .from('bonus_questions')
        .select('*')
        .order('sort_order');
      
      const mappedQuestions = questionsData?.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type as 'player_select' | 'dual_player_select' | 'yes_no' | 'number',
        sort_order: q.sort_order,
        is_active: q.is_active,
        correct_answer: q.correct_answer,
        points_value: q.points_value,
        answer_revealed: q.answer_revealed
      })) || [];
      setBonusQuestions(mappedQuestions);

      // Initialize bonus answers with current values
      const initialAnswers: Record<string, any> = {};
      questionsData?.forEach(q => {
        if (q.correct_answer) {
          try {
            initialAnswers[q.id] = JSON.parse(q.correct_answer);
          } catch {
            initialAnswers[q.id] = q.correct_answer;
          }
        }
      });
      setBonusAnswers(initialAnswers);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWeeklyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Insert weekly results
      const { error: weeklyError } = await supabase
        .from('weekly_results')
        .insert({
          week_number: weeklyData.week,
          hoh_winner: weeklyData.hohWinner || null,
          pov_winner: weeklyData.povWinner || null,
          evicted_contestant: weeklyData.evicted || null,
        });

      if (weeklyError) throw weeklyError;

      // Update contestant status if someone was evicted
      if (weeklyData.evicted) {
        const { error: contestantError } = await supabase
          .from('contestants')
          .update({ is_active: false })
          .eq('name', weeklyData.evicted);

        if (contestantError) throw contestantError;
      }

      // Recalculate all team scores
      await recalculateScores();

      toast({
        title: "Success!",
        description: `Week ${weeklyData.week} results updated and scores recalculated`,
      });

      // Reset form
      setWeeklyData({
        week: weeklyData.week + 1,
        hohWinner: '',
        povWinner: '',
        evicted: '',
        specialWinners: [],
      });

    } catch (error) {
      console.error('Error updating weekly results:', error);
      toast({
        title: "Error",
        description: "Failed to update weekly results",
        variant: "destructive",
      });
    }
  };

  const handleBonusAnswer = async (questionId: string, answer: any, revealed: boolean) => {
    try {
      const { error } = await supabase
        .from('bonus_questions')
        .update({ 
          correct_answer: JSON.stringify(answer),
          answer_revealed: revealed 
        })
        .eq('id', questionId);

      if (error) throw error;

      setBonusAnswers(prev => ({ ...prev, [questionId]: answer }));
      
      // Update the question in state
      setBonusQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, correct_answer: JSON.stringify(answer), answer_revealed: revealed }
          : q
      ));

      if (revealed) {
        await recalculateScores();
      }

      toast({
        title: "Success!",
        description: "Bonus answer updated",
      });

    } catch (error) {
      console.error('Error updating bonus answer:', error);
      toast({
        title: "Error",
        description: "Failed to update bonus answer",
        variant: "destructive",
      });
    }
  };

  const recalculateScores = async () => {
    try {
      // Get all pool entries
      const { data: entries } = await supabase
        .from('pool_entries')
        .select('*');

      if (!entries) return;

      // Get all weekly results
      const { data: weeklyResults } = await supabase
        .from('weekly_results')
        .select('*');

      // Get revealed bonus questions
      const { data: revealedQuestions } = await supabase
        .from('bonus_questions')
        .select('*')
        .eq('answer_revealed', true);

      // Calculate scores for each entry
      for (const entry of entries) {
        let weeklyPoints = 0;
        let bonusPoints = 0;

        // Calculate weekly survival points (5 points per active player per week)
        const activePlayers = [entry.player_1, entry.player_2, entry.player_3, entry.player_4, entry.player_5];
        const activeCount = await getActivePlayerCount(activePlayers);
        const weekCount = weeklyResults?.length || 0;
        weeklyPoints = activeCount * 5 * weekCount;

        // Calculate competition points
        weeklyResults?.forEach(week => {
          if (activePlayers.includes(week.hoh_winner)) weeklyPoints += 10;
          if (activePlayers.includes(week.pov_winner)) weeklyPoints += 5;
        });

        // Calculate bonus points
        revealedQuestions?.forEach(question => {
          if (question.correct_answer && entry.bonus_answers[question.id]) {
            const correctAnswer = JSON.parse(question.correct_answer);
            const userAnswer = entry.bonus_answers[question.id];
            
            if (question.question_type === 'dual_player_select') {
              if (correctAnswer.player1 === userAnswer.player1 && correctAnswer.player2 === userAnswer.player2) {
                bonusPoints += question.points_value;
              }
            } else if (correctAnswer === userAnswer) {
              bonusPoints += question.points_value;
            }
          }
        });

        // Update entry
        await supabase
          .from('pool_entries')
          .update({
            weekly_points: weeklyPoints,
            bonus_points: bonusPoints,
            total_points: weeklyPoints + bonusPoints,
          })
          .eq('id', entry.id);
      }

    } catch (error) {
      console.error('Error recalculating scores:', error);
    }
  };

  const getActivePlayerCount = async (players: string[]) => {
    const { data } = await supabase
      .from('contestants')
      .select('name')
      .in('name', players)
      .eq('is_active', true);
    
    return data?.length || 0;
  };

  if (loading) {
    return <div className="text-center py-8">Loading admin panel...</div>;
  }

  const activeContestants = contestants.filter(c => c.isActive);

  return (
    <Card className="w-full max-w-4xl mx-auto mb-8">
      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
        <CardTitle className="text-xl">Admin Scoring Panel</CardTitle>
        <CardDescription className="text-green-100">
          Manage weekly results and bonus question answers
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="events">Weekly Events</TabsTrigger>
            <TabsTrigger value="contestants">Contestants</TabsTrigger>
            <TabsTrigger value="legacy">Legacy Scoring</TabsTrigger>
            <TabsTrigger value="bonus">Bonus Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <WeeklyEventsPanel />
          </TabsContent>

          <TabsContent value="contestants" className="space-y-4">
            <ContestantManagement />
          </TabsContent>

          <TabsContent value="legacy" className="space-y-4">
            <form onSubmit={handleWeeklyUpdate} className="space-y-4">
              <div>
                <Label htmlFor="week" className="font-semibold">Week Number</Label>
                <Input
                  id="week"
                  type="number"
                  min="1"
                  value={weeklyData.week}
                  onChange={(e) => setWeeklyData(prev => ({ ...prev, week: parseInt(e.target.value) || 1 }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="font-semibold">Head of Household Winner</Label>
                <Select value={weeklyData.hohWinner} onValueChange={(value) => setWeeklyData(prev => ({ ...prev, hohWinner: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select HOH winner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-winner">No winner this week</SelectItem>
                    {activeContestants.map(contestant => (
                      <SelectItem key={contestant.id} value={contestant.name}>
                        {contestant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-semibold">Power of Veto Winner</Label>
                <Select value={weeklyData.povWinner} onValueChange={(value) => setWeeklyData(prev => ({ ...prev, povWinner: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select POV winner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-winner">No winner this week</SelectItem>
                    {activeContestants.map(contestant => (
                      <SelectItem key={contestant.id} value={contestant.name}>
                        {contestant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-semibold">Evicted Contestant</Label>
                <Select value={weeklyData.evicted} onValueChange={(value) => setWeeklyData(prev => ({ ...prev, evicted: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select evicted contestant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-eviction">No eviction this week</SelectItem>
                    {activeContestants.map(contestant => (
                      <SelectItem key={contestant.id} value={contestant.name}>
                        {contestant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white">
                Update Week & Recalculate Scores
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="bonus" className="space-y-6">
            {bonusQuestions.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{question.question_text}</CardTitle>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{question.points_value} points</Badge>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={question.answer_revealed}
                        onCheckedChange={(checked) => 
                          handleBonusAnswer(question.id, bonusAnswers[question.id] || '', checked)
                        }
                      />
                      <Label>Revealed</Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {question.question_type === 'player_select' && (
                      <Select 
                        value={bonusAnswers[question.id] || ''} 
                        onValueChange={(value) => 
                          handleBonusAnswer(question.id, value, question.answer_revealed)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          {contestants.map(contestant => (
                            <SelectItem key={contestant.id} value={contestant.name}>
                              {contestant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {question.question_type === 'dual_player_select' && (
                      <div className="space-y-2">
                        <Select 
                          value={bonusAnswers[question.id]?.player1 || ''} 
                          onValueChange={(value) => 
                            handleBonusAnswer(question.id, { 
                              ...bonusAnswers[question.id], 
                              player1: value 
                            }, question.answer_revealed)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select first player" />
                          </SelectTrigger>
                          <SelectContent>
                            {contestants.map(contestant => (
                              <SelectItem key={contestant.id} value={contestant.name}>
                                {contestant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select 
                          value={bonusAnswers[question.id]?.player2 || ''} 
                          onValueChange={(value) => 
                            handleBonusAnswer(question.id, { 
                              ...bonusAnswers[question.id], 
                              player2: value 
                            }, question.answer_revealed)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select second player" />
                          </SelectTrigger>
                          <SelectContent>
                            {contestants.map(contestant => (
                              <SelectItem key={contestant.id} value={contestant.name}>
                                {contestant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {question.question_type === 'yes_no' && (
                      <div className="flex items-center space-x-4">
                        <Button
                          type="button"
                          variant={bonusAnswers[question.id] === 'yes' ? 'default' : 'outline'}
                          onClick={() => handleBonusAnswer(question.id, 'yes', question.answer_revealed)}
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={bonusAnswers[question.id] === 'no' ? 'default' : 'outline'}
                          onClick={() => handleBonusAnswer(question.id, 'no', question.answer_revealed)}
                        >
                          No
                        </Button>
                      </div>
                    )}

                    {question.question_type === 'number' && (
                      <Input
                        type="number"
                        value={bonusAnswers[question.id] || ''}
                        onChange={(e) => 
                          handleBonusAnswer(question.id, parseInt(e.target.value) || 0, question.answer_revealed)
                        }
                        placeholder="Enter correct number"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};