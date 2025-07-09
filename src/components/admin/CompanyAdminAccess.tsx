import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminEmailDashboard } from './AdminEmailDashboard';
import { Building2, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const CompanyAdminAccess: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const { toast } = useToast();

  // Check if already unlocked in session
  useEffect(() => {
    const unlocked = sessionStorage.getItem('company_admin_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
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

    setLoading(true);
    try {
      // Simple direct comparison for now (we can add hashing later)
      const validPassword = 'EW7e1rM2WBs16TFyWJiP';
      
      if (password === validPassword) {
        setIsUnlocked(true);
        sessionStorage.setItem('company_admin_unlocked', 'true');
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
    setPassword('');
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
                  Unlocked
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
        
        <AdminEmailDashboard />
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