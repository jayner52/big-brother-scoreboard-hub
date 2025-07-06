import React from 'react';
import { ContestantWithBio, ContestantGroup } from '@/types/admin';
import { ContestantForm } from './ContestantForm';
import { ContestantList } from './ContestantList';
import { GenerateFullCastButton } from './GenerateFullCastButton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

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
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onRefresh: () => void;
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
  onAddContestant,
  onDelete,
  onClearAll,
  onRefresh
}) => {
  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        <GenerateFullCastButton onRefresh={onRefresh} />
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Houseguests
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Houseguests</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all houseguests from this pool. This action cannot be undone and may affect existing drafts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onClearAll}
                className="bg-red-600 hover:bg-red-700"
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

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
        onDelete={onDelete}
      />
    </div>
  );
};