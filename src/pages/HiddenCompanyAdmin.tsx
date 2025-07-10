import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CompanyAdminDashboard } from '@/components/admin/CompanyAdminDashboard';
import { supabase } from '@/integrations/supabase/client';

// Only accessible via direct URL with ?company=true parameter and specific user IDs
const AUTHORIZED_ADMIN_IDS = [
  // Add specific user IDs here that should have company admin access
];

const HiddenCompanyAdmin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        // Check if accessed via correct URL parameter
        const companyParam = searchParams.get('company');
        if (companyParam !== 'true') {
          navigate('/dashboard');
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }

        setCurrentUserId(user.id);
        
        // Check if user is in authorized list (if list is not empty)
        if (AUTHORIZED_ADMIN_IDS.length > 0 && !AUTHORIZED_ADMIN_IDS.includes(user.id)) {
          navigate('/dashboard');
          return;
        }

        // Enhanced security check with user binding and timestamp validation
        const unlocked = sessionStorage.getItem('company_admin_unlocked');
        const sessionUserId = sessionStorage.getItem('company_admin_user_id');
        const timestamp = sessionStorage.getItem('company_admin_timestamp');
        
        if (unlocked !== 'true' || sessionUserId !== user.id || !timestamp) {
          navigate('/admin');
          return;
        }
        
        // Check session expiry (10 minutes instead of 30)
        const sessionTime = parseInt(timestamp);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - sessionTime > tenMinutes) {
          // Session expired
          sessionStorage.removeItem('company_admin_unlocked');
          sessionStorage.removeItem('company_admin_user_id');
          sessionStorage.removeItem('company_admin_timestamp');
          navigate('/admin');
          return;
        }
        
        // Update timestamp to extend session
        sessionStorage.setItem('company_admin_timestamp', now.toString());
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error validating company admin access:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    validateAccess();

    // Auto-lock when user becomes inactive or changes tabs
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Set a timeout to lock after 2 minutes of inactivity
        setTimeout(() => {
          if (document.hidden) {
            handleLock();
          }
        }, 2 * 60 * 1000);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate, searchParams]);

  const handleLock = () => {
    sessionStorage.removeItem('company_admin_unlocked');
    sessionStorage.removeItem('company_admin_user_id');
    sessionStorage.removeItem('company_admin_timestamp');
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Validating access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Panel
          </Button>
          
          <Button 
            onClick={handleLock} 
            variant="outline" 
            size="sm"
            className="text-muted-foreground"
          >
            <Lock className="h-4 w-4 mr-2" />
            Lock Access
          </Button>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white py-6 px-8 rounded-lg shadow-lg mb-6">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            Poolside Picks Company Admin
          </h1>
          <p className="text-lg text-emerald-100">
            User registration dashboard and comprehensive site analytics
          </p>
        </div>

        {/* Dashboard */}
        <CompanyAdminDashboard />

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-16 py-8 border-t">
          <p>Company admin access only • Poolside Picks Analytics Dashboard</p>
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

export default HiddenCompanyAdmin;