import { DynamicDraftFormData } from './useDynamicDraftForm';
import { BonusQuestion } from '@/types/pool';

export const useDynamicDraftValidation = () => {
  const validateDraftForm = (
    formData: DynamicDraftFormData, 
    bonusQuestions: BonusQuestion[] = [],
    picksPerTeam: number = 5
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

    // Dynamic team selection validation
    const selectedPlayers = [];
    for (let i = 1; i <= picksPerTeam; i++) {
      const playerKey = `player_${i}`;
      const playerSelection = formData[playerKey];
      
      if (!playerSelection || !playerSelection.trim()) {
        errors.push(`Please select Player ${i}`);
      } else {
        selectedPlayers.push(playerSelection.trim());
      }
    }

    // Check for duplicate players
    const uniquePlayers = new Set(selectedPlayers);
    if (uniquePlayers.size !== selectedPlayers.length) {
      errors.push("You cannot select the same player multiple times");
    }

    // Bonus questions validation
    bonusQuestions.forEach((question) => {
      const answer = formData.bonus_answers[question.id];
      if (!answer || 
          (typeof answer === 'string' && !answer.trim()) ||
          (typeof answer === 'object' && (!answer.player1 || !answer.player2))) {
        errors.push(`Please answer bonus question: ${question.question_text}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return { validateDraftForm };
};