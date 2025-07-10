import React, { useState, memo } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { useActivePool } from '@/hooks/useActivePool';
import { usePoolPermissions } from '@/hooks/usePoolPermissions';
import { useAdminTabPersistence } from '@/hooks/useAdminTabPersistence';
import { AdminAccessDenied } from './admin/AdminAccessDenied';
import { AdminHeader } from './admin/AdminHeader';
import { AdminTabsList } from './admin/AdminTabsList';
import { AdminTabsContent } from './admin/AdminTabsContent';

export const AdminScoringPanel: React.FC = memo(() => {
  const { canManagePool, canManageRoles, getUserRole } = usePoolPermissions();
  const activePool = useActivePool();
  const [activeTab, setActiveTab] = useState('settings');
  
  const userRole = getUserRole(activePool?.id || '');
  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin';

  const { handleTabChange } = useAdminTabPersistence({
    activePool,
    canManageRoles,
    setActiveTab
  });

  if (!canManagePool()) {
    return <AdminAccessDenied />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <AdminHeader isOwner={isOwner} isAdmin={isAdmin} />

      <div className="bg-background border rounded-lg shadow-sm">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <AdminTabsList canManageRoles={canManageRoles()} />
          <AdminTabsContent canManageRoles={canManageRoles()} />
        </Tabs>
      </div>
    </div>
  );
});