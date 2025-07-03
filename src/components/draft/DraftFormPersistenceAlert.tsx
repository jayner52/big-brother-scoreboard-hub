import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Save, Trash2 } from 'lucide-react';

interface DraftFormPersistenceAlertProps {
  hasSavedData: boolean;
  onClearSavedData: () => void;
}

export const DraftFormPersistenceAlert: React.FC<DraftFormPersistenceAlertProps> = ({
  hasSavedData,
  onClearSavedData
}) => {
  if (!hasSavedData) return null;

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Save className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Your draft progress has been automatically saved and restored.</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearSavedData}
          className="ml-2"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear Saved Data
        </Button>
      </AlertDescription>
    </Alert>
  );
};