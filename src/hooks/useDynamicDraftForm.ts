import { useState, useEffect } from 'react';
import { useDraftEdit } from './useDraftEdit';
import { Pool } from '@/types/pool';

export interface DynamicDraftFormData {
  participant_name: string;
  team_name: string;
  email: string;
  bonus_answers: Record<string, any>;
  payment_confirmed: boolean;
  [key: string]: any; // For dynamic player fields like player_1, player_2, etc.
}

const DRAFT_STORAGE_KEY = 'bb_draft_form_data';

export const useDynamicDraftForm = (poolData?: Pool | null) => {
  const { isEditMode, getEditFormData } = useDraftEdit();
  const picksPerTeam = poolData?.picks_per_team || 5;
  
  // Create initial form data with dynamic player fields
  const createInitialFormData = (): DynamicDraftFormData => {
    const baseData: DynamicDraftFormData = {
      participant_name: '',
      team_name: '',
      email: '',
      bonus_answers: {},
      payment_confirmed: false,
    };
    
    // Add dynamic player fields
    for (let i = 1; i <= picksPerTeam; i++) {
      baseData[`player_${i}`] = '';
    }
    
    return baseData;
  };

  const [formData, setFormData] = useState<DynamicDraftFormData>(createInitialFormData());

  // Update form data when picks per team changes
  useEffect(() => {
    setFormData(prev => {
      const newData = { ...prev };
      
      // Add new player fields if increased
      for (let i = 1; i <= picksPerTeam; i++) {
        if (!newData[`player_${i}`]) {
          newData[`player_${i}`] = '';
        }
      }
      
      // Remove extra player fields if decreased (but keep existing selections if possible)
      const existingPlayerFields = Object.keys(newData).filter(key => key.startsWith('player_'));
      existingPlayerFields.forEach(field => {
        const playerNum = parseInt(field.split('_')[1]);
        if (playerNum > picksPerTeam) {
          delete newData[field];
        }
      });
      
      return newData;
    });
  }, [picksPerTeam]);

  // Load saved data on mount
  useEffect(() => {
    if (isEditMode) {
      const editData = getEditFormData();
      if (editData) {
        setFormData(prev => ({ ...prev, ...editData }));
      }
    } else {
      const savedData = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Error loading saved draft data:', error);
        }
      }
    }
  }, [isEditMode, picksPerTeam]);

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    if (!isEditMode) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isEditMode]);

  const updateFormData = (updates: Partial<DynamicDraftFormData>) => {
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
    const newFormData = createInitialFormData();
    setFormData(newFormData);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  const clearSavedDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  // Get player selections as array
  const getPlayerSelections = (): string[] => {
    const selections = [];
    for (let i = 1; i <= picksPerTeam; i++) {
      const selection = formData[`player_${i}`];
      if (selection && selection.trim()) {
        selections.push(selection.trim());
      }
    }
    return selections;
  };

  return {
    formData,
    updateFormData,
    updateBonusAnswer,
    resetForm,
    clearSavedDraft,
    getPlayerSelections,
    picksPerTeam
  };
};
