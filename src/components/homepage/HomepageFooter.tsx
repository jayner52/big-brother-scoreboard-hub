import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PoolsidePicksLogo } from '@/components/brand/PoolsidePicksLogo';

export const HomepageFooter: React.FC = () => {
  const navigate = useNavigate();

  const handleBigBrotherLaunch = () => {
    navigate('/landing');
  };

  return (
    <footer className="py-12 px-4 bg-dark border-t border-cream/20">
      <div className="container mx-auto text-center">
        <div className="flex justify-center mb-6">
          <PoolsidePicksLogo size="sm" />
        </div>
        <p className="text-cream/60 mb-4">
          © 2025 Poolside Picks | The Smartest Way to Watch Dumb TV
        </p>
        <div className="text-center mb-4">
          <button 
            onClick={() => navigate('/privacy-policy')}
            className="text-cream/50 hover:text-cream/80 transition-colors text-sm underline"
          >
            Privacy Policy
          </button>
        </div>
        <div className="flex justify-center gap-8 text-cream/60">
          <button 
            onClick={() => navigate('/about')}
            className="hover:text-coral transition-colors text-lg font-semibold bg-coral/20 px-4 py-2 rounded-lg hover:bg-coral hover:text-white"
          >
            📖 About & FAQ
          </button>
          <button 
            onClick={handleBigBrotherLaunch}
            className="hover:text-coral transition-colors"
          >
            Big Brother Pool
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="hover:text-brand-teal transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </footer>
  );
};