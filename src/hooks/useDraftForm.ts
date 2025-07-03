import { useState, useEffect } from 'react';

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
  payment_confirmed: boolean;
}

const DRAFT_STORAGE_KEY = 'bb_draft_form_data';

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
    payment_confirmed: false,
  });

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error('Error loading saved draft data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

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
    const newFormData = {
      participant_name: '',
      team_name: '',
      email: '',
      player_1: '',
      player_2: '',
      player_3: '',
      player_4: '',
      player_5: '',
      bonus_answers: {},
      payment_confirmed: false,
    };
    setFormData(newFormData);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  const clearSavedDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  return {
    formData,
    updateFormData,
    updateBonusAnswer,
    resetForm,
    clearSavedDraft
  };
};