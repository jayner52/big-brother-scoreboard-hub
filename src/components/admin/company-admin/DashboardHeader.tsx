import React from 'react';

interface DashboardHeaderProps {
  className?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ className }) => {
  return (
    <div className={`flex items-center justify-between animate-fade-in ${className || ''}`}>
      <h2 className="text-2xl font-bold">Company Admin Dashboard</h2>
    </div>
  );
};