import React from 'react';
import { Button } from '@/components/ui/button';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PoolsidePicksLogo } from '@/components/brand/PoolsidePicksLogo';

interface HomepageNavigationProps {
  user: SupabaseUser | null;
}

export const HomepageNavigation: React.FC<HomepageNavigationProps> = ({ user }) => {
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <nav className="relative z-10 p-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <PoolsidePicksLogo size="md" />
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleNavigation('/about')}
            size="lg"
            className="bg-coral hover:bg-coral/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold px-6"
          >
            ℹ️ About Poolside Picks
          </Button>
          {user ? (
            <Button
              onClick={() => handleNavigation('/dashboard')}
              className="bg-coral hover:bg-coral/90 text-white"
            >
              Dashboard
            </Button>
          ) : (
            <Button
              onClick={() => handleNavigation('/auth')}
              className="bg-brand-teal hover:bg-brand-teal/90 text-white"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};