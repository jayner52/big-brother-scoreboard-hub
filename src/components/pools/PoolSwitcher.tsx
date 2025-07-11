import { useState } from 'react';
import { ChevronDown, Plus, Users, Trash2, LogOut, UserCheck } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    transferOwnership,
    getEligibleAdminsForTransfer,
    getUserPaymentStatus,
    loading 
  } = usePool();
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [poolToDelete, setPoolToDelete] = useState<string | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [poolToLeave, setPoolToLeave] = useState<{ id: string; name: string } | null>(null);
  const [poolToTransfer, setPoolToTransfer] = useState<{ id: string; name: string } | null>(null);
  const [userHasPaid, setUserHasPaid] = useState(false);
  const [eligibleAdmins, setEligibleAdmins] = useState<Array<{ user_id: string; display_name: string }>>([]);
  const [selectedNewOwner, setSelectedNewOwner] = useState<string>('');
  const [loading_operations, setLoadingOperations] = useState(false);

  const handleDeletePool = async () => {
    if (!poolToDelete) return;
    
    const success = await deletePool(poolToDelete);
    if (success) {
      toast({
        title: "Pool deleted",
        description: "The pool has been permanently deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete pool",
        variant: "destructive",
      });
    }
    
    setDeleteDialogOpen(false);
    setPoolToDelete(null);
  };

  const confirmDeletePool = (poolId: string, poolName: string) => {
    setPoolToDelete(poolId);
    setDeleteDialogOpen(true);
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

  const handleTransferOwnership = async (poolId: string, poolName: string) => {
    setLoadingOperations(true);
    try {
      const admins = await getEligibleAdminsForTransfer(poolId);
      if (admins.length === 0) {
        toast({
          title: "No eligible members",
          description: "There are no admin members available to transfer ownership to.",
          variant: "destructive",
        });
        return;
      }
      setEligibleAdmins(admins);
      setPoolToTransfer({ id: poolId, name: poolName });
      setSelectedNewOwner('');
      setTransferDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to load eligible admins",
        variant: "destructive",
      });
    } finally {
      setLoadingOperations(false);
    }
  };

  const confirmTransferOwnership = async () => {
    if (!poolToTransfer || !selectedNewOwner) return;
    
    setLoadingOperations(true);
    const result = await transferOwnership(poolToTransfer.id, selectedNewOwner);
    
    if (result.success) {
      toast({
        title: "Ownership transferred",
        description: `Ownership of ${poolToTransfer.name} has been transferred`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to transfer ownership",
        variant: "destructive",
      });
    }
    
    setTransferDialogOpen(false);
    setPoolToTransfer(null);
    setSelectedNewOwner('');
    setLoadingOperations(false);
  };

  const canLeavePool = (membership: any) => {
    return membership.role !== 'owner' && userPools.filter(p => p.active).length > 1;
  };

  const canTransferOwnership = (membership: any) => {
    return membership.role === 'owner';
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
    <>
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
                )}
                {canTransferOwnership(membership) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-muted-foreground/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTransferOwnership(membership.pool_id, membership.pool!.name);
                    }}
                    disabled={loading_operations}
                  >
                    <UserCheck className="h-3 w-3" />
                  </Button>
                )}
                {membership.role === 'owner' && (
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pool</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this pool? This action cannot be undone and will remove all pool data, entries, and results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePool} className="bg-destructive hover:bg-destructive/90">
              Delete Pool
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Ownership of {poolToTransfer?.name}</DialogTitle>
            <DialogDescription>
              Select an admin member to transfer ownership to. This action cannot be undone. You will become a regular member.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedNewOwner} onValueChange={setSelectedNewOwner}>
              <SelectTrigger>
                <SelectValue placeholder="Select new owner..." />
              </SelectTrigger>
              <SelectContent>
                {eligibleAdmins.map((admin) => (
                  <SelectItem key={admin.user_id} value={admin.user_id}>
                    {admin.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmTransferOwnership}
              disabled={loading_operations || !selectedNewOwner}
            >
              {loading_operations ? "Transferring..." : "Transfer Ownership"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};