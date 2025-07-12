import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Play, Sparkles } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PoolsidePicksLogo } from '@/components/brand/PoolsidePicksLogo';

interface HomepageHeroProps {
  user: SupabaseUser | null;
}

export const HomepageHero: React.FC<HomepageHeroProps> = ({ user }) => {
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  // Simple mobile detection fallback
  const isMobile = window.innerWidth < 768;

  const handleGetStarted = () => {
    if (user) {
      handleNavigation('/dashboard');
    } else {
      handleNavigation('/auth');
    }
  };

  const handleBigBrotherLaunch = () => {
    handleNavigation('/landing');
  };

  return (
    <section className="relative py-20 px-4 main-gradient">
        <div className="container mx-auto text-center">
          {/* Giant Logo */}
          <div className="mb-12 flex justify-center">
            <PoolsidePicksLogo size="xxxl" showAnimation={false} />
          </div>
          
          <h1 className={`${isMobile ? 'text-5xl' : 'text-8xl'} font-bold text-dark mb-6 relative`}>
            Poolside Picks
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
          </h1>
          
          {user ? (
            <>
              {/* Personalized Welcome for Logged-in Users */}
              <div className="mb-8">
                <p className={`${isMobile ? 'text-2xl' : 'text-4xl'} text-brand-teal font-bold mb-4`}>
                  Welcome back, {user.user_metadata?.display_name || user.email?.split('@')[0]}! 👋
                </p>
                <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 mb-8 max-w-2xl mx-auto`}>
                  Ready to dominate your Big Brother pools?
                </p>
              </div>

              {/* Main CTA for Logged-in Users */}
              <div className={`flex ${isMobile ? 'flex-col gap-4' : 'gap-6 justify-center'} mb-20`}>
                <Button
                  onClick={() => handleNavigation('/dashboard')}
                  size={isMobile ? "default" : "lg"}
                  className={`${isMobile ? 'w-full text-lg' : 'px-16 py-6 text-2xl'} font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105`}
                  style={{ 
                    background: 'var(--gradient-coral)',
                    color: 'hsl(var(--coral-foreground))'
                  }}
                >
                  <Trophy className="mr-3 h-6 w-6" />
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => handleNavigation('/about')}
                  variant="outline"
                  size={isMobile ? "default" : "lg"}
                  className={`${isMobile ? 'w-full text-lg' : 'px-12 py-6 text-xl'} font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white`}
                >
                  Learn How It Works
                </Button>
                <Button
                  onClick={handleBigBrotherLaunch}
                  size={isMobile ? "default" : "lg"}
                  className={`${isMobile ? 'w-full text-lg' : 'px-12 py-6 text-xl'} font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
                  style={{ 
                    background: 'var(--gradient-teal)',
                    color: 'white'
                  }}
                >
                  <Play className="mr-3 h-5 w-5" />
                  Join Big Brother Pool
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Original Content for Non-logged-in Users */}
              <p className={`${isMobile ? 'text-2xl' : 'text-4xl'} text-brand-teal font-bold mb-4`}>
                The Smartest Way to Watch Dumb TV
              </p>
              
              <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 mb-16 max-w-4xl mx-auto leading-relaxed`}>
                Transform your reality TV obsession into competitive fun. Create fantasy pools for your favorite shows, 
                compete with friends, and prove you've got the best picks in the pool!
              </p>
              
              {/* Main CTA */}
              <div className={`flex ${isMobile ? 'flex-col gap-4' : 'gap-6 justify-center'} mb-20`}>
                <Button
                  onClick={handleGetStarted}
                  size={isMobile ? "default" : "lg"}
                  className={`${isMobile ? 'w-full text-lg' : 'px-16 py-6 text-2xl'} font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105`}
                  style={{ 
                    background: 'var(--gradient-coral)',
                    color: 'hsl(var(--coral-foreground))'
                  }}
                >
                  <Sparkles className="mr-3 h-6 w-6" />
                  Get Started Free
                </Button>
                
                <Button
                  onClick={() => handleNavigation('/about')}
                  variant="outline"
                  size={isMobile ? "default" : "lg"}
                  className={`${isMobile ? 'w-full text-lg' : 'px-12 py-6 text-xl'} font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white`}
                >
                  Learn How It Works
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
  );
};