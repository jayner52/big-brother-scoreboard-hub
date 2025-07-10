import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, BarChart3, MessageCircle, Play, Target, Award, ArrowRight, Tv, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PoolsidePicksLogo } from '@/components/brand/PoolsidePicksLogo';
import { PoolFloat } from '@/components/brand/PoolFloat';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePool } from '@/contexts/PoolContext';

const PoolsidePicks = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get user profile and pool data for logged-in users
  const { profile } = useUserProfile(user);
  const { activePool } = usePool();

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

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      {/* Floating Pool Elements */}
      <div className="absolute top-20 left-10 opacity-40 animate-bounce">
        <PoolFloat className="w-16 h-16" color="teal" />
      </div>
      <div className="absolute top-40 right-20 opacity-30 animate-bounce" style={{ animationDelay: '1s' }}>
        <PoolFloat className="w-12 h-12" color="yellow" />
      </div>
      <div className="absolute bottom-32 left-20 opacity-50 animate-bounce" style={{ animationDelay: '2s' }}>
        <PoolFloat className="w-20 h-20" color="orange" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-30 animate-bounce" style={{ animationDelay: '0.5s' }}>
        <PoolFloat className="w-14 h-14" color="coral" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PoolsidePicksLogo size="md" />
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/about')}
              variant="outline"
              className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white"
            >
              About
            </Button>
            {user ? (
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-coral hover:bg-coral/90 text-white"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="bg-brand-teal hover:bg-brand-teal/90 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
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
              </div>
            </>
          )}
        </div>
      </section>

      {/* Available Shows Section */}
      <section className="py-20 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-center text-dark mb-6`}>
            Available Reality Shows
          </h2>
          <p className="text-xl text-center text-dark/70 mb-16 max-w-2xl mx-auto">
            Start with Big Brother and stay tuned for more shows coming soon!
          </p>
          
          <div className="max-w-2xl mx-auto">
            {/* Big Brother Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-coral/30 bg-gradient-to-br from-coral/5 to-brand-teal/5">
              <CardHeader className="text-center pb-4">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-coral to-brand-teal rounded-full flex items-center justify-center">
                  <Tv className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-3xl text-dark mb-2">Big Brother</CardTitle>
                <CardDescription className="text-lg text-dark/70">
                  Draft houseguests, predict evictions, and compete for the ultimate prize pool
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="bg-white/60 p-3 rounded-lg">
                    <Trophy className="h-6 w-6 mx-auto mb-2 text-coral" />
                    <div className="font-semibold">Draft Teams</div>
                    <div className="text-dark/70">Pick 5 houseguests</div>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-brand-teal" />
                    <div className="font-semibold">Live Scoring</div>
                    <div className="text-dark/70">Real-time updates</div>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-yellow" />
                    <div className="font-semibold">Pool Play</div>
                    <div className="text-dark/70">Compete with friends</div>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg">
                    <MessageCircle className="h-6 w-6 mx-auto mb-2 text-orange" />
                    <div className="font-semibold">Pool Chat</div>
                    <div className="text-dark/70">Trash talk included</div>
                  </div>
                </div>
                
                <Button
                  onClick={handleBigBrotherLaunch}
                  size="lg"
                  className="w-full group-hover:scale-105 transition-transform duration-300"
                  style={{ 
                    background: 'var(--gradient-teal)',
                    color: 'white'
                  }}
                >
                  Play Big Brother Pool
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* Coming Soon Cards */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <Card className="opacity-60 bg-gradient-to-br from-muted/50 to-muted/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-muted-foreground">Survivor</CardTitle>
                  <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="opacity-60 bg-gradient-to-br from-muted/50 to-muted/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-muted-foreground">The Bachelor</CardTitle>
                  <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
              </Card>

              <Card className="opacity-60 bg-gradient-to-br from-muted/50 to-muted/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-muted-foreground">Traitors</CardTitle>
                  <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="opacity-60 bg-gradient-to-br from-muted/50 to-muted/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-muted-foreground">The Circle</CardTitle>
                  <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-center text-dark mb-4`}>
            How Poolside Picks Works
          </h2>
          <p className="text-xl text-center text-dark/70 mb-16 max-w-2xl mx-auto">
            Fantasy sports meets reality TV in three simple steps
          </p>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-12' : 'md:grid-cols-3 gap-12'}`}>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-coral)' }}>
                <Users className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">1. Join or Create</h3>
              <p className="text-dark/70 text-lg leading-relaxed">
                Start your own pool with custom rules and prizes, or join an existing pool with friends and family.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-teal)' }}>
                <Target className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">2. Draft & Predict</h3>
              <p className="text-dark/70 text-lg leading-relaxed">
                Make your picks, draft your teams, and answer bonus questions. Your reality TV knowledge is about to pay off!
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-summer)' }}>
                <Award className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">3. Win Big</h3>
              <p className="text-dark/70 text-lg leading-relaxed">
                Watch the season unfold as your picks earn points. Climb the leaderboard and claim your prizes!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-dark relative">
        <div className="container mx-auto text-center">
          <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-cream mb-6`}>
            Ready to Dive In?
          </h2>
          <p className="text-xl text-cream/80 mb-12 max-w-2xl mx-auto">
            Join the smartest way to watch dumb TV. Your couch commentary just got competitive.
          </p>
          
          <Button
            onClick={handleGetStarted}
            size={isMobile ? "default" : "lg"}
            className={`${isMobile ? 'w-full max-w-md text-lg' : 'px-16 py-6 text-2xl'} font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110`}
            style={{ 
              background: 'var(--gradient-coral)',
              color: 'hsl(var(--coral-foreground))'
            }}
          >
            <Sparkles className="mr-3 h-8 w-8" />
            Start Your First Pool
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-dark border-t border-cream/20">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <PoolsidePicksLogo size="sm" />
          </div>
          <p className="text-cream/60 mb-4">
            © 2025 Poolside Picks | The Smartest Way to Watch Dumb TV
          </p>
          <div className="flex justify-center gap-8 text-cream/60">
            <button 
              onClick={() => navigate('/about')}
              className="hover:text-coral transition-colors"
            >
              About
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
    </div>
  );
};

export default PoolsidePicks;