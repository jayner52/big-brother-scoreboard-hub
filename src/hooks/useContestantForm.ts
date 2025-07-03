import { useState } from 'react';
import { ContestantWithBio } from '@/types/admin';

export const useContestantForm = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ContestantWithBio>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (contestant: ContestantWithBio) => {
    setEditingId(contestant.id);
    setEditForm(contestant);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setEditForm({});
  };

  const handleFormChange = (updates: Partial<ContestantWithBio>) => {
    setEditForm(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    setEditForm({});
  };

  return {
    editingId,
    editForm,
    showAddForm,
    setShowAddForm,
    handleEdit,
    handleCancel,
    handleFormChange,
    resetForm
  };
};