import React from 'react';
import { ContestantWithBio, ContestantGroup } from '@/types/admin';
import { ContestantForm } from './ContestantForm';
import { ContestantList } from './ContestantList';

interface ManageContestantsTabProps {
  contestants: ContestantWithBio[];
  groups: ContestantGroup[];
  showAddForm: boolean;
  editingId: string | null;
  editForm: Partial<ContestantWithBio>;
  onEdit: (contestant: ContestantWithBio) => void;
  onSave: () => void;
  onCancel: () => void;
  onFormChange: (updates: Partial<ContestantWithBio>) => void;
  onAddContestant: () => void;
}

export const ManageContestantsTab: React.FC<ManageContestantsTabProps> = ({
  contestants,
  groups,
  showAddForm,
  editingId,
  editForm,
  onEdit,
  onSave,
  onCancel,
  onFormChange,
  onAddContestant
}) => {
  return (
    <div className="space-y-6">
      {showAddForm && (
        <ContestantForm
          editForm={editForm}
          groups={groups}
          onFormChange={onFormChange}
          onSave={onAddContestant}
          onCancel={onCancel}
          isEditing={false}
        />
      )}

      <ContestantList
        contestants={contestants}
        groups={groups}
        editingId={editingId}
        editForm={editForm}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
        onFormChange={onFormChange}
      />
    </div>
  );
};