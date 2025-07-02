import { useState } from 'react';

export interface DraftFormData {
  participant_name: string;
  team_name: string;
  email: string;
  player_1: string;
  player_2: string;
  player_3: string;
  player_4: string;
  player_5: string;
  bonus_answers: Record<string, any>;
}

export const useDraftForm = () => {
  const [formData, setFormData] = useState<DraftFormData>({
    participant_name: '',
    team_name: '',
    email: '',
    player_1: '',
    player_2: '',
    player_3: '',
    player_4: '',
    player_5: '',
    bonus_answers: {},
  });

  const updateFormData = (updates: Partial<DraftFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateBonusAnswer = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      bonus_answers: {
        ...prev.bonus_answers,
        [questionId]: value,
      },
    }));
  };

  const resetForm = () => {
    setFormData({
      participant_name: '',
      team_name: '',
      email: '',
      player_1: '',
      player_2: '',
      player_3: '',
      player_4: '',
      player_5: '',
      bonus_answers: {},
    });
  };

  return {
    formData,
    updateFormData,
    updateBonusAnswer,
    resetForm
  };
};