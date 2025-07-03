import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BasicInfoForm } from '@/components/draft/BasicInfoForm';
import { PaymentInfoDisplay } from '@/components/draft/PaymentInfoDisplay';
import { PaymentValidationSection } from '@/components/draft/PaymentValidationSection';
import { TeamDraftSection } from '@/components/draft/TeamDraftSection';
import { BonusQuestionsSection } from '@/components/draft/BonusQuestionsSection';
import { usePoolData } from '@/hooks/usePoolData';
import { useDraftForm } from '@/hooks/useDraftForm';
import { useDraftSubmission } from '@/hooks/useDraftSubmission';
import { useDraftValidation } from '@/hooks/useDraftValidation';
import { useRandomPicks } from '@/hooks/useRandomPicks';
import { Shuffle, AlertCircle } from 'lucide-react';

export const TeamDraftForm: React.FC = () => {
  const { poolSettings, contestantGroups, bonusQuestions, loading } = usePoolData();
  const { formData, updateFormData, updateBonusAnswer, resetForm } = useDraftForm();
  const { submitDraft } = useDraftSubmission();
  const { validateDraftForm } = useDraftValidation();
  const { randomizeTeam, randomizeBonusAnswers } = useRandomPicks();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleRandomizeTeam = () => {
    const randomPicks = randomizeTeam(contestantGroups);
    updateFormData(randomPicks);
  };

  const handleRandomizeBonusAnswers = () => {
    const randomAnswers = randomizeBonusAnswers(bonusQuestions, contestantGroups);
    Object.entries(randomAnswers).forEach(([questionId, answer]) => {
      updateBonusAnswer(questionId, answer);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateDraftForm(formData, bonusQuestions);
    setValidationErrors(validation.errors);
    
    if (!validation.isValid) {
      return;
    }

    const success = await submitDraft(formData);
    if (success) {
      resetForm();
      setValidationErrors([]);
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
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Please complete the following:</div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <BasicInfoForm
            formData={{
              participant_name: formData.participant_name,
              team_name: formData.team_name,
              email: formData.email,
            }}
            onFormDataChange={updateFormData}
          />

          <Separator />

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Draft Your Team (5 Players)</h3>
              <Button
                type="button"
                variant="outline"
                onClick={handleRandomizeTeam}
                className="flex items-center gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Randomize Team
              </Button>
            </div>
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
          </div>

          <Separator />

          {poolSettings?.enable_bonus_questions && bonusQuestions.length > 0 && (
            <>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-purple-800">🎯 Bonus Predictions</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRandomizeBonusAnswers}
                    className="flex items-center gap-2"
                  >
                    <Shuffle className="h-4 w-4" />
                    Randomize Answers
                  </Button>
                </div>
                <BonusQuestionsSection
                  bonusQuestions={bonusQuestions}
                  contestantGroups={contestantGroups}
                  bonusAnswers={formData.bonus_answers}
                  onBonusAnswerChange={updateBonusAnswer}
                />
              </div>
              <Separator />
            </>
          )}

          <PaymentValidationSection
            paymentConfirmed={formData.payment_confirmed}
            onPaymentConfirmedChange={(confirmed) => updateFormData({ payment_confirmed: confirmed })}
          />

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
            disabled={validationErrors.length > 0}
          >
            Submit My Team & Predictions
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};