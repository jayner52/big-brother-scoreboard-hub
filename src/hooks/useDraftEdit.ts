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
    
    return {
      participant_name: editEntryData.participant_name,
      team_name: editEntryData.team_name,
      email: editEntryData.email,
      player_1: editEntryData.player_1,
      player_2: editEntryData.player_2,
      player_3: editEntryData.player_3,
      player_4: editEntryData.player_4,
      player_5: editEntryData.player_5,
      bonus_answers: editEntryData.bonus_answers || {},
      payment_confirmed: editEntryData.payment_confirmed,
    };
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