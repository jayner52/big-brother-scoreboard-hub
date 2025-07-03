import { DraftFormData } from './useDraftForm';
import { BonusQuestion } from '@/types/pool';

export const useDraftValidation = () => {
  const validateDraftForm = (
    formData: DraftFormData, 
    bonusQuestions: BonusQuestion[] = []
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Basic info validation
    if (!formData.participant_name.trim()) {
      errors.push("Please enter your name");
    }
    if (!formData.team_name.trim()) {
      errors.push("Please enter a team name");
    }
    if (!formData.email.trim()) {
      errors.push("Please enter your email address");
    }

    // Team selection validation - allow duplicate players
    const players = ['player_1', 'player_2', 'player_3', 'player_4', 'player_5'] as const;
    players.forEach((player, index) => {
      if (!formData[player]) {
        errors.push(`Please select Player ${index + 1}`);
      }
    });

    // Bonus questions validation - now required
    bonusQuestions.forEach((question) => {
      const answer = formData.bonus_answers[question.id];
      if (!answer || 
          (typeof answer === 'string' && !answer.trim()) ||
          (typeof answer === 'object' && (!answer.player1 || !answer.player2))) {
        errors.push(`Please answer bonus question: ${question.question_text}`);
      }
    });

    // Payment confirmation is now optional - removed this validation

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return { validateDraftForm };
};