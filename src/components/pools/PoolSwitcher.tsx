import { useState } from 'react';
import { ChevronDown, Plus, Users } from 'lucide-react';
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
import { usePool } from '@/contexts/PoolContext';
import { PoolCreateModal } from './PoolCreateModal';
import { PoolJoinModal } from './PoolJoinModal';

export const PoolSwitcher = () => {
  const { activePool, userPools, setActivePool, getUserRole, loading } = usePool();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

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
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Pool
        </Button>
        <Button onClick={() => setShowJoinModal(true)} variant="outline" size="sm">
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
              {activePool?.id === membership.pool_id && (
                <Badge variant="secondary" className="text-xs">Active</Badge>
              )}
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
    </>
  );
};