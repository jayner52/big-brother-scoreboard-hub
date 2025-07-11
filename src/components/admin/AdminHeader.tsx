import React from 'react';
import { Settings } from 'lucide-react';
import { AdminInstructionsModal } from './AdminInstructionsModal';

interface AdminHeaderProps {
  isOwner: boolean;
  isAdmin: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ isOwner, isAdmin }) => {
  return (
    <div className="bg-gradient-admin rounded-lg p-6 shadow-lg mb-6 border-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Admin Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-xl text-white">Pool Management</h2>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span>Admin Dashboard</span>
              {isOwner && (
                <>
                  <span>•</span>
                  <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full border border-white/30 backdrop-blur-sm">OWNER</span>
                </>
              )}
              {isAdmin && (
                <>
                  <span>•</span>
                  <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full border border-white/30 backdrop-blur-sm">ADMIN</span>
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