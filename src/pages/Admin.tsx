import React, { useState, useEffect } from 'react';
import { AdminScoringPanel } from '@/components/AdminScoringPanel';
import { AdminSetupWizard } from '@/components/admin/AdminSetupWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { usePool } from '@/contexts/PoolContext';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const { activePool } = usePool();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  // Reset showSetupWizard after it's been shown
  useEffect(() => {
    if (showSetupWizard) {
      const timer = setTimeout(() => setShowSetupWizard(false), 100);
      return () => clearTimeout(timer);
    }
  }, [showSetupWizard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {user ? 'Back to Dashboard' : 'Back to Home'}
          </Button>
          
          {activePool && (
            <Button 
              variant="outline" 
              onClick={() => setShowSetupWizard(true)}
              className="flex items-center gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              Show Setup Checklist
            </Button>
          )}
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white py-6 px-8 rounded-lg shadow-lg mb-6">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Admin Panel
          </h1>
          <p className="text-lg text-red-100">
            Manage weekly results, houseguest status, and bonus questions
          </p>
        </div>

        {/* Admin Setup Wizard */}
        {(showSetupWizard || !localStorage.getItem(`wizard-dismissed-${activePool?.id}`)) && (
          <AdminSetupWizard forceShow={showSetupWizard} />
        )}

        {/* Admin Panels */}
        <div data-admin-panel>
          <AdminScoringPanel />
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-16 py-8 border-t">
          <p>Admin access only • Big Brother Fantasy Pool Management</p>
        </footer>
      </div>
    </div>
  );
};

export default Admin;