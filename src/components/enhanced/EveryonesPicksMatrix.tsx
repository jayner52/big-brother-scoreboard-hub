import React, { useState, useEffect, memo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry, BonusQuestion } from '@/types/pool';
// Remove useEvictedContestants - get contestant status from database
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';
import { usePool } from '@/contexts/PoolContext';
import { TeamDisplaySection } from './everyone-picks/TeamDisplaySection';
import { BonusQuestionsMatrix } from './everyone-picks/BonusQuestionsMatrix';

export const EveryonesPicksMatrix: React.FC = memo(() => {
  const { activePool } = usePool();
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [contestants, setContestants] = useState<any[]>([]);
  const { houseguestPoints } = useHouseguestPoints();

  useEffect(() => {
    if (activePool?.id) {
      loadData();
    }
  }, [activePool?.id]);

  // Set up real-time subscription for new entries
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pool_entries'
        },
        () => {
          loadData(); // Refresh when entries change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async () => {
    if (!activePool?.id) return;
    
    try {
      console.log('EveryonesPicksMatrix: Loading data for pool', activePool.id);
      const [entriesResponse, questionsResponse, contestantsResponse] = await Promise.all([
        supabase
          .from('pool_entries')
          .select('id, team_name, participant_name, user_id, pool_id, player_1, player_2, player_3, player_4, player_5, player_6, player_7, player_8, player_9, player_10, player_11, player_12, bonus_answers, total_points, current_rank, weekly_points, bonus_points, payment_confirmed, created_at, updated_at')
          .eq('pool_id', activePool.id)
          .order('team_name'),
        supabase
          .from('bonus_questions')
          .select('id, question_text, question_type, points_value, sort_order, is_active, answer_revealed, created_at, updated_at')
          .eq('pool_id', activePool.id)
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('contestants')
          .select('name, is_active')
          .eq('pool_id', activePool.id)
      ]);

      if (entriesResponse.error) throw entriesResponse.error;
      if (questionsResponse.error) throw questionsResponse.error;
      if (contestantsResponse.error) throw contestantsResponse.error;

      const mappedEntries = entriesResponse.data?.map(entry => ({
        ...entry,
        bonus_answers: entry.bonus_answers as Record<string, any>,
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      })) || [];

      setContestants(contestantsResponse.data || []);
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

  if (loading) {
    return <div className="text-center py-8">Loading everyone's picks...</div>;
  }

  if (bonusQuestions.length === 0) {
    return (
      <TeamDisplaySection
        poolEntries={poolEntries}
        contestants={contestants}
        houseguestPoints={houseguestPoints}
      />
    );
  }

  return (
    <div className="space-y-6">
      <TeamDisplaySection
        poolEntries={poolEntries}
        contestants={contestants}
        houseguestPoints={houseguestPoints}
      />

      <BonusQuestionsMatrix
        poolEntries={poolEntries}
        bonusQuestions={bonusQuestions}
      />
    </div>
  );
});