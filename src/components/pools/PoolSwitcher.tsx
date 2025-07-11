import { useState } from 'react';
import { ChevronDown, Plus, Users, Trash2 } from 'lucide-react';
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
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';
import { PoolCreateModal } from './PoolCreateModal';
import { PoolJoinModal } from './PoolJoinModal';

export const PoolSwitcher = () => {
  const { activePool, userPools, setActivePool, getUserRole, deletePool, loading } = usePool();
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [poolToDelete, setPoolToDelete] = useState<string | null>(null);

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
    </>
  );
};