import React from 'react';
import { BasicInfoForm } from '../BasicInfoForm';
import { TeamDraftSection } from '../TeamDraftSection';
import { BonusQuestionsSection } from '../BonusQuestionsSection';
import { SecurePaymentPanel } from '../SecurePaymentPanel';
import { DraftFormData } from '@/hooks/useDraftForm';
import { BonusQuestion, ContestantGroup, PoolSettings } from '@/types/pool';
import { StepId } from './draftStepsConfig';

interface StepContentRendererProps {
  stepId: StepId;
  formData: DraftFormData;
  updateFormData: (updates: Partial<DraftFormData>) => void;
  updateBonusAnswer: (questionId: string, value: any) => void;
  contestantGroups: ContestantGroup[];
  bonusQuestions: BonusQuestion[];
  poolSettings?: PoolSettings;
}

export const StepContentRenderer: React.FC<StepContentRendererProps> = ({
  stepId,
  formData,
  updateFormData,
  updateBonusAnswer,
  contestantGroups,
  bonusQuestions,
  poolSettings,
}) => {
  switch (stepId) {
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
          picksPerTeam={poolSettings?.picks_per_team || 5}
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