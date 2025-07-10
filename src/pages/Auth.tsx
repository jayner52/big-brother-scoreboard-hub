import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePool } from '@/contexts/PoolContext';
import { ForgotPassword } from '@/components/auth/ForgotPassword';
import { TermsModal } from '@/components/auth/TermsModal';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { SignInForm } from '@/components/auth/SignInForm';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { useAuthForm } from '@/hooks/useAuthForm';
import { usePasswordVisibility } from '@/hooks/usePasswordVisibility';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';

const Auth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');
  const { joinPoolByCode, setActivePool } = usePool();
  
  // Custom hooks for form management
  const formState = useAuthForm();
  const passwordVisibility = usePasswordVisibility();
  const authHandlers = useAuthHandlers({...formState, ...passwordVisibility});

  const handlePostAuthJoin = async (user: any) => {
    const pendingInviteCode = localStorage.getItem('pendingInviteCode');
    if (pendingInviteCode) {
      try {
        localStorage.removeItem('pendingInviteCode');
        const result = await joinPoolByCode(pendingInviteCode);
        
        if (result.success && result.data) {
          setActivePool(result.data);
          toast({
            title: "Welcome!",
            description: `Successfully joined the pool: ${result.data.name}`,
          });
        } else {
          toast({
            title: "Pool Join Failed",
            description: result.error || "Could not join the pool with the invite code",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Pool Join Error",
          description: "Failed to join pool after authentication",
          variant: "destructive",
        });
      }
    }
    navigate('/');
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to defer the async operation
          setTimeout(() => {
            handlePostAuthJoin(session.user);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        handlePostAuthJoin(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, joinPoolByCode, setActivePool, toast]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {showForgotPassword ? (
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
        ) : (
          <>
            <AuthHeader />

            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue={action === 'signup' ? 'signup' : 'signin'} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signup">
                    <SignUpForm
                      {...formState}
                      {...passwordVisibility}
                      onSubmit={authHandlers.handleSignUp}
                      onShowTerms={() => setShowTerms(true)}
                    />
                  </TabsContent>

                  <TabsContent value="signin">
                    <SignInForm
                      signInEmail={formState.signInEmail}
                      setSignInEmail={formState.setSignInEmail}
                      signInPassword={formState.signInPassword}
                      setSignInPassword={formState.setSignInPassword}
                      isSubmitting={formState.isSubmitting}
                      onSubmit={authHandlers.handleSignIn}
                      onForgotPassword={() => setShowForgotPassword(true)}
                    />
                  </TabsContent>
                </Tabs>

                <GoogleAuthButton onClick={authHandlers.signInWithGoogle} />
              </CardContent>
            </Card>
            
            <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;