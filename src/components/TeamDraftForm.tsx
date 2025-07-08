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
import { useActivePool } from '@/hooks/useActivePool';
import { usePoolData } from '@/hooks/usePoolData';
import { useDynamicDraftForm } from '@/hooks/useDynamicDraftForm';
import { useDynamicDraftValidation } from '@/hooks/useDynamicDraftValidation';
import { useDynamicDraftSubmission } from '@/hooks/useDynamicDraftSubmission';
import { useRandomPicks } from '@/hooks/useRandomPicks';
import { useIsMobile } from '@/hooks/use-mobile';
import { Shuffle, AlertCircle, Trash2 } from 'lucide-react';

export const TeamDraftForm: React.FC = () => {
  const activePool = useActivePool();
  const { activePool: poolData, contestantGroups, bonusQuestions, loading } = usePoolData({ poolId: activePool?.id });
  const isMobile = useIsMobile();
  
  // DEBUG: Log actual data flow
  console.log('🔍 TeamDraftForm - activePool:', activePool);
  console.log('🔍 TeamDraftForm - poolData:', poolData);
  const { formData, updateFormData, updateBonusAnswer, resetForm, picksPerTeam } = useDynamicDraftForm(poolData);
  const { submitDraft } = useDynamicDraftSubmission();
  const { validateDraftForm } = useDynamicDraftValidation();
  const { randomizeTeam, randomizeBonusAnswers } = useRandomPicks();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Enhanced form data change handler that clears validation errors
  const handleFormDataChange = (updates: any) => {
    updateFormData(updates);
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Enhanced bonus answer change handler that clears validation errors
  const handleBonusAnswerChange = (questionId: string, answer: any) => {
    updateBonusAnswer(questionId, answer);
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleRandomizeTeam = () => {
    const randomPicks = randomizeTeam(contestantGroups, picksPerTeam);
    handleFormDataChange(randomPicks);
  };

  const handleRandomizeBonusAnswers = () => {
    const randomAnswers = randomizeBonusAnswers(bonusQuestions, contestantGroups);
    Object.entries(randomAnswers).forEach(([questionId, answer]) => {
      handleBonusAnswerChange(questionId, answer);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const allowDuplicates = poolData?.allow_duplicate_picks ?? true;
    const validation = validateDraftForm(formData, bonusQuestions, picksPerTeam, allowDuplicates);
    setValidationErrors(validation.errors);
    
    if (!validation.isValid) {
      return;
    }

    const success = await submitDraft(formData, picksPerTeam);
    if (success) {
      resetForm();
      setValidationErrors([]);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card className={`w-full ${isMobile ? 'mx-2' : 'max-w-4xl mx-auto'} mb-8`}>
      <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
        <CardTitle className={`${isMobile ? 'responsive-text-xl' : 'text-2xl'}`}>
          Join the {poolData?.name} Fantasy Pool
        </CardTitle>
        <CardDescription className="text-red-100">
          Draft your team and make your predictions!
        </CardDescription>
      </CardHeader>
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
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
        <div className={`flex ${isMobile ? 'justify-center' : 'justify-end'} mb-4`}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size={isMobile ? "default" : "sm"} 
                className={`text-destructive hover:text-destructive flex items-center gap-2 ${isMobile ? 'mobile-button' : ''}`}
              >
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

        <form onSubmit={handleSubmit} className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>

          <BasicInfoForm
            formData={{
              participant_name: formData.participant_name,
              team_name: formData.team_name,
              email: formData.email,
            }}
            onFormDataChange={handleFormDataChange}
          />

          <Separator />

          <div>
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'} mb-4`}>
              <h3 className={`${isMobile ? 'responsive-text-lg' : 'text-xl'} font-bold`}>
                Draft Your Team ({poolData?.picks_per_team || 5} Players)
              </h3>
              <Button
                type="button"
                variant="outline"
                onClick={handleRandomizeTeam}
                className={`flex items-center gap-2 ${isMobile ? 'mobile-button w-full' : ''}`}
              >
                <Shuffle className="h-4 w-4" />
                Randomize Team
              </Button>
            </div>
            <DynamicTeamDraftSection
              contestantGroups={contestantGroups}
              poolData={poolData}
              formData={formData}
              onFormDataChange={handleFormDataChange}
            />
          </div>

          <Separator />

          {poolData?.enable_bonus_questions && bonusQuestions.length > 0 && (
            <>
              <div>
                <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'} mb-4`}>
                  <h3 className={`${isMobile ? 'responsive-text-lg' : 'text-xl'} font-bold text-purple-800`}>🎯 Bonus Predictions</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRandomizeBonusAnswers}
                    className={`flex items-center gap-2 ${isMobile ? 'mobile-button w-full' : ''}`}
                  >
                    <Shuffle className="h-4 w-4" />
                    Randomize Answers
                  </Button>
                </div>
                <BonusQuestionsSection
                  bonusQuestions={bonusQuestions}
                  contestantGroups={contestantGroups}
                  bonusAnswers={formData.bonus_answers}
                  onBonusAnswerChange={handleBonusAnswerChange}
                />
              </div>
              <Separator />
            </>
          )}

          <PaymentValidationSection
            paymentConfirmed={formData.payment_confirmed}
            onPaymentConfirmedChange={(confirmed) => handleFormDataChange({ payment_confirmed: confirmed })}
          />

          {/* Validation Errors - Moved to bottom for visibility */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Please complete the following to submit your draft:</div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold ${isMobile ? 'mobile-button text-base' : 'py-3 text-lg'}`}
          >
            Submit My Team & Predictions
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};