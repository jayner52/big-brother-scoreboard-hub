import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BasicInfoForm } from '@/components/draft/BasicInfoForm';
import { PaymentInfoDisplay } from '@/components/draft/PaymentInfoDisplay';
import { PaymentValidationSection } from '@/components/draft/PaymentValidationSection';
import { DynamicTeamDraftSection } from '@/components/draft/DynamicTeamDraftSection';
import { BonusQuestionsSection } from '@/components/draft/BonusQuestionsSection';
import { usePool } from '@/contexts/PoolContext';
import { usePoolData } from '@/hooks/usePoolData';
import { useDraftForm } from '@/hooks/useDraftForm';
import { useDraftSubmission } from '@/hooks/useDraftSubmission';
import { useDraftValidation } from '@/hooks/useDraftValidation';
import { useRandomPicks } from '@/hooks/useRandomPicks';
import { Shuffle, AlertCircle, Trash2 } from 'lucide-react';

export const TeamDraftForm: React.FC = () => {
  const { activePool } = usePool();
  const { activePool: poolData, contestantGroups, bonusQuestions, loading } = usePoolData({ poolId: activePool?.id });
  
  // DEBUG: Log actual data flow
  console.log('🔍 TeamDraftForm - activePool:', activePool);
  console.log('🔍 TeamDraftForm - poolData:', poolData);
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
        <CardTitle className="text-2xl">Join the {poolData?.name} Fantasy Pool</CardTitle>
        <CardDescription className="text-red-100">
          Draft your team and make your predictions!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {poolData && (() => {
          const poolSettings = {
            ...poolData,
            season_name: poolData.name,
            season_active: !poolData.draft_locked,
            registration_deadline: poolData.registration_deadline
          };
          console.log('🔍 PaymentInfoDisplay poolSettings:', poolSettings);
          return <PaymentInfoDisplay poolSettings={poolSettings} />;
        })()}

        {/* Clear Form Button */}
        <div className="flex justify-end mb-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Clear Form
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Draft Form</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to clear your draft and bonus predictions? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetForm} className="bg-destructive hover:bg-destructive/90">
                  Clear Form
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

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
              <h3 className="text-xl font-bold">
                Draft Your Team ({poolData?.picks_per_team || 5} Players)
              </h3>
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
            <DynamicTeamDraftSection
              contestantGroups={contestantGroups}
              poolData={poolData}
              formData={formData}
              onFormDataChange={updateFormData}
            />
          </div>

          <Separator />

          {poolData?.enable_bonus_questions && bonusQuestions.length > 0 && (
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