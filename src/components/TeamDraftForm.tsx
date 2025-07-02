import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BasicInfoForm } from '@/components/draft/BasicInfoForm';
import { PaymentInfoDisplay } from '@/components/draft/PaymentInfoDisplay';
import { PaymentValidationSection } from '@/components/draft/PaymentValidationSection';
import { TeamDraftSection } from '@/components/draft/TeamDraftSection';
import { BonusQuestionsSection } from '@/components/draft/BonusQuestionsSection';
import { usePoolData } from '@/hooks/usePoolData';
import { useDraftForm } from '@/hooks/useDraftForm';
import { useDraftSubmission } from '@/hooks/useDraftSubmission';

export const TeamDraftForm: React.FC = () => {
  const { poolSettings, contestantGroups, bonusQuestions, loading } = usePoolData();
  const { formData, updateFormData, updateBonusAnswer, resetForm } = useDraftForm();
  const { submitDraft } = useDraftSubmission();

  // Add a refresh mechanism for pool settings
  const refreshPoolSettings = () => {
    window.location.reload(); // Simple refresh for now
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitDraft(formData);
    if (success) {
      resetForm();
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

          {poolSettings?.enable_bonus_questions && bonusQuestions.length > 0 && (
            <>
              <BonusQuestionsSection
                bonusQuestions={bonusQuestions}
                contestantGroups={contestantGroups}
                bonusAnswers={formData.bonus_answers}
                onBonusAnswerChange={updateBonusAnswer}
              />
              <Separator />
            </>
          )}

          <PaymentValidationSection
            paymentConfirmed={formData.payment_confirmed}
            onPaymentConfirmedChange={(confirmed) => updateFormData({ payment_confirmed: confirmed })}
          />

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold">
            Submit My Team & Predictions
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};