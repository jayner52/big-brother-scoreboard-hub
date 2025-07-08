import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { useResetAllWeeks } from '@/hooks/useResetAllWeeks';

export const ResetAllWeeksButton: React.FC = () => {
  const { resetAllWeeks, isResetting } = useResetAllWeeks();

  const handleReset = async () => {
    const success = await resetAllWeeks();
    if (success) {
      // Reload the page after successful reset
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          disabled={isResetting}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {isResetting ? 'Resetting...' : 'Reset All Weeks'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Reset All Weekly Data?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="font-medium text-destructive">
              ⚠️ This action will permanently delete ALL weekly data for this pool:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>All weekly events and competitions</li>
              <li>All special events and bonus points</li>
              <li>All weekly results and drafts</li>
              <li>All team snapshots and historical data</li>
              <li>Reset all contestant statuses to active</li>
              <li>Reset current game week to Week 1</li>
              <li>Reset pool completion status</li>
            </ul>
            <p className="font-medium text-destructive">
              This action cannot be undone and will affect all participants in the pool.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleReset}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isResetting}
          >
            {isResetting ? 'Resetting...' : 'Reset All Data'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};