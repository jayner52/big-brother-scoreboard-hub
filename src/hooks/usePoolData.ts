import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContestantGroup, BonusQuestion, Pool } from '@/types/pool';

interface UsePoolDataProps {
  poolId?: string;
}

export const usePoolData = ({ poolId }: UsePoolDataProps = {}) => {
  const { toast } = useToast();
  const [activePool, setActivePool] = useState<Pool | null>(null);
  const [contestantGroups, setContestantGroups] = useState<ContestantGroup[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (poolId) {
      loadPoolData();
    } else {
      setLoading(false);
    }
  }, [poolId]);

  const loadPoolData = async () => {
    if (!poolId) {
      setLoading(false);
      return;
    }

    try {
      // Load pool data (replaces the old pool_settings)
      const { data: pool } = await supabase
        .from('pools')
        .select('*')
        .eq('id', poolId)
        .single();
      
      if (pool) {
        setActivePool(pool);
      }

      // Load contestant groups with contestants for this pool
      const { data: groups } = await supabase
        .from('contestant_groups')
        .select(`
          *,
          contestants (*)
        `)
        .eq('pool_id', poolId)
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

      // Load bonus questions for this pool
      const { data: questions } = await supabase
        .from('bonus_questions')
        .select('*')
        .eq('pool_id', poolId)
        .eq('is_active', true)
        .order('sort_order');
      
      const mappedQuestions = questions?.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type as 'player_select' | 'dual_player_select' | 'yes_no' | 'number' | 'creature_select',
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

  const refreshPoolData = () => {
    loadPoolData();
  };

  return {
    activePool,
    contestantGroups,
    bonusQuestions,
    loading,
    refreshPoolData
  };
};