import { usePool } from '@/contexts/PoolContext';

export const usePoolPermissions = () => {
  const { 
    getUserRole, 
    canManagePool, 
    isPoolOwner, 
    canViewFinancials, 
    canManageRoles, 
    canManageWeeklyEvents, 
    canManageBonusQuestions 
  } = usePool();
  
  return {
    getUserRole,
    canManagePool,
    isPoolOwner,
    canViewFinancials,
    canManageRoles,
    canManageWeeklyEvents,
    canManageBonusQuestions,
  };
};