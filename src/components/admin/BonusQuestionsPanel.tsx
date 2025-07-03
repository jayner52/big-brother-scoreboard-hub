import React from 'react';
import { useBonusQuestions } from '@/hooks/useBonusQuestions';
import { BonusQuestionCard } from './bonus-questions/BonusQuestionCard';
import { MultipleCorrectAnswers } from './bonus-questions/MultipleCorrectAnswers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const handleMultipleAnswersUpdate = async (questionId: string, correctAnswers: string[]) => {
    try {
      const { error } = await supabase
        .from('bonus_questions')
        .update({ correct_answer: correctAnswers.join('|') }) // Store multiple answers separated by |
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Multiple correct answers updated",
      });
    } catch (error) {
      console.error('Error updating multiple answers:', error);
      toast({
        title: "Error",
        description: "Failed to update multiple answers",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading bonus questions...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manage" className="w-full">
        <TabsList>
          <TabsTrigger value="manage">Manage Questions</TabsTrigger>
          <TabsTrigger value="multiple-answers">Multiple Correct Answers</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="multiple-answers" className="space-y-6">
          {bonusQuestions.map((question) => (
            <MultipleCorrectAnswers
              key={question.id}
              question={question}
              onUpdate={handleMultipleAnswersUpdate}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};