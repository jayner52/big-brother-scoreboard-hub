import React from 'react';
import { useBonusQuestions } from '@/hooks/useBonusQuestions';
import { BonusQuestionCard } from './bonus-questions/BonusQuestionCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const BonusQuestionsPanel: React.FC = () => {
  const { toast } = useToast();
  const {
    contestants,
    bonusQuestions,
    bonusAnswers,
    loading,
    handleBonusAnswer
  } = useBonusQuestions();

  const handlePointsChange = async (questionId: string, points: number) => {
    try {
      const { error } = await supabase
        .from('bonus_questions')
        .update({ points_value: points })
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bonus question points updated",
      });
    } catch (error) {
      console.error('Error updating points:', error);
      toast({
        title: "Error",
        description: "Failed to update points",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading bonus questions...</div>;
  }

  return (
    <div className="space-y-6">
      {bonusQuestions.map((question) => (
        <BonusQuestionCard
          key={question.id}
          question={question}
          currentAnswer={bonusAnswers[question.id]}
          contestants={contestants}
          onAnswerChange={handleBonusAnswer}
          onPointsChange={handlePointsChange}
        />
      ))}
    </div>
  );
};