import React, { useState, useEffect } from 'react';
import { AdminScoringPanel } from '@/components/AdminScoringPanel';
import { AdminSetupWizardSimplified } from '@/components/admin/AdminSetupWizardSimplified';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, CheckSquare } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { usePool } from '@/contexts/PoolContext';
import { CompanyAdminAccess } from '@/components/admin/CompanyAdminAccess';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const { activePool } = usePool();
  const { isAdmin, loading: adminLoading } = useAdminAccess();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      // Only redirect if user is not authenticated at all
      if (!user) {
        navigate('/auth');
      }
    });
  }, [navigate]);

  // Redirect non-admin users after admin check completes
  useEffect(() => {
    if (!adminLoading && user && !isAdmin) {
      navigate(user ? '/dashboard' : '/');
    }
  }, [adminLoading, user, isAdmin, navigate]);

  // Check for new pool creation and first visit
  useEffect(() => {
    const newPool = searchParams.get('newPool');
    const firstVisit = searchParams.get('firstVisit');
    
    if (newPool === 'true') {
      setShowSetupWizard(true);
      // Clear the URL parameter
      navigate('/admin', { replace: true });
    }
    
    if (firstVisit === 'true') {
      setIsFirstVisit(true);
      setShowSetupWizard(true);
      // Clear the URL parameter
      navigate('/admin', { replace: true });
    }
  }, [searchParams, navigate]);

  // Reset showSetupWizard after it's been shown
  useEffect(() => {
    if (showSetupWizard) {
      const timer = setTimeout(() => setShowSetupWizard(false), 100);
      return () => clearTimeout(timer);
    }
  }, [showSetupWizard]);

  // Show loading while checking admin access
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

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
          
          {/* Removed duplicate Setup Checklist button - it's shown in AdminSetupWizardSimplified */}
        </div>

        {/* Welcome message for first-time admins */}
        {isFirstVisit && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-3 flex items-center gap-2">
              🎉 Welcome to Your New Pool!
            </h2>
            <p className="text-blue-700 mb-2">
              Congratulations on creating your pool! Follow the setup checklist below to get everything ready for your participants.
            </p>
            <p className="text-blue-600 text-sm">
              <strong>Note:</strong> We've automatically hidden everyone's picks until the draft period ends to keep the competition fair.
            </p>
          </div>
        )}

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
        <AdminSetupWizardSimplified forceShow={showSetupWizard || isFirstVisit} />

        {/* Admin Panels */}
        <div data-admin-panel>
          <AdminScoringPanel />
        </div>

        {/* Company Admin Access - Separate from pool admin */}
        <CompanyAdminAccess />

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-16 py-8 border-t">
          <p>Admin access only • Big Brother Fantasy Pool Management</p>
          <p className="mt-2">
            Need support? Email us at{' '}
            <a 
              href="mailto:admin@poolside-picks.com" 
              className="text-blue-600 hover:underline"
            >
              admin@poolside-picks.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Admin;