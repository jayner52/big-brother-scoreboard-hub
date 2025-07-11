import React from 'react';
import { Settings } from 'lucide-react';
import { AdminInstructionsModal } from './AdminInstructionsModal';

interface AdminHeaderProps {
  isOwner: boolean;
  isAdmin: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ isOwner, isAdmin }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Admin Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="bg-gradient-to-r from-coral to-orange-500 p-2 rounded-lg">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-lg text-foreground">Pool Management</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Admin Dashboard</span>
              {isOwner && (
                <>
                  <span>•</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded border">OWNER</span>
                </>
              )}
              {isAdmin && (
                <>
                  <span>•</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded border">ADMIN</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Right: Instructions Button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <AdminInstructionsModal />
        </div>
      </div>
    </div>
  );
};