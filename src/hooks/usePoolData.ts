import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantGroup, BonusQuestion, PoolSettings } from '@/types/pool';

export const usePoolData = () => {
  const { toast } = useToast();
  const [poolSettings, setPoolSettings] = useState<PoolSettings | null>(null);
  const [contestantGroups, setContestantGroups] = useState<ContestantGroup[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [loading, setLoading] = useState(true);

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

  return {
    poolSettings,
    contestantGroups,
    bonusQuestions,
    loading
  };
};