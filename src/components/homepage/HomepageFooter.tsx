import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PoolsidePicksLogo } from '@/components/brand/PoolsidePicksLogo';

export const HomepageFooter: React.FC = () => {
  const navigate = useNavigate();

  const handleBigBrotherLaunch = () => {
    navigate('/landing');
  };

  const handlePrivacyPolicy = () => {
    navigate('/privacy-policy');
  };

  const handleAbout = () => {
    navigate('/about');
  };

  const handleAuth = () => {
    navigate('/auth');
  };

  return (
    <footer className="py-12 px-4">
      <div className="container mx-auto text-center">
        <div className="flex justify-center mb-6">
          <PoolsidePicksLogo size="sm" />
        </div>
        <p className="text-muted-foreground mb-4">
          © 2025 Poolside Picks | The Smartest Way to Watch Dumb TV
        </p>
        <div className="text-center mb-4">
          <button 
            onClick={handlePrivacyPolicy}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm underline"
          >
            Privacy Policy
          </button>
        </div>
        <div className="flex justify-center gap-8 text-muted-foreground">
          <button 
            onClick={handleAbout}
            className="hover:text-primary transition-colors text-lg font-semibold bg-primary/20 px-4 py-2 rounded-lg hover:bg-primary hover:text-primary-foreground"
          >
            📖 About & FAQ
          </button>
          <button 
            onClick={handleBigBrotherLaunch}
            className="hover:text-primary transition-colors"
          >
            Big Brother Pool
          </button>
          <button 
            onClick={handleAuth}
            className="hover:text-secondary-foreground transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </footer>
  );
};