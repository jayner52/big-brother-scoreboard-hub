import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';

interface SignInFormProps {
  signInEmail: string;
  setSignInEmail: (value: string) => void;
  signInPassword: string;
  setSignInPassword: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

export const SignInForm = ({
  signInEmail,
  setSignInEmail,
  signInPassword,
  setSignInPassword,
  isSubmitting,
  onSubmit,
  onForgotPassword,
}: SignInFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          onClick={onForgotPassword}
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot password?
        </button>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};