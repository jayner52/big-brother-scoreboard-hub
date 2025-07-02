import React from 'react';
import { AdminScoringPanel } from '@/components/AdminScoringPanel';

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-lg text-gray-600">
            Manage weekly results, contestant status, and bonus questions
          </p>
        </div>

        {/* Admin Panel */}
        <AdminScoringPanel />

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-16 py-8 border-t">
          <p>Admin access only • Big Brother Fantasy Pool Management</p>
        </footer>
      </div>
    </div>
  );
};

export default Admin;