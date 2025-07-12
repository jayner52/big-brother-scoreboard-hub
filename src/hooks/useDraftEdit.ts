import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DraftFormData } from './useDraftForm';

export const useDraftEdit = () => {
  const [searchParams] = useSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEntryData, setEditEntryData] = useState<any>(null);

  useEffect(() => {
    const isEdit = searchParams.get('edit') === 'true';
    setIsEditMode(isEdit);
    
    if (isEdit) {
      const savedData = localStorage.getItem('edit_entry_data');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setEditEntryData(parsedData);
        } catch (error) {
          console.error('Error parsing edit entry data:', error);
        }
      }
    }
  }, [searchParams]);

  const getEditFormData = (): Partial<DraftFormData> | null => {
    if (!editEntryData) return null;
    
    // Dynamic player data extraction for all possible player slots (1-12)
    const formData: any = {
      participant_name: editEntryData.participant_name,
      team_name: editEntryData.team_name,
      email: editEntryData.email,
      bonus_answers: editEntryData.bonus_answers || {},
      payment_confirmed: editEntryData.payment_confirmed,
    };

    // Add all player fields that exist in the entry data
    for (let i = 1; i <= 12; i++) {
      const playerKey = `player_${i}`;
      if (editEntryData[playerKey]) {
        formData[playerKey] = editEntryData[playerKey];
      }
    }
    
    return formData;
  };

  const clearEditData = () => {
    localStorage.removeItem('edit_entry_data');
    setEditEntryData(null);
    setIsEditMode(false);
  };

  return {
    isEditMode,
    editEntryData,
    getEditFormData,
    clearEditData
  };
};