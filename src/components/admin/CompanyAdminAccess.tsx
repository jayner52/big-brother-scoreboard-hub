import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Lock, Unlock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const CompanyAdminAccess: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check auth status and validate session
  useEffect(() => {
    const checkAuthAndSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Not authenticated - clear any existing session
        sessionStorage.removeItem('company_admin_unlocked');
        sessionStorage.removeItem('company_admin_user_id');
        sessionStorage.removeItem('company_admin_timestamp');
        setIsUnlocked(false);
        return;
      }

      setCurrentUserId(user.id);
      
      // Check if already unlocked and validate user binding
      const unlocked = sessionStorage.getItem('company_admin_unlocked');
      const sessionUserId = sessionStorage.getItem('company_admin_user_id');
      const timestamp = sessionStorage.getItem('company_admin_timestamp');
      
      if (unlocked === 'true' && sessionUserId === user.id && timestamp) {
        // Check if session is still valid (30 minutes)
        const sessionTime = parseInt(timestamp);
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        
        if (now - sessionTime < thirtyMinutes) {
          setIsUnlocked(true);
          // Update timestamp to extend session
          sessionStorage.setItem('company_admin_timestamp', now.toString());
        } else {
          // Session expired
          handleLock();
        }
      } else {
        // Invalid session - clear everything
        handleLock();
      }
    };

    checkAuthAndSession();
    
    // Auto-lock on page visibility change (tab switch, minimize, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Start a timer to auto-lock after 5 minutes of inactivity
        setTimeout(() => {
          if (document.hidden) {
            handleLock();
          }
        }, 5 * 60 * 1000);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handlePasswordSubmit = async () => {
    if (attemptCount >= 5) {
      toast({
        title: "Too Many Attempts",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to access company admin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Verify password using edge function
      const { data, error } = await supabase.functions.invoke('verify-company-admin', {
        body: { password }
      });

      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }

      if (data?.valid) {
        setIsUnlocked(true);
        const now = Date.now();
        sessionStorage.setItem('company_admin_unlocked', 'true');
        sessionStorage.setItem('company_admin_user_id', currentUserId);
        sessionStorage.setItem('company_admin_timestamp', now.toString());
        setPassword('');
        setAttemptCount(0);
        
        toast({
          title: "Access Granted",
          description: "Welcome to Poolside Picks Company Admin",
        });
      } else {
        setAttemptCount(prev => prev + 1);
        toast({
          title: "Invalid Password",
          description: `Incorrect password. ${5 - attemptCount - 1} attempts remaining.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Password verification error:', error);
      setAttemptCount(prev => prev + 1);
      toast({
        title: "Authentication Error",
        description: "Unable to verify password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('company_admin_unlocked');
    sessionStorage.removeItem('company_admin_user_id');
    sessionStorage.removeItem('company_admin_timestamp');
    setPassword('');
    setAttemptCount(0);
    
    toast({
      title: "Locked",
      description: "Company admin access has been locked.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  if (isUnlocked) {
    return (
      <div className="mt-12 pt-8 border-t border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Poolside Picks Company Admin</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  <Unlock className="h-3 w-3 mr-1" />
                  Access Unlocked
                </Badge>
              </div>
            </div>
          </div>
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
        
        <div className="bg-card rounded-lg border p-6 text-center">
          <div className="bg-emerald-100 p-3 rounded-lg w-fit mx-auto mb-4">
            <Building2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h4 className="text-xl font-semibold mb-2">Company Admin Dashboard Ready</h4>
          <p className="text-muted-foreground mb-6">
            Access comprehensive user registration data, analytics, and site management tools.
          </p>
          <Button 
            onClick={() => navigate('/company-admin')}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Go to Company Admin Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <Card className="max-w-sm mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="bg-slate-100 p-2 rounded-lg w-fit mx-auto mb-2">
            <Building2 className="h-5 w-5 text-slate-600" />
          </div>
          <CardTitle className="text-base">Company Admin Access</CardTitle>
          <p className="text-xs text-muted-foreground">
            Enter password to access restricted area
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Company admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading || attemptCount >= 5}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {attemptCount > 0 && (
              <p className="text-sm text-red-600">
                {attemptCount >= 5 
                  ? "Too many attempts. Please refresh the page." 
                  : `${5 - attemptCount} attempts remaining`
                }
              </p>
            )}
          </div>
          
          <Button 
            onClick={handlePasswordSubmit} 
            disabled={!password || loading || attemptCount >= 5}
            className="w-full"
          >
            {loading ? "Verifying..." : "Access Company Admin"}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            This section contains sensitive user data and is restricted to company administrators only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};