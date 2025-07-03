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
      resetForm();
    }
  };

  const handleAddContestant = async () => {
    const success = await addContestant(editForm);
    if (success) {
      resetForm();
    }
  };

  const handleDelete = async (contestantId: string) => {
    await deleteContestant(contestantId);
  };

  const handleClearAll = async () => {
    await clearAllContestants();
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