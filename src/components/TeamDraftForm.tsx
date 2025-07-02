import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantGroup, BonusQuestion, PoolSettings } from '@/types/pool';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export const TeamDraftForm: React.FC = () => {
  const { toast } = useToast();
  const [poolSettings, setPoolSettings] = useState<PoolSettings | null>(null);
  const [contestantGroups, setContestantGroups] = useState<ContestantGroup[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    participant_name: '',
    team_name: '',
    player_1: '',
    player_2: '',
    player_3: '',
    player_4: '',
    player_5: '',
    bonus_answers: {} as Record<string, any>,
  });

  useEffect(() => {
    loadPoolData();
  }, []);

  const loadPoolData = async () => {
    try {
      // Load pool settings
      const { data: settings } = await supabase
        .from('pool_settings')
        .select('*')
        .single();
      
      if (settings) {
        const mappedSettings: PoolSettings = {
          id: settings.id,
          season_name: settings.season_name,
          entry_fee_amount: settings.entry_fee_amount,
          entry_fee_currency: settings.entry_fee_currency,
          payment_method_1: settings.payment_method_1,
          payment_details_1: settings.payment_details_1,
          payment_method_2: settings.payment_method_2,
          payment_details_2: settings.payment_details_2,
          registration_deadline: settings.registration_deadline,
          draft_open: settings.draft_open,
          season_active: settings.season_active
        };
        setPoolSettings(mappedSettings);
      }

      // Load contestant groups with contestants
      const { data: groups } = await supabase
        .from('contestant_groups')
        .select(`
          *,
          contestants (*)
        `)
        .order('sort_order');
      
      const mappedGroups = groups?.map(g => ({
        id: g.id,
        group_name: g.group_name,
        sort_order: g.sort_order,
        contestants: g.contestants?.map((c: any) => ({
          id: c.id,
          name: c.name,
          isActive: c.is_active,
          group_id: c.group_id,
          sort_order: c.sort_order
        })) || []
      })) || [];
      setContestantGroups(mappedGroups);

      // Load bonus questions
      const { data: questions } = await supabase
        .from('bonus_questions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      const mappedQuestions = questions?.map(q => ({
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

    } catch (error) {
      console.error('Error loading pool data:', error);
      toast({
        title: "Error",
        description: "Failed to load pool information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.participant_name.trim() || !formData.team_name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name and team name",
        variant: "destructive",
      });
      return;
    }

    const requiredPlayers = ['player_1', 'player_2', 'player_3', 'player_4', 'player_5'];
    const missingPlayers = requiredPlayers.filter(player => !formData[player as keyof typeof formData]);
    
    if (missingPlayers.length > 0) {
      toast({
        title: "Error",
        description: "Please select all 5 team members",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit your team",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('pool_entries')
        .insert({
          user_id: user.id,
          participant_name: formData.participant_name,
          team_name: formData.team_name,
          player_1: formData.player_1,
          player_2: formData.player_2,
          player_3: formData.player_3,
          player_4: formData.player_4,
          player_5: formData.player_5,
          bonus_answers: formData.bonus_answers,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your team has been submitted to the pool",
      });

      // Reset form
      setFormData({
        participant_name: '',
        team_name: '',
        player_1: '',
        player_2: '',
        player_3: '',
        player_4: '',
        player_5: '',
        bonus_answers: {},
      });

    } catch (error) {
      console.error('Error submitting team:', error);
      toast({
        title: "Error",
        description: "Failed to submit your team",
        variant: "destructive",
      });
    }
  };

  const updateBonusAnswer = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      bonus_answers: {
        ...prev.bonus_answers,
        [questionId]: value,
      },
    }));
  };

  const renderBonusQuestion = (question: BonusQuestion) => {
    const currentAnswer = formData.bonus_answers[question.id];

    switch (question.question_type) {
      case 'player_select':
        return (
          <Select 
            value={currentAnswer || ''} 
            onValueChange={(value) => updateBonusAnswer(question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a player" />
            </SelectTrigger>
            <SelectContent>
              {contestantGroups.flatMap(group => 
                group.contestants?.map(contestant => (
                  <SelectItem key={contestant.id} value={contestant.name}>
                    {contestant.name}
                  </SelectItem>
                )) || []
              )}
            </SelectContent>
          </Select>
        );

      case 'dual_player_select':
        return (
          <div className="space-y-2">
            <Select 
              value={currentAnswer?.player1 || ''} 
              onValueChange={(value) => updateBonusAnswer(question.id, { ...currentAnswer, player1: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select first player" />
              </SelectTrigger>
              <SelectContent>
                {contestantGroups.flatMap(group => 
                  group.contestants?.map(contestant => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  )) || []
                )}
              </SelectContent>
            </Select>
            <Select 
              value={currentAnswer?.player2 || ''} 
              onValueChange={(value) => updateBonusAnswer(question.id, { ...currentAnswer, player2: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select second player" />
              </SelectTrigger>
              <SelectContent>
                {contestantGroups.flatMap(group => 
                  group.contestants?.map(contestant => (
                    <SelectItem key={contestant.id} value={contestant.name}>
                      {contestant.name}
                    </SelectItem>
                  )) || []
                )}
              </SelectContent>
            </Select>
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentAnswer === 'yes'}
              onCheckedChange={(checked) => updateBonusAnswer(question.id, checked ? 'yes' : 'no')}
            />
            <Label>{currentAnswer === 'yes' ? 'Yes' : 'No'}</Label>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={currentAnswer || ''}
            onChange={(e) => updateBonusAnswer(question.id, parseInt(e.target.value) || 0)}
            placeholder="Enter a number"
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mb-8">
      <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Join the {poolSettings?.season_name} Fantasy Pool</CardTitle>
        <CardDescription className="text-red-100">
          Draft your team and make your predictions!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {poolSettings && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Entry Fee: ${poolSettings.entry_fee_amount} {poolSettings.entry_fee_currency}</h3>
            <p className="text-sm mb-2">
              <strong>{poolSettings.payment_method_1}:</strong> {poolSettings.payment_details_1}
            </p>
            {poolSettings.payment_method_2 && (
              <p className="text-sm">
                <strong>{poolSettings.payment_method_2}:</strong> {poolSettings.payment_details_2}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="participant_name" className="text-lg font-semibold">Your Name</Label>
              <Input
                id="participant_name"
                type="text"
                value={formData.participant_name}
                onChange={(e) => setFormData(prev => ({ ...prev, participant_name: e.target.value }))}
                placeholder="Enter your name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="team_name" className="text-lg font-semibold">Team Name</Label>
              <Input
                id="team_name"
                type="text"
                value={formData.team_name}
                onChange={(e) => setFormData(prev => ({ ...prev, team_name: e.target.value }))}
                placeholder="Enter your team name"
                className="mt-2"
              />
            </div>
          </div>

          <Separator />

          {/* Team Draft */}
          <div>
            <h3 className="text-xl font-bold mb-4">Draft Your Team (5 Players)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contestantGroups.map((group, groupIndex) => (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{group.group_name}</Badge>
                    {group.group_name === 'Free Pick' && (
                      <span className="text-sm text-gray-500">(Any player)</span>
                    )}
                  </div>
                  
                  {groupIndex < 4 && (
                    <Select 
                      value={formData[`player_${groupIndex + 1}` as keyof typeof formData] as string} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        [`player_${groupIndex + 1}`]: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select from ${group.group_name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {group.contestants?.map(contestant => (
                          <SelectItem key={contestant.id} value={contestant.name}>
                            {contestant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {group.group_name === 'Free Pick' && (
                    <Select 
                      value={formData.player_5} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, player_5: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Free pick - any player" />
                      </SelectTrigger>
                      <SelectContent>
                        {contestantGroups.flatMap(g => 
                          g.contestants?.map(contestant => (
                            <SelectItem key={contestant.id} value={contestant.name}>
                              {contestant.name}
                            </SelectItem>
                          )) || []
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Bonus Questions */}
          <div>
            <h3 className="text-xl font-bold mb-4">Bonus Predictions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bonusQuestions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {question.question_text}
                    <Badge variant="secondary" className="ml-2">
                      {question.points_value} pts
                    </Badge>
                  </Label>
                  {renderBonusQuestion(question)}
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold">
            Submit My Team & Predictions
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};