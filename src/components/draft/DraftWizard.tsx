import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { BasicInfoForm } from './BasicInfoForm';
import { TeamDraftSection } from './TeamDraftSection';
import { BonusQuestionsSection } from './BonusQuestionsSection';
import { SecurePaymentPanel } from './SecurePaymentPanel';
import { DraftLayoutWithSidebar } from './DraftLayoutWithSidebar';
import { ProgressIndicator } from './ProgressIndicator';
import { usePoolData } from '@/hooks/usePoolData';
import { useDraftForm } from '@/hooks/useDraftForm';
import { useDraftSubmission } from '@/hooks/useDraftSubmission';
import { useDraftValidation } from '@/hooks/useDraftValidation';
import { DraftFormPersistenceAlert } from './DraftFormPersistenceAlert';

const STEPS = [
  { id: 'info', title: 'Basic Info', description: 'Your name and team details' },
  { id: 'team', title: 'Draft Team', description: 'Select your 5 houseguests' },
  { id: 'bonus', title: 'Bonus Questions', description: 'Optional predictions for extra points' },
  { id: 'payment', title: 'Payment', description: 'Secure payment confirmation' }
];

export const DraftWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [hasSavedData, setHasSavedData] = useState(false);
  
  const { poolSettings, contestantGroups, bonusQuestions, loading } = usePoolData();
  const { formData, updateFormData, updateBonusAnswer, resetForm, clearSavedDraft } = useDraftForm();
  const { submitDraft } = useDraftSubmission();
  const { validateDraftForm } = useDraftValidation();

  // Check for saved data on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('bb_draft_form_data');
    setHasSavedData(!!savedData && savedData !== '{}');
  }, []);

  const getCurrentStepValidation = () => {
    const step = STEPS[currentStep];
    switch (step.id) {
      case 'info':
        return formData.participant_name.trim() && formData.team_name.trim() && formData.email.trim();
      case 'team':
        return [formData.player_1, formData.player_2, formData.player_3, formData.player_4, formData.player_5]
          .every(player => player.trim());
      case 'bonus':
        if (!poolSettings?.enable_bonus_questions || bonusQuestions.length === 0) return true;
        return bonusQuestions.every(q => {
          const answer = formData.bonus_answers[q.id];
          return answer && (typeof answer === 'string' ? answer.trim() : answer.player1 && answer.player2);
        });
      case 'payment':
        return true; // Payment is now optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (getCurrentStepValidation()) {
      setCompletedSteps(prev => [...prev.filter(s => s !== currentStep), currentStep]);
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const validation = validateDraftForm(formData, bonusQuestions);
    if (validation.isValid) {
      const success = await submitDraft(formData);
      if (success) {
        resetForm();
        setCurrentStep(0);
        setCompletedSteps([]);
      }
    }
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];
    
    switch (step.id) {
      case 'info':
        return (
          <BasicInfoForm
            formData={{
              participant_name: formData.participant_name,
              team_name: formData.team_name,
              email: formData.email,
            }}
            onFormDataChange={updateFormData}
          />
        );
      case 'team':
        return (
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
        );
      case 'bonus':
        if (!poolSettings?.enable_bonus_questions || bonusQuestions.length === 0) {
          return <div className="text-center py-8 text-muted-foreground">No bonus questions available</div>;
        }
        return (
          <BonusQuestionsSection
            bonusQuestions={bonusQuestions}
            contestantGroups={contestantGroups}
            bonusAnswers={formData.bonus_answers}
            onBonusAnswerChange={updateBonusAnswer}
          />
        );
      case 'payment':
        return (
          <SecurePaymentPanel
            paymentConfirmed={formData.payment_confirmed}
            onPaymentConfirmedChange={(confirmed) => updateFormData({ payment_confirmed: confirmed })}
            poolSettings={poolSettings}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isCurrentStepValid = getCurrentStepValidation();
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <DraftLayoutWithSidebar formData={formData}>
      <Card className="w-full shadow-xl border-2 border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="h-8 w-8" />
            Join the {poolSettings?.season_name} Fantasy Pool
          </CardTitle>
          <p className="text-purple-100 text-lg mt-2">
            Build your championship team and compete for glory!
          </p>
        </CardHeader>

        <CardContent className="p-8">
          {/* Draft Persistence Alert */}
          <DraftFormPersistenceAlert 
            hasSavedData={hasSavedData}
            onClearSavedData={() => {
              clearSavedDraft();
              setHasSavedData(false);
            }}
          />

          {/* Enhanced Progress Indicator */}
          <ProgressIndicator
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            className="mb-10"
          />

          {/* Current Step Content */}
          <div className="mb-10">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3"
              size="lg"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              {isLastStep && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-3 py-1">
                  Ready to submit!
                </Badge>
              )}
              
              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCurrentStepValid}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex items-center gap-2 px-8 py-3 text-lg font-semibold shadow-lg"
                  size="lg"
                >
                  <Check className="h-5 w-5" />
                  Submit My Team
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2 px-6 py-3"
                  size="lg"
                >
                  Next Step
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </DraftLayoutWithSidebar>
  );
};