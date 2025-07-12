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
    
    // Add dynamic player fields up to maximum possible (12)
    for (let i = 1; i <= 12; i++) {
      baseData[`player_${i}`] = '';
    }
    
    return baseData;
  };

  const [formData, setFormData] = useState<DynamicDraftFormData>(createInitialFormData());

  // Update form data when picks per team changes - handle team size increases/decreases
  useEffect(() => {
    setFormData(prev => {
      const newData = { ...prev };
      
      // Ensure all player fields exist up to max (12)
      for (let i = 1; i <= 12; i++) {
        if (!newData.hasOwnProperty(`player_${i}`)) {
          newData[`player_${i}`] = '';
        }
      }
      
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

  // Get submission data with proper field management for team size changes
  const getSubmissionData = () => {
    const submissionData = { ...formData };
    
    // For slots beyond current team size, set to null to clear them
    for (let i = picksPerTeam + 1; i <= 12; i++) {
      submissionData[`player_${i}`] = null;
    }
    
    return submissionData;
  };

  return {
    formData,
    updateFormData,
    updateBonusAnswer,
    resetForm,
    clearSavedDraft,
    getPlayerSelections,
    getSubmissionData,
    picksPerTeam
  };
};
