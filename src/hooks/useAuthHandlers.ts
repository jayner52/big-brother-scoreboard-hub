import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { supabase } from '@/integrations/supabase/client';
import { generateAuthRedirectUrl } from '@/utils/domains';
import { validateSignUpForm } from '@/utils/authValidation';

interface UseAuthHandlersProps {
  signUpEmail: string;
  signUpPassword: string;
  signUpConfirmPassword: string;
  signUpName: string;
  signInEmail: string;
  signInPassword: string;
  emailOptIn: boolean;
  termsAccepted: boolean;
  setIsSubmitting: (loading: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
}

export const useAuthHandlers = ({
  signUpEmail,
  signUpPassword,
  signUpConfirmPassword,
  signUpName,
  signInEmail,
  signInPassword,
  emailOptIn,
  termsAccepted,
  setIsSubmitting,
  setErrors,
}: UseAuthHandlersProps) => {
  const { toast } = useToast();
  const { savePreferences } = useUserPreferences();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateSignUpForm(
      signUpEmail,
      signUpName,
      signUpPassword,
      signUpConfirmPassword,
      termsAccepted
    );
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          emailRedirectTo: generateAuthRedirectUrl('/'),
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
        options: { 
          redirectTo: generateAuthRedirectUrl('/'),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to sign in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  return {
    handleSignUp,
    handleSignIn,
    signInWithGoogle,
  };
};