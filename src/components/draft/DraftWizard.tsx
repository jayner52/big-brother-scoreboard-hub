import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { BasicInfoForm } from './BasicInfoForm';
import { TeamDraftSection } from './TeamDraftSection';
import { BonusQuestionsSection } from './BonusQuestionsSection';
import { PaymentValidationSection } from './PaymentValidationSection';
import { usePoolData } from '@/hooks/usePoolData';
import { useDraftForm } from '@/hooks/useDraftForm';
import { useDraftSubmission } from '@/hooks/useDraftSubmission';
import { useDraftValidation } from '@/hooks/useDraftValidation';

const STEPS = [
  { id: 'info', title: 'Basic Info', description: 'Your name and team details' },
  { id: 'team', title: 'Draft Team', description: 'Select your 5 houseguests' },
  { id: 'bonus', title: 'Bonus Questions', description: 'Make your predictions' },
  { id: 'payment', title: 'Payment', description: 'Confirm your entry' }
];

export const DraftWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const { poolSettings, contestantGroups, bonusQuestions, loading } = usePoolData();
  const { formData, updateFormData, updateBonusAnswer, resetForm } = useDraftForm();
  const { submitDraft } = useDraftSubmission();
  const { validateDraftForm } = useDraftValidation();

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
        return formData.payment_confirmed;
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
          <PaymentValidationSection
            paymentConfirmed={formData.payment_confirmed}
            onPaymentConfirmedChange={(confirmed) => updateFormData({ payment_confirmed: confirmed })}
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Join the {poolSettings?.season_name} Fantasy Pool</CardTitle>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-red-100">Step {currentStep + 1} of {STEPS.length}</span>
            <span className="text-sm text-red-100">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-red-400/30" />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Step Navigation */}
        <div className="flex justify-between items-center mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                completedSteps.includes(index) 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : index === currentStep 
                    ? 'border-primary bg-primary text-white' 
                    : 'border-muted text-muted-foreground'
              }`}>
                {completedSteps.includes(index) ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${index === currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`hidden sm:block w-8 h-px mx-4 ${
                  completedSteps.includes(index) ? 'bg-green-500' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold">{STEPS[currentStep].title}</h3>
            {completedSteps.includes(currentStep) && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Check className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={!isCurrentStepValid}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
            >
              Submit My Team
              <Check className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isCurrentStepValid}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};