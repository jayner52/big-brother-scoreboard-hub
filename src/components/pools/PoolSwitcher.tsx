
import { useState } from 'react';
import { ChevronDown, Plus, Users, Trash2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PoolCreateModal } from './PoolCreateModal';
import { PoolJoinModal } from './PoolJoinModal';

export const PoolSwitcher = () => {
  const { 
    activePool, 
    userPools, 
    setActivePool, 
    getUserRole, 
    deletePool, 
    leavePool,
    getUserPaymentStatus,
    getPoolPaymentStatus,
    loading 
  } = usePool();
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [poolToDelete, setPoolToDelete] = useState<{ id: string; name: string; hasMoney: boolean } | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [poolToLeave, setPoolToLeave] = useState<{ id: string; name: string } | null>(null);
  const [userHasPaid, setUserHasPaid] = useState(false);
  const [loading_operations, setLoadingOperations] = useState(false);
  const [adminConfirmsRefunds, setAdminConfirmsRefunds] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleDeletePool = async () => {
    if (!poolToDelete) return;
    
    // Validate confirmation text for pools with money
    if (poolToDelete.hasMoney && confirmationText !== poolToDelete.name) {
      toast({
        title: "Error", 
        description: "Please type the pool name exactly to confirm deletion",
        variant: "destructive",
      });
      return;
    }

    // Require admin confirmation for pools with money
    if (poolToDelete.hasMoney && !adminConfirmsRefunds) {
      toast({
        title: "Error",
        description: "You must confirm that refunds will be handled",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoadingOperations(true);
      await deletePool(poolToDelete.id, adminConfirmsRefunds);
      
      toast({
        title: "Pool deleted",
        description: poolToDelete.hasMoney 
          ? "Pool deleted. All members have been notified about potential refunds." 
          : "Pool deleted successfully.",
      });
      
      setDeleteDialogOpen(false);
      setPoolToDelete(null);
      setAdminConfirmsRefunds(false);
      setConfirmationText('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pool",
        variant: "destructive",
      });
    } finally {
      setLoadingOperations(false);
    }
  };

  const confirmDeletePool = async (poolId: string, poolName: string) => {
    setLoadingOperations(true);
    try {
      // Check if pool has collected money
      const hasMoney = await getPoolPaymentStatus(poolId);
      setPoolToDelete({ id: poolId, name: poolName, hasMoney });
      setDeleteDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to prepare delete pool dialog",
        variant: "destructive",
      });
    } finally {
      setLoadingOperations(false);
    }
  };

  const handleLeavePool = async (poolId: string, poolName: string) => {
    setLoadingOperations(true);
    try {
      // Check if user has paid
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const hasPaid = await getUserPaymentStatus(poolId, user.id);
        setUserHasPaid(hasPaid);
      }
      setPoolToLeave({ id: poolId, name: poolName });
      setLeaveDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to prepare leave pool dialog",
        variant: "destructive",
      });
    } finally {
      setLoadingOperations(false);
    }
  };

  const confirmLeavePool = async () => {
    if (!poolToLeave) return;
    
    setLoadingOperations(true);
    const result = await leavePool(poolToLeave.id);
    
    if (result.success) {
      toast({
        title: "Left pool",
        description: `You have left ${poolToLeave.name}`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to leave pool",
        variant: "destructive",
      });
    }
    
    setLeaveDialogOpen(false);
    setPoolToLeave(null);
    setLoadingOperations(false);
  };


  const canLeavePool = (membership: any) => {
    return membership.role !== 'owner' && userPools.filter(p => p.active).length > 1;
  };


  const getTooltipContent = (action: string, membership: any) => {
    switch (action) {
      case 'leave':
        if (membership.role === 'owner') {
          return "Owners must transfer ownership before leaving the pool";
        }
        if (userPools.filter(p => p.active).length <= 1) {
          return "You must be in at least one pool. Join another pool first.";
        }
        return "Leave this pool. You will lose access to teams, standings, and chat.";
      
      case 'delete':
        return membership.pool?.has_buy_in 
          ? "Permanently delete this pool. WARNING: This pool has entry fees - ensure all funds are handled first."
          : "Permanently delete this pool. This action cannot be undone.";
      
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-32 bg-muted animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (!activePool && userPools.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button onClick={() => setShowCreateModal(true)} size="sm" className="create-pool-btn">
          <Plus className="h-4 w-4 mr-2" />
          Create Pool
        </Button>
        <Button onClick={() => setShowJoinModal(true)} variant="outline" size="sm" className="join-pool-btn">
          Join Pool
        </Button>
        <PoolCreateModal 
          open={showCreateModal} 
          onOpenChange={setShowCreateModal} 
        />
        <PoolJoinModal 
          open={showJoinModal} 
          onOpenChange={setShowJoinModal} 
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 min-w-48">
            <Users className="h-4 w-4" />
            <div className="flex flex-col items-start text-left">
              <span className="font-medium truncate max-w-32">
                {activePool?.name || 'Select Pool'}
              </span>
              {activePool && (
                <span className="text-xs text-muted-foreground">
                  {getUserRole(activePool.id) === 'owner' ? 'Owner' : 
                   getUserRole(activePool.id) === 'admin' ? 'Admin' : 'Member'}
                </span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 ml-auto" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Your Pools</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {userPools.map((membership) => (
            <DropdownMenuItem
              key={membership.pool_id}
              onClick={() => setActivePool(membership.pool!)}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-medium">{membership.pool!.name}</span>
                <span className="text-xs text-muted-foreground">
                  {membership.role === 'owner' ? 'Owner' : 
                   membership.role === 'admin' ? 'Admin' : 'Member'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {activePool?.id === membership.pool_id && (
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                )}
                {canLeavePool(membership) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-muted-foreground/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeavePool(membership.pool_id, membership.pool!.name);
                        }}
                        disabled={loading_operations}
                      >
                        <LogOut className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getTooltipContent('leave', membership)}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {membership.role === 'owner' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeletePool(membership.pool_id, membership.pool!.name);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getTooltipContent('delete', membership)}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Pool
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Join Pool
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PoolCreateModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
        onSuccess={() => setShowCreateModal(false)}
      />
      <PoolJoinModal 
        open={showJoinModal} 
        onOpenChange={setShowJoinModal} 
        onSuccess={() => setShowJoinModal(false)}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Pool: {poolToDelete?.name}</DialogTitle>
            <DialogDescription>
              {poolToDelete?.hasMoney ? (
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ This pool has collected entry fees
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All pool members will be notified of the deletion and advised to contact you for refunds.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        checked={adminConfirmsRefunds}
                        onChange={(e) => setAdminConfirmsRefunds(e.target.checked)}
                        className="mt-1"
                      />
                      <span className="text-sm">
                        I confirm that I will handle refunds for all members who have paid entry fees
                      </span>
                    </label>
                    <div>
                      <label className="text-sm font-medium">
                        Type the pool name "{poolToDelete?.name}" to confirm:
                      </label>
                      <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder={poolToDelete?.name}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p>Are you sure you want to permanently delete this pool? This action cannot be undone and will remove all pool data, entries, and results.</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeletePool}
              disabled={loading_operations || (poolToDelete?.hasMoney && (!adminConfirmsRefunds || confirmationText !== poolToDelete?.name))}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading_operations ? "Deleting..." : "Delete Pool"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave {poolToLeave?.name}?</DialogTitle>
            <DialogDescription>
              {userHasPaid && (
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ You have marked payment as sent. Leaving the pool will NOT refund your contribution as it has been allocated to the prize pool.
                  </p>
                </div>
              )}
              You will lose access to this pool's teams, standings, and chat. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmLeavePool}
              disabled={loading_operations}
              className="bg-muted-foreground hover:bg-muted-foreground/90"
            >
              {loading_operations ? "Leaving..." : "Leave Pool"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </TooltipProvider>
  );
};
