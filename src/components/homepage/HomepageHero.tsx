import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Play, Sparkles } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PoolsidePicksLogo } from '@/components/brand/PoolsidePicksLogo';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePool } from '@/contexts/PoolContext';

interface HomepageHeroProps {
  user: SupabaseUser | null;
}

export const HomepageHero: React.FC<HomepageHeroProps> = ({ user }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { profile } = useUserProfile(user);
  const { activePool } = usePool();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleBigBrotherLaunch = () => {
    navigate('/landing');
  };

  // Debug logging for mobile testing
  console.log('PoolsidePicks Debug:', { 
    user: !!user, 
    userEmail: user?.email, 
    profile: !!profile, 
    profileName: profile?.display_name,
    activePool: !!activePool, 
    poolName: activePool?.name,
    isMobile 
  });

  return (
    <section className="relative py-20 px-4">
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
                Welcome back, {profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0]}! 👋
              </p>
              <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 mb-8 max-w-2xl mx-auto`}>
                Ready to dominate your Big Brother pools?
              </p>
            </div>

            {/* Current Pool Status */}
            {activePool && (
              <div className="mb-8 max-w-md mx-auto">
                <Card className="bg-white/80 backdrop-blur-sm border-brand-teal/20">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Trophy className="h-5 w-5 text-brand-teal" />
                      <span className="font-semibold text-dark">Current Pool</span>
                    </div>
                    <h3 className="text-lg font-bold text-dark mb-1">{activePool.name}</h3>
                    <p className="text-sm text-dark/70">Big Brother Fantasy Pool</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main CTA for Logged-in Users */}
            <div className={`flex ${isMobile ? 'flex-col gap-4' : 'gap-6 justify-center'} mb-20`}>
              <Button
                onClick={() => navigate('/dashboard')}
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
              {!activePool && (
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
              )}
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
                onClick={() => navigate('/about')}
                variant="outline"
                size={isMobile ? "default" : "lg"}
                className={`${isMobile ? 'w-full text-lg' : 'px-12 py-6 text-xl'} font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white`}
              >
                ℹ️ Learn How It Works
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};