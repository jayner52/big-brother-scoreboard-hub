import { ContestantWithBio } from '@/types/admin';
import { useContestantForm } from './useContestantForm';
import { useContestantCrud } from './useContestantCrud';
import { useAIContestantGeneration } from './useAIContestantGeneration';

export const useContestantActions = (
  contestants: ContestantWithBio[],
  setContestants: React.Dispatch<React.SetStateAction<ContestantWithBio[]>>,
  loadContestants: () => Promise<void>
) => {
  const {
    editingId,
    editForm,
    showAddForm,
    setShowAddForm,
    handleEdit,
    handleCancel,
    handleFormChange,
    resetForm
  } = useContestantForm();

  const {
    saveContestant,
    addContestant,
    deleteContestant,
    clearAllContestants
  } = useContestantCrud(contestants, setContestants);

  const { handleAIProfilesGenerated } = useAIContestantGeneration(loadContestants);

  const handleSave = async () => {
    const success = await saveContestant(editForm, editingId!);
    if (success) {
      await loadContestants();
      setTimeout(() => resetForm(), 100);
    }
  };

  const handleAddContestant = async () => {
    const success = await addContestant(editForm);
    if (success) {
      await loadContestants();
      setTimeout(() => resetForm(), 100);
    }
  };

  const handleDelete = async (contestantId: string) => {
    const success = await deleteContestant(contestantId);
    if (success) {
      await loadContestants();
    }
  };

  const handleClearAll = async () => {
    const success = await clearAllContestants();
    if (success) {
      await loadContestants();
    }
  };

  return {
    editingId,
    editForm,
    showAddForm,
    setShowAddForm,
    handleEdit,
    handleSave,
    handleAddContestant,
    handleDelete,
    handleClearAll,
    handleCancel,
    handleFormChange,
    handleAIProfilesGenerated
  };
};