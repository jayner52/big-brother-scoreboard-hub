import React, { useState, useEffect } from 'react';
import { CardContent } from '@/components/ui/card';
import { DraftWizardHeader } from './wizard/DraftWizardHeader';
import { StepContentRenderer } from './wizard/StepContentRenderer';
import { WizardNavigation } from './wizard/WizardNavigation';
import { DraftLayoutWithSidebar } from './DraftLayoutWithSidebar';
import { ProgressIndicator } from './ProgressIndicator';
import { DraftFormPersistenceAlert } from './DraftFormPersistenceAlert';
import { HouseguestProfiles } from '@/components/HouseguestProfiles';
import { usePoolData } from '@/hooks/usePoolData';
import { useDraftForm } from '@/hooks/useDraftForm';
import { useDraftSubmission } from '@/hooks/useDraftSubmission';
import { useDraftValidation } from '@/hooks/useDraftValidation';
import { DRAFT_STEPS } from './wizard/draftStepsConfig';
import { validateStep } from './wizard/stepValidation';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

export const DraftWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  
  const { poolSettings, contestantGroups, bonusQuestions, loading } = usePoolData();
  const { formData, updateFormData, updateBonusAnswer, resetForm, clearSavedDraft } = useDraftForm();
  const { submitDraft } = useDraftSubmission();
  const { validateDraftForm } = useDraftValidation();

  // Check for saved data on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('bb_draft_form_data');
    setHasSavedData(!!savedData && savedData !== '{}');
  }, []);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  const getCurrentStepValidation = () => {
    const step = DRAFT_STEPS[currentStep];
    return validateStep({
      stepId: step.id as any,
      formData,
      poolSettings,
      bonusQuestions
    });
  };

  const handleNext = () => {
    if (getCurrentStepValidation()) {
      setCompletedSteps(prev => [...prev.filter(s => s !== currentStep), currentStep]);
      if (currentStep < DRAFT_STEPS.length - 1) {
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

  const handleClearForm = () => {
    resetForm();
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const isCurrentStepValid = getCurrentStepValidation();
  const currentStepConfig = DRAFT_STEPS[currentStep];
  const selectedPlayers = Object.values(formData).filter(player => player && player.trim());
  const hasCompletedTeam = selectedPlayers.length === 5;

  return (
    <DraftLayoutWithSidebar formData={formData}>
      {/* Team Preview - Show when team is complete */}
      {hasCompletedTeam && user && (
        <div className="mb-6">
          <HouseguestProfiles userId={user.id} />
        </div>
      )}

      <DraftWizardHeader seasonName={poolSettings?.season_name} />
      
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
          steps={DRAFT_STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          className="mb-10"
        />

        {/* Current Step Content */}
        <div className="mb-10">
          <StepContentRenderer
            stepId={currentStepConfig.id as any}
            formData={formData}
            updateFormData={updateFormData}
            updateBonusAnswer={updateBonusAnswer}
            contestantGroups={contestantGroups}
            bonusQuestions={bonusQuestions}
            poolSettings={poolSettings}
          />
        </div>

        {/* Navigation Buttons */}
        <WizardNavigation
          currentStep={currentStep}
          totalSteps={DRAFT_STEPS.length}
          isCurrentStepValid={isCurrentStepValid}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
          onClearForm={handleClearForm}
        />
      </CardContent>
    </DraftLayoutWithSidebar>
  );
};