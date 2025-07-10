import React, { useState, useCallback, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Users, Lock, Unlock, Check, X, CreditCard, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { useActivePool } from '@/hooks/useActivePool';
import { usePoolOperations } from '@/hooks/usePoolOperations';
import { useOptimizedPoolEntries } from '@/hooks/useOptimizedPoolEntries';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { UserPaymentButton } from '@/components/enhanced/UserPaymentButton';
import { InstructionAccordion } from '@/components/admin/InstructionAccordion';

// Memoized table row component for better performance
const EntryTableRow = memo(({ 
  entry, 
  activePool, 
  currentUserId, 
  onUpdatePayment, 
  onDeleteEntry, 
  onMarkPrizeSent 
}: any) => {
  return (
    <TableRow key={entry.id}>
      <TableCell className="font-semibold">
        {entry.participant_name}
      </TableCell>
      <TableCell>{entry.team_name}</TableCell>
      <TableCell className="text-sm">{entry.email}</TableCell>
      <TableCell className="text-sm">
        {Array.from({ length: activePool?.picks_per_team || 5 }, (_, i) => 
          entry[`player_${i + 1}` as keyof typeof entry]
        ).filter(Boolean).join(', ')}
      </TableCell>
      {activePool?.has_buy_in && (
        <TableCell>
          <Badge variant={entry.payment_confirmed ? "default" : "destructive"}>
            {entry.payment_confirmed ? "Confirmed" : "Pending"}
          </Badge>
        </TableCell>
      )}
      <TableCell className="text-center font-bold">
        {entry.total_points}
      </TableCell>
      
      {/* Final Position (only show if season is complete) */}
      {activePool?.season_complete && (
        <TableCell className="text-center">
          <Badge variant={entry.final_position && entry.final_position <= 3 ? "default" : "secondary"}>
            #{entry.final_position}
          </Badge>
        </TableCell>
      )}
      
      {/* Prize Won (only show if season is complete) */}
      {activePool?.season_complete && (
        <TableCell className="text-center">
          {entry.prize_amount && entry.prize_amount > 0 ? (
            <div className="flex items-center gap-1 justify-center text-green-600">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold">${entry.prize_amount.toFixed(0)}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
      )}
      
      <TableCell className="text-sm text-muted-foreground">
        {new Date(entry.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <div className="flex gap-2 flex-wrap">
          {/* Payment controls */}
          {activePool?.has_buy_in && (
            <>
              {currentUserId === entry.user_id && !entry.payment_confirmed && (
                <UserPaymentButton 
                  entryId={entry.id}
                  paymentConfirmed={entry.payment_confirmed}
                />
              )}
              
              {!entry.payment_confirmed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdatePayment(entry.id, true)}
                  className="text-green-600 hover:bg-green-50 h-7"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Confirm
                </Button>
              )}
              
              {entry.payment_confirmed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdatePayment(entry.id, false)}
                  className="text-orange-600 hover:bg-orange-50 h-7"
                >
                  <X className="h-3 w-3 mr-1" />
                  Unconfirm
                </Button>
              )}
            </>
          )}
          
          {/* Delete button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDeleteEntry(entry.id)}
            className="text-red-600 hover:bg-red-50 h-7"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

export const OptimizedPoolEntriesManagement: React.FC = () => {
  const { toast } = useToast();
  const activePool = useActivePool();
  const { updatePool } = usePoolOperations();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const confirmDialog = useConfirmDialog();
  
  const {
    entries,
    loading,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    updatePaymentStatus,
    deleteEntry,
    goToPage,
    loadData
  } = useOptimizedPoolEntries({ 
    poolId: activePool?.id || '',
    pageSize: 25 
  });

  const [draftLocked, setDraftLocked] = useState(activePool?.draft_locked || false);

  // Optimized delete handler with confirmation
  const handleDeleteEntry = useCallback(async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    const confirmed = await confirmDialog.confirm({
      title: "Delete Pool Entry",
      description: `Are you sure you want to delete ${entry.participant_name}'s entry? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive"
    }, () => deleteEntry(entryId));
  }, [entries, confirmDialog, deleteEntry]);

  // Optimized payment update with confirmation
  const handleUpdatePayment = useCallback(async (entryId: string, confirmed: boolean) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    if (!confirmed) {
      const shouldProceed = await confirmDialog.confirm({
        title: "Unconfirm Payment",
        description: `Mark ${entry.participant_name}'s payment as pending?`,
        confirmText: "Unconfirm"
      }, () => updatePaymentStatus(entryId, false));
    } else {
      updatePaymentStatus(entryId, true);
    }
  }, [entries, confirmDialog, updatePaymentStatus]);

  const handleToggleDraftLock = useCallback(async () => {
    if (!activePool) return;
    
    try {
      const newLockStatus = !draftLocked;
      const success = await updatePool(activePool.id, {
        draft_locked: newLockStatus
      });

      if (!success) throw new Error('Failed to update pool');

      setDraftLocked(newLockStatus);
      toast({
        title: "Success!",
        description: `Draft ${newLockStatus ? 'locked' : 'unlocked'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling draft lock:', error);
      toast({
        title: "Error",
        description: "Failed to update draft lock status",
        variant: "destructive",
      });
    }
  }, [activePool, draftLocked, updatePool, toast]);

  if (loading) {
    return (
      <div className="text-center py-8 space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-muted-foreground">Loading pool entries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructionAccordion 
        title="Pool Entries Management" 
        tabKey="pool_entries"
      >
        <div className="space-y-2">
          <p>Monitor participant status, payment confirmation, and prize distribution. Track who has drafted and who has paid their entry fee.</p>
          
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <p><strong>🏆 During the Season:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                <li>Track payment status for participants with buy-ins</li>
                <li>Confirm payments manually when received</li>
                <li>Delete problematic or duplicate entries</li>
                <li>Monitor who has submitted teams and when</li>
                <li>Lock/unlock draft editing as needed</li>
              </ul>
            </div>
            
            <div>
              <p><strong>🎁 After Season Completion:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                <li>Prize winners appear with amounts in this table</li>
                <li>Wait for winners to submit payment information</li>
                <li>You'll be notified when payment info is received</li>
                <li>Send prizes via the requested method</li>
                <li>Check "Prize Sent" to confirm delivery</li>
                <li>Winner receives confirmation notification</li>
              </ul>
            </div>
          </div>
        </div>
      </InstructionAccordion>
      
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pool Entries Management ({entries.length} entries)
          </CardTitle>
          <CardDescription className="text-purple-100">
            Manage draft entries and lock/unlock editing
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* Draft Lock Controls */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-6">
            <div className="flex items-center space-x-2">
              {draftLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              <Label>Draft Editing</Label>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {draftLocked ? 'Locked' : 'Unlocked'}
              </span>
              <Switch
                checked={!draftLocked}
                onCheckedChange={handleToggleDraftLock}
              />
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={!hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData(currentPage)}
              >
                Refresh
              </Button>
            </div>
          )}

          {/* Entries Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Team</TableHead>
                  {activePool?.has_buy_in && <TableHead>Payment</TableHead>}
                  <TableHead>Points</TableHead>
                  {activePool?.season_complete && <TableHead>Final Position</TableHead>}
                  {activePool?.season_complete && <TableHead>Prize Won</TableHead>}
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <EntryTableRow
                    key={entry.id}
                    entry={entry}
                    activePool={activePool}
                    currentUserId={currentUserId}
                    onUpdatePayment={handleUpdatePayment}
                    onDeleteEntry={handleDeleteEntry}
                    onMarkPrizeSent={() => {}} // Implement if needed
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {entries.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pool entries found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={confirmDialog.handleConfirm}
        onCancel={confirmDialog.cancel}
        title={confirmDialog.options.title}
        description={confirmDialog.options.description}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
      />
    </div>
  );
};