import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PoolEntry, BonusQuestion } from '@/types/pool';
import { useEvictedContestants } from '@/hooks/useEvictedContestants';
import { useHouseguestPoints } from '@/hooks/useHouseguestPoints';
import { TeamDisplaySection } from './everyone-picks/TeamDisplaySection';
import { BonusQuestionsMatrix } from './everyone-picks/BonusQuestionsMatrix';

export const EveryonesPicksMatrix: React.FC = () => {
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { evictedContestants } = useEvictedContestants();
  const { houseguestPoints } = useHouseguestPoints();

  useEffect(() => {
    loadData();
  }, []);

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
    try {
      const [entriesResponse, questionsResponse] = await Promise.all([
        supabase
          .from('pool_entries')
          .select('*')
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

  if (loading) {
    return <div className="text-center py-8">Loading everyone's picks...</div>;
  }

  if (bonusQuestions.length === 0) {
    return (
      <TeamDisplaySection
        poolEntries={poolEntries}
        evictedContestants={evictedContestants}
        houseguestPoints={houseguestPoints}
      />
    );
  }

  return (
    <div className="space-y-6">
      <TeamDisplaySection
        poolEntries={poolEntries}
        evictedContestants={evictedContestants}
        houseguestPoints={houseguestPoints}
      />

      <BonusQuestionsMatrix
        poolEntries={poolEntries}
        bonusQuestions={bonusQuestions}
      />
    </div>
  );
};