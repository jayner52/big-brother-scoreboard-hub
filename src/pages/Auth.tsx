import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePool } from '@/contexts/PoolContext';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ForgotPassword } from '@/components/auth/ForgotPassword';
import { TermsModal } from '@/components/auth/TermsModal';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const Auth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');
  const { joinPoolByCode, setActivePool } = usePool();
  const { savePreferences } = useUserPreferences();

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
    navigate('/dashboard');
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

  const validateSignUpForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signUpEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signUpEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!signUpName.trim()) {
      newErrors.name = 'Display name is required';
    }
    
    if (!signUpPassword) {
      newErrors.password = 'Password is required';
    } else if (signUpPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!signUpConfirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signUpPassword !== signUpConfirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms & Conditions to continue';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUpForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            display_name: signUpName
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ email: 'This email is already registered. Please sign in instead.' });
        } else {
          throw error;
        }
      } else if (data.user) {
        // Save user preferences
        await savePreferences({
          email_opt_in: emailOptIn,
          terms_accepted_at: new Date().toISOString(),
          terms_version: '1.0'
        });

        toast({
          title: "Account created successfully!",
          description: "Welcome to Poolside Picks. You can now start drafting your team.",
        });
      }
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to create account" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

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
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/">
                <Button variant="outline" size="sm" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2">
                Join the Pool
              </h1>
              <p className="text-gray-600">Sign in or create an account to draft your team</p>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <h3 className="font-semibold text-blue-800 mb-2">What to expect:</h3>
                <ul className="text-blue-700 space-y-1">
                  <li>• Account creation is instant - no email confirmation required</li>
                  <li>• You can draft your team immediately after signing up</li>
                  <li>• Your picks are saved to your account automatically</li>
                  <li>• Access your rankings and status anytime</li>
                </ul>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue={action === 'signup' ? 'signup' : 'signin'} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div>
                        <Label htmlFor="signup-name">Display Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your name"
                          value={signUpName}
                          onChange={(e) => setSignUpName(e.target.value)}
                          className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="signup-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email"
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                          />
                        </div>
                        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password (min 6 characters)"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={signUpConfirmPassword}
                            onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                            className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
                      </div>
                      
                      {/* Email Opt-In (Optional) */}
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="email-opt-in"
                            checked={emailOptIn}
                            onCheckedChange={(checked) => setEmailOptIn(checked as boolean)}
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <Label htmlFor="email-opt-in" className="text-sm font-medium cursor-pointer">
                              Subscribe to Poolside Picks Updates
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Get notified about new features, pool invites, and Big Brother updates. 
                              You can unsubscribe anytime.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Terms & Conditions (Required) */}
                      <div className={`p-4 rounded-lg border ${errors.terms ? 'border-destructive bg-destructive/5' : 'border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800'}`}>
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="terms-accepted"
                            checked={termsAccepted}
                            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <Label htmlFor="terms-accepted" className="text-sm font-medium cursor-pointer">
                              I agree to the{' '}
                              <button
                                type="button"
                                onClick={() => setShowTerms(true)}
                                className="text-primary hover:underline"
                              >
                                Terms & Conditions
                              </button>
                              {' '}*
                            </Label>
                            {errors.terms && (
                              <p className="text-xs text-destructive">{errors.terms}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {errors.submit && (
                        <div className="text-xs text-destructive text-center">{errors.submit}</div>
                      )}
                      
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div>
                        <Label htmlFor="signin-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="Enter your email"
                            value={signInEmail}
                            onChange={(e) => setSignInEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="signin-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signin-password"
                            type="password"
                            placeholder="Enter your password"
                            value={signInPassword}
                            onChange={(e) => setSignInPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  </TabsContent>

                </Tabs>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={signInWithGoogle}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Terms Modal */}
            <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;