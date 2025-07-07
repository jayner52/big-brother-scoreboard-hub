import React from 'react';
import { RoleBadge } from '@/components/ui/role-badge';
import { usePool } from '@/contexts/PoolContext';

interface UserRoleBadgeProps {
  userId: string;
  poolId?: string;
  size?: 'sm' | 'default';
  showTooltip?: boolean;
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ 
  userId, 
  poolId, 
  size = 'default',
  showTooltip = true 
}) => {
  const { userPools, activePool } = usePool();
  
  const targetPoolId = poolId || activePool?.id;
  if (!targetPoolId) return null;
  
  const membership = userPools.find(p => p.pool_id === targetPoolId);
  if (!membership) return null;
  
  // Only show role badge for admin and owner roles
  if (membership.role === 'member') return null;
  
  return (
    <RoleBadge 
      role={membership.role} 
      size={size} 
      showTooltip={showTooltip} 
    />
  );
};