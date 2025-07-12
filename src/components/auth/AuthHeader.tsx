import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AuthHeader = () => {
  return (
    <div className="text-center mb-8">
      <Link to="/">
        <Button variant="outline" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </Link>
      <img 
        src="https://i.imgur.com/yfYAFd7.png" 
        alt="Poolside Picks Logo" 
        className="w-16 h-16 mx-auto mb-4"
      />
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
  );
};