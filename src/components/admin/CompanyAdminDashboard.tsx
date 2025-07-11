import React from 'react';
import { useCompanyAdminData } from '@/hooks/useCompanyAdminData';
import { DashboardHeader } from './company-admin/DashboardHeader';
import { DashboardTabs } from './company-admin/DashboardTabs';
import { LoadingState } from './company-admin/LoadingState';

export const CompanyAdminDashboard: React.FC = () => {
  const { users, stats, loading, loadUserRegistrations } = useCompanyAdminData();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardTabs 
        users={users}
        stats={stats}
        onUsersUpdate={loadUserRegistrations}
      />
    </div>
  );
};