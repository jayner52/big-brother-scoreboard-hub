import React from 'react';
import { AdminScoringPanel } from '@/components/AdminScoringPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Main Site
          </Button>
        </div>

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