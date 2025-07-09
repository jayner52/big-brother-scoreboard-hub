import React from 'react';
import { ContestantWithBio, ContestantGroup } from '@/types/admin';
import { ContestantForm } from './ContestantForm';
import { ContestantList } from './ContestantList';
import { GenerateFullCastButton } from './GenerateFullCastButton';
import { ManualSeedButton } from './ManualSeedButton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Camera, Loader2 } from 'lucide-react';
import { useEnhancedContestantCrud } from '@/hooks/useEnhancedContestantCrud';

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
  onView?: (contestant: ContestantWithBio) => void;
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
  onRefresh,
  onView
}) => {
  // Use enhanced CRUD operations
  const { 
    clearAllContestantsEnhanced, 
    populateWithPhotosEnhanced, 
    isClearing 
  } = useEnhancedContestantCrud(contestants, () => {});

  const handleEnhancedClearAll = async () => {
    const success = await clearAllContestantsEnhanced();
    if (success) {
      onRefresh(); // Refresh the parent component's data
    }
  };

  const handlePopulatePhotos = async () => {
    const success = await populateWithPhotosEnhanced();
    if (success) {
      onRefresh(); // Refresh to show updated photos
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual Seed Button for empty pools */}
      <ManualSeedButton 
        contestantCount={contestants.length}
        onSeedComplete={onRefresh}
      />
      
      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        <GenerateFullCastButton onRefresh={onRefresh} seasonNumber={27} />
        
        <Button 
          onClick={handlePopulatePhotos}
          disabled={isClearing}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isClearing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          {isClearing ? 'Processing...' : 'Populate Photos'}
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700"
              disabled={isClearing}
            >
              {isClearing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {isClearing ? 'Clearing...' : 'Clear All Houseguests'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Enhanced Clear All Houseguests</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all houseguests from this pool and clear related data (draft picks, weekly events, etc.). 
                This action cannot be undone. The system will provide detailed feedback about what was cleared.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleEnhancedClearAll}
                className="bg-red-600 hover:bg-red-700"
              >
                Clear All (Enhanced)
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