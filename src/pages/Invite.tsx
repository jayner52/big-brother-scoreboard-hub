import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowRight } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Invite = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { joinPoolByCode, setActivePool } = usePool();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleJoinPool = async () => {
    if (!code) {
      toast({
        title: "Error",
        description: "Invalid invite code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await joinPoolByCode(code);
      
      if (result.success && result.data) {
        if (result.data) {
          setActivePool(result.data);
        }
        toast({
          title: "Success!",
          description: `Successfully joined the pool`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to join pool",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join pool",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">You're Invited!</CardTitle>
            <CardDescription>
              Sign in to join this Big Brother Fantasy Pool
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 mb-2">
                <strong>Invite Code:</strong> <span className="font-mono">{code}</span>
              </p>
              <p className="text-xs text-blue-600">
                We'll use this code to add you to the pool after you sign in
              </p>
            </div>
            <Button onClick={handleSignIn} className="w-full">
              <ArrowRight className="h-4 w-4 mr-2" />
              Sign In to Join Pool
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Join Pool</CardTitle>
          <CardDescription>
            You're ready to join this fantasy pool!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 mb-2">
              <strong>Invite Code:</strong> <span className="font-mono">{code}</span>
            </p>
            <p className="text-xs text-green-600">
              Click below to join the pool and start drafting your team
            </p>
          </div>
          <Button onClick={handleJoinPool} disabled={loading} className="w-full">
            {loading ? 'Joining...' : 'Join Pool & Start Playing'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invite;