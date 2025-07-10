import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { EmailOptInCheckbox } from './EmailOptInCheckbox';
import { TermsCheckbox } from './TermsCheckbox';

interface SignUpFormProps {
  // Form data
  signUpEmail: string;
  setSignUpEmail: (value: string) => void;
  signUpPassword: string;
  setSignUpPassword: (value: string) => void;
  signUpConfirmPassword: string;
  setSignUpConfirmPassword: (value: string) => void;
  signUpName: string;
  setSignUpName: (value: string) => void;
  emailOptIn: boolean;
  setEmailOptIn: (value: boolean) => void;
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
  
  // Password visibility
  showPassword: boolean;
  togglePassword: () => void;
  showConfirmPassword: boolean;
  toggleConfirmPassword: () => void;
  
  // Form state
  isSubmitting: boolean;
  errors: Record<string, string>;
  
  // Handlers
  onSubmit: (e: React.FormEvent) => void;
  onShowTerms: () => void;
}

export const SignUpForm = ({
  signUpEmail,
  setSignUpEmail,
  signUpPassword,
  setSignUpPassword,
  signUpConfirmPassword,
  setSignUpConfirmPassword,
  signUpName,
  setSignUpName,
  emailOptIn,
  setEmailOptIn,
  termsAccepted,
  setTermsAccepted,
  showPassword,
  togglePassword,
  showConfirmPassword,
  toggleConfirmPassword,
  isSubmitting,
  errors,
  onSubmit,
  onShowTerms,
}: SignUpFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
            onClick={togglePassword}
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
            onClick={toggleConfirmPassword}
            className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
      </div>
      
      <EmailOptInCheckbox 
        checked={emailOptIn}
        onCheckedChange={setEmailOptIn}
      />
      
      <TermsCheckbox
        checked={termsAccepted}
        onCheckedChange={setTermsAccepted}
        onShowTerms={onShowTerms}
        error={errors.terms}
      />
      
      {errors.submit && (
        <div className="text-xs text-destructive text-center">{errors.submit}</div>
      )}
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
};