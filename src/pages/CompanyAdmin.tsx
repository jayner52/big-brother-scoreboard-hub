import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CompanyAdminDashboard } from '@/components/admin/CompanyAdminDashboard';

const CompanyAdmin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated via session storage
    const unlocked = sessionStorage.getItem('company_admin_unlocked');
    if (unlocked !== 'true') {
      navigate('/admin');
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  const handleLock = () => {
    sessionStorage.removeItem('company_admin_unlocked');
    navigate('/admin');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Redirecting to admin panel...</p>
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

export default CompanyAdmin;