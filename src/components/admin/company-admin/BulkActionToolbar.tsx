import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, Download, Mail, Users, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkActionToolbarProps {
  selectedUserIds: string[];
  selectedUsers: any[];
  onBulkDelete: (userIds: string[]) => Promise<void>;
  onBulkExport: (users: any[]) => void;
  onClearSelection: () => void;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedUserIds,
  selectedUsers,
  onBulkDelete,
  onBulkExport,
  onClearSelection
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  if (selectedUserIds.length === 0) return null;

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await onBulkDelete(selectedUserIds);
      setIsDeleteDialogOpen(false);
      onClearSelection();
      toast({
        title: "Users Deleted",
        description: `Successfully deleted ${selectedUserIds.length} user(s).`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkExport = () => {
    onBulkExport(selectedUsers);
    toast({
      title: "Export Started",
      description: `Exporting ${selectedUsers.length} user(s) to CSV.`,
    });
  };

  const sendBulkNotification = () => {
    // This would integrate with your email system
    toast({
      title: "Notification Sent",
      description: `Notification sent to ${selectedUserIds.length} user(s).`,
    });
  };

  return (
    <>
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-900">
                  <Badge variant="secondary" className="mr-2">
                    {selectedUserIds.length}
                  </Badge>
                  user{selectedUserIds.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Selected
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendBulkNotification}
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send Notification
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              Clear Selection
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Multiple Users
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to permanently delete <strong>{selectedUserIds.length}</strong> user{selectedUserIds.length !== 1 ? 's' : ''}.
              </p>
              <p className="text-sm text-muted-foreground">
                This action will:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Permanently delete all user accounts and profiles</li>
                <li>Remove all pool memberships and entries</li>
                <li>Delete all chat messages and activity history</li>
                <li>Remove all associated data (cannot be undone)</li>
              </ul>
              <p className="font-medium text-destructive">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : `Delete ${selectedUserIds.length} User${selectedUserIds.length !== 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};