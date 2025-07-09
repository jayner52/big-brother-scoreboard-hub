import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Users, AlertTriangle } from 'lucide-react';

interface UserData {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  registration_date: string;
  pool_memberships: Array<{
    pool_name: string;
    role: string;
    joined_at: string;
  }>;
  account_age_days: number;
}

interface UserDeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: UserData | null;
  isDeleting: boolean;
}

export const UserDeleteConfirmation: React.FC<UserDeleteConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  isDeleting
}) => {
  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete User Account
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user account and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div>
              <p className="font-semibold">{user.display_name || 'Anonymous User'}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {user.email || 'No email'}
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-3 w-3" />
              Registered {user.account_age_days} days ago
            </div>

            {user.pool_memberships.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-3 w-3" />
                  Member of {user.pool_memberships.length} pool(s):
                </div>
                <div className="space-y-1">
                  {user.pool_memberships.map((membership, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span>{membership.pool_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {membership.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
            <p className="text-sm text-destructive font-medium">⚠️ Data to be deleted:</p>
            <ul className="text-xs text-destructive mt-1 space-y-1">
              <li>• User profile and preferences</li>
              <li>• Pool memberships and entries</li>
              <li>• Chat messages and interactions</li>
              <li>• Payment information and history</li>
              <li>• All associated account data</li>
            </ul>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};