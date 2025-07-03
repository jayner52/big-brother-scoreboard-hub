import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, Trash2, CheckCircle, Clock } from 'lucide-react';

interface WeekControlsProps {
  weekNumber: number;
  isComplete: boolean;
  onMarkComplete: (complete: boolean) => void;
  onClearWeek: () => void;
  onSaveProgress: () => void;
  onSubmitWeek: () => void;
  isAutoSaving: boolean;
}

export const WeekControls: React.FC<WeekControlsProps> = ({
  weekNumber,
  isComplete,
  onMarkComplete,
  onClearWeek,
  onSaveProgress,
  onSubmitWeek,
  isAutoSaving
}) => {
  return (
    <div className="space-y-4">
      {/* Week Status */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Switch
            checked={isComplete}
            onCheckedChange={onMarkComplete}
          />
          <Label className="flex items-center gap-2">
            {isComplete ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                Week {weekNumber} Complete
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 text-orange-500" />
                Week {weekNumber} Draft
              </>
            )}
          </Label>
        </div>
        
        <div className="flex items-center gap-2">
          {isComplete && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Completed
            </Badge>
          )}
          {isAutoSaving && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Save className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Auto-saving...</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={onSaveProgress}
          variant="outline"
          className="flex-1"
          disabled={isAutoSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Progress
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="default">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Week
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Week {weekNumber} Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all data for Week {weekNumber}, including competitions, nominations, evictions, and special events. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onClearWeek} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Clear All Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Button 
          onClick={onSubmitWeek} 
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          size="default"
        >
          {isComplete ? 'Update Week' : 'Complete Week'} {weekNumber}
        </Button>
      </div>
    </div>
  );
};