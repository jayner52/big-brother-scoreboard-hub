import { useState, useEffect } from 'react';
import { Pool } from '@/types/pool';

interface TeamFormData {
  participant_name: string;
  team_name: string;
  email: string;
  payment_confirmed: boolean;
  bonus_answers: Record<string, any>;
  [key: string]: any; // For dynamic player_X fields
}

export const useDynamicTeamForm = (pool: Pool | null, editData?: any) => {
  const [formData, setFormData] = useState<TeamFormData>({
    participant_name: '',
    team_name: '',
    email: '',
    payment_confirmed: false,
    bonus_answers: {}
  });

  const picksPerTeam = pool?.picks_per_team || 5;

  // Initialize form with dynamic player fields
  useEffect(() => {
    const initialData: TeamFormData = {
      participant_name: editData?.participant_name || '',
      team_name: editData?.team_name || '',
      email: editData?.email || '',
      payment_confirmed: editData?.payment_confirmed || false,
      bonus_answers: editData?.bonus_answers || {}
    };

    // Add player fields based on current pool settings
    for (let i = 1; i <= Math.max(picksPerTeam, 12); i++) {
      const playerKey = `player_${i}`;
      if (i <= picksPerTeam) {
        // For active player slots, use edit data or empty
        initialData[playerKey] = editData?.[playerKey] || '';
      } else {
        // For inactive slots, preserve existing data but don't show in form
        initialData[playerKey] = editData?.[playerKey] || '';
      }
    }

    setFormData(initialData);
  }, [editData, picksPerTeam]);

  const updatePlayerField = (playerIndex: number, value: string) => {
    const playerKey = `player_${playerIndex}`;
    setFormData(prev => ({
      ...prev,
      [playerKey]: value
    }));
  };

  const getActivePlayerFields = () => {
    const activeFields: Array<{ key: string; value: string; index: number }> = [];
    for (let i = 1; i <= picksPerTeam; i++) {
      const playerKey = `player_${i}`;
      activeFields.push({
        key: playerKey,
        value: formData[playerKey] || '',
        index: i
      });
    }
    return activeFields;
  };

  const getFormDataForSubmission = () => {
    // Create submission data with all fields up to picks_per_team
    const submissionData: any = {
      participant_name: formData.participant_name,
      team_name: formData.team_name,
      email: formData.email,
      payment_confirmed: formData.payment_confirmed,
      bonus_answers: formData.bonus_answers
    };

    // Add player fields up to the current team size
    for (let i = 1; i <= 12; i++) {
      const playerKey = `player_${i}`;
      if (i <= picksPerTeam) {
        // For active slots, use current value or null
        submissionData[playerKey] = formData[playerKey] || null;
      } else {
        // For inactive slots, set to null to clear them
        submissionData[playerKey] = null;
      }
    }

    return submissionData;
  };

  const updateFormField = (field: keyof TeamFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    const resetData: TeamFormData = {
      participant_name: '',
      team_name: '',
      email: '',
      payment_confirmed: false,
      bonus_answers: {}
    };

    // Reset all player fields
    for (let i = 1; i <= 12; i++) {
      resetData[`player_${i}`] = '';
    }

    setFormData(resetData);
  };

  return {
    formData,
    picksPerTeam,
    updatePlayerField,
    updateFormField,
    getActivePlayerFields,
    getFormDataForSubmission,
    resetForm
  };
};