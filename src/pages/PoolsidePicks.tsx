import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, BarChart3, MessageCircle, Play, Target, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PoolsidePicksLogo } from '@/components/brand/PoolsidePicksLogo';
import { PoolFloat } from '@/components/brand/PoolFloat';
import { useIsMobile } from '@/hooks/use-mobile';

const PoolsidePicks = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleJoinPool = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleLearnMore = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
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
      <div className="absolute top-20 left-10 opacity-60">
        <PoolFloat className="w-16 h-16" color="teal" />
      </div>
      <div className="absolute top-40 right-20 opacity-40">
        <PoolFloat className="w-12 h-12" color="yellow" />
      </div>
      <div className="absolute bottom-32 left-20 opacity-50">
        <PoolFloat className="w-20 h-20" color="orange" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-30">
        <PoolFloat className="w-14 h-14" color="coral" />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          {/* Logo and Brand */}
          <div className="mb-8 flex justify-center">
            <PoolsidePicksLogo size="xl" showAnimation={true} />
          </div>
          
          <h1 className={`${isMobile ? 'text-4xl' : 'text-7xl'} font-bold text-dark mb-4`}>
            Poolside Picks
          </h1>
          
          <p className={`${isMobile ? 'text-xl' : 'text-3xl'} text-brand-teal font-semibold mb-6`}>
            Where Big Brother Meets the Pool
          </p>
          
          <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 mb-12 max-w-3xl mx-auto leading-relaxed`}>
            Join Big Brother fans in fun, competitive fantasy leagues that combine reality TV excitement with pool party vibes. 
            Draft your team, make predictions, and dive into the ultimate summer competition!
          </p>
          
          {/* CTA Buttons */}
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'gap-6 justify-center'} mb-16`}>
            <Button
              onClick={handleJoinPool}
              size={isMobile ? "default" : "lg"}
              className={`${isMobile ? 'w-full' : 'px-12 py-4'} text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
              style={{ 
                background: 'var(--gradient-coral)',
                color: 'hsl(var(--coral-foreground))'
              }}
            >
              <Trophy className="mr-2 h-6 w-6" />
              {user ? 'Go to Dashboard' : 'Join the Big Brother Pool'}
            </Button>
            
            <Button
              onClick={handleLearnMore}
              variant="outline"
              size={isMobile ? "default" : "lg"}
              className={`${isMobile ? 'w-full' : 'px-12 py-4'} text-xl font-semibold rounded-full border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-brand-teal-foreground transition-all duration-300`}
            >
              <Play className="mr-2 h-6 w-6" />
              Learn How to Play
            </Button>
          </div>

          {/* Sign In for Existing Users - Prominent Button */}
          {!user && (
            <div className="bg-gradient-to-r from-white via-white to-white/95 backdrop-blur-sm border-2 border-brand-teal/40 rounded-2xl p-8 mb-8 max-w-lg mx-auto shadow-xl">
              <div className="text-center">
                <h3 className="text-xl font-bold text-dark mb-2">Already have an account?</h3>
                <p className="text-dark/70 mb-4">Sign in to access your teams and rankings</p>
                <Button
                  onClick={() => navigate('/auth?action=signin')}
                  size={isMobile ? "default" : "lg"}
                  className={`${isMobile ? 'w-full' : 'px-12 py-4'} text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                  style={{ 
                    background: 'var(--gradient-teal)',
                    color: 'white'
                  }}
                >
                  Sign In to Your Account
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto">
          <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-center text-dark mb-4`}>
            Why Poolside Picks?
          </h2>
          <p className="text-xl text-center text-dark/70 mb-16 max-w-2xl mx-auto">
            The ultimate fantasy experience for Big Brother superfans
          </p>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6'}`}>
            <Card className="text-center border-2 border-coral/20 hover:border-coral/40 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Users className="h-12 w-12 mx-auto text-coral mb-4" />
                <CardTitle className="text-xl text-dark">Community Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-dark/70 text-base">
                  Join pools with friends, family, or fellow superfans. Chat, compete, and celebrate together all season long.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 border-brand-teal/20 hover:border-brand-teal/40 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Trophy className="h-12 w-12 mx-auto text-brand-teal mb-4" />
                <CardTitle className="text-xl text-dark">Competitive Pool Play</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-dark/70 text-base">
                  Put money on the line or play just for fun. The competition keeps you engaged all season long.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 border-purple-400/20 hover:border-purple-400/40 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Target className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                <CardTitle className="text-xl text-dark">Fully Customizable</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-dark/70 text-base">
                  Starting your own pool? Configure everything exactly how you want - from scoring to prizes to team sizes.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 border-yellow/20 hover:border-yellow/40 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <BarChart3 className="h-12 w-12 mx-auto text-yellow mb-4" />
                <CardTitle className="text-xl text-dark">Live Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-dark/70 text-base">
                  Real-time updates and scoring keep you engaged every step of the way. Never miss a moment of the action.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 border-orange/20 hover:border-orange/40 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <MessageCircle className="h-12 w-12 mx-auto text-orange mb-4" />
                <CardTitle className="text-xl text-dark">Social Features</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-dark/70 text-base">
                  Pool chat, trash talk, strategy discussions, and victory celebrations. The social side of fantasy sports.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-center text-dark mb-4`}>
            How It Works
          </h2>
          <p className="text-xl text-center text-dark/70 mb-16 max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-12' : 'md:grid-cols-3 gap-12'}`}>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-coral)' }}>
                <Target className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">1. Create Your Team</h3>
              <p className="text-dark/70 text-lg leading-relaxed">
                Draft your favorite houseguests from different groups and answer bonus questions to build your winning strategy.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-teal)' }}>
                <BarChart3 className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">2. Make Weekly Picks</h3>
              <p className="text-dark/70 text-lg leading-relaxed">
                Score points when your houseguests win competitions, survive evictions, and hit major milestones throughout the season.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-summer)' }}>
                <Award className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">3. Win Prizes</h3>
              <p className="text-dark/70 text-lg leading-relaxed">
                Climb the leaderboard, claim victory, and win cash prizes or ultimate bragging rights in your pool!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-dark relative">
        <div className="container mx-auto text-center">
          <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-cream mb-6`}>
            Ready to Make a Splash?
          </h2>
          <p className="text-xl text-cream/80 mb-12 max-w-2xl mx-auto">
            Join thousands of Big Brother fans in the ultimate fantasy pool experience
          </p>
          
          <Button
            onClick={handleJoinPool}
            size={isMobile ? "default" : "lg"}
            className={`${isMobile ? 'w-full max-w-md' : 'px-16 py-6'} text-2xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110`}
            style={{ 
              background: 'var(--gradient-coral)',
              color: 'hsl(var(--coral-foreground))'
            }}
          >
            <Trophy className="mr-3 h-8 w-8" />
            Start Playing Now
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
            © 2025 Poolside Picks | Where Big Brother Meets the Pool
          </p>
          <div className="flex justify-center gap-8 text-cream/60">
            <button 
              onClick={() => navigate('/about')}
              className="hover:text-coral transition-colors"
            >
              About
            </button>
            <button 
              onClick={handleLearnMore}
              className="hover:text-brand-teal transition-colors"
            >
              How to Play
            </button>
            <button 
              onClick={() => navigate('/auth')}
              className="hover:text-yellow transition-colors"
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