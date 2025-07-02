import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantGroup, BonusQuestion, PoolSettings } from '@/types/pool';
import { BasicInfoForm } from '@/components/draft/BasicInfoForm';
import { PaymentInfoDisplay } from '@/components/draft/PaymentInfoDisplay';
import { TeamDraftSection } from '@/components/draft/TeamDraftSection';
import { BonusQuestionsSection } from '@/components/draft/BonusQuestionsSection';

export const TeamDraftForm: React.FC = () => {
  const { toast } = useToast();
  const [poolSettings, setPoolSettings] = useState<PoolSettings | null>(null);
  const [contestantGroups, setContestantGroups] = useState<ContestantGroup[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    participant_name: '',
    team_name: '',
    email: '',
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
          email: formData.email,
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
        email: '',
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

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
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
        {poolSettings && <PaymentInfoDisplay poolSettings={poolSettings} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicInfoForm
            formData={{
              participant_name: formData.participant_name,
              team_name: formData.team_name,
              email: formData.email,
            }}
            onFormDataChange={updateFormData}
          />

          <Separator />

          <TeamDraftSection
            contestantGroups={contestantGroups}
            formData={{
              player_1: formData.player_1,
              player_2: formData.player_2,
              player_3: formData.player_3,
              player_4: formData.player_4,
              player_5: formData.player_5,
            }}
            onFormDataChange={updateFormData}
          />

          <Separator />

          <BonusQuestionsSection
            bonusQuestions={bonusQuestions}
            contestantGroups={contestantGroups}
            bonusAnswers={formData.bonus_answers}
            onBonusAnswerChange={updateBonusAnswer}
          />

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold">
            Submit My Team & Predictions
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};