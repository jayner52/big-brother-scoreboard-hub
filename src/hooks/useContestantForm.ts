import { useState } from 'react';
import { ContestantWithBio, ContestantGroup } from '@/types/admin';

export const useContestantForm = (groups: ContestantGroup[] = []) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ContestantWithBio>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const getDefaultGroupId = () => {
    if (groups.length === 0) return null;
    const groupA = groups.find(g => g.sort_order === 1);
    return groupA?.id || groups[0]?.id;
  };

  const handleEdit = (contestant: ContestantWithBio) => {
    setEditingId(contestant.id);
    setEditForm(contestant);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setEditForm({});
  };

  const handleShowAddForm = () => {
    const defaultGroupId = getDefaultGroupId();
    setShowAddForm(true);
    setEditForm({ 
      group_id: defaultGroupId,
      isActive: true 
    });
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
    resetForm,
    handleShowAddForm
  };
};