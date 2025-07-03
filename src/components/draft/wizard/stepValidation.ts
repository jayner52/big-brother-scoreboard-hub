import { DraftFormData } from '@/hooks/useDraftForm';
import { BonusQuestion, PoolSettings } from '@/types/pool';
import { StepId } from './draftStepsConfig';

interface StepValidationProps {
  stepId: StepId;
  formData: DraftFormData;
  poolSettings?: PoolSettings;
  bonusQuestions: BonusQuestion[];
}

export const validateStep = ({ 
  stepId, 
  formData, 
  poolSettings, 
  bonusQuestions 
}: StepValidationProps): boolean => {
  switch (stepId) {
    case 'info':
      return !!(formData.participant_name.trim() && formData.team_name.trim() && formData.email.trim());
    
    case 'team':
      return [formData.player_1, formData.player_2, formData.player_3, formData.player_4, formData.player_5]
        .every(player => player && player.trim() !== '');
    
    case 'bonus':
      if (!poolSettings?.enable_bonus_questions || bonusQuestions.length === 0) return true;
      return bonusQuestions.every(q => {
        const answer = formData.bonus_answers[q.id];
        return answer && (typeof answer === 'string' ? answer.trim() !== '' : answer.player1 && answer.player2);
      });
    
    case 'payment':
      return true; // Payment is now optional
    
    default:
      return false;
  }
};