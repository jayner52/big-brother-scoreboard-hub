import React from 'react';
import { ContestantWithBio, ContestantGroup } from '@/types/admin';
import { ContestantCard } from './ContestantCard';

interface ContestantListProps {
  contestants: ContestantWithBio[];
  groups: ContestantGroup[];
  editingId: string | null;
  editForm: Partial<ContestantWithBio>;
  onEdit: (contestant: ContestantWithBio) => void;
  onSave: () => void;
  onCancel: () => void;
  onFormChange: (updates: Partial<ContestantWithBio>) => void;
  onDelete: (id: string) => void;
}

export const ContestantList: React.FC<ContestantListProps> = ({
  contestants,
  groups,
  editingId,
  editForm,
  onEdit,
  onSave,
  onCancel,
  onFormChange,
  onDelete,
}) => {
  return (
    <div className="grid gap-4">
      {contestants.map((contestant) => (
        <ContestantCard
          key={contestant.id}
          contestant={contestant}
          groups={groups}
          isEditing={editingId === contestant.id}
          editForm={editForm}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
          onFormChange={onFormChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};