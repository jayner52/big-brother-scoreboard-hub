import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Trophy, Star, Target, Award, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PoolCreateModal } from '@/components/pools/PoolCreateModal';
import { PoolJoinModal } from '@/components/pools/PoolJoinModal';
import { usePool } from '@/contexts/PoolContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Landing = () => {
  const navigate = useNavigate();
  const { activePool } = usePool();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handlePoolSuccess = () => {
    setShowCreateModal(false);
    setShowJoinModal(false);
    // Navigate to dashboard after successful pool action
    navigate('/dashboard');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-cream" key={`landing-${Date.now()}`}>
      {/* Navigation Header */}
      <nav className="bg-cream border-b border-brand-teal/20 px-4 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-coral" />
            <span className="text-xl font-bold text-dark">Poolside Picks</span>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-brand-teal/10 border border-brand-teal/30 rounded-lg px-3 py-2">
                <User className="h-4 w-4 text-brand-teal" />
                <span className="text-sm text-dark">
                  {user.user_metadata?.display_name || user.email}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-brand-teal-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-coral hover:bg-coral/90 text-coral-foreground font-semibold px-6 py-2 rounded-lg"
            >
              Sign In
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-dark mb-4">
              Where Big Brother Meets the Pool
            </h1>
            <p className="text-xl md:text-2xl text-dark/80 mb-8">
              Join the ultimate Big Brother fantasy experience
            </p>
          </div>

          {/* Authentication-aware CTAs */}
          {user ? (
            <div className="hero-actions flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Button 
                onClick={() => setShowJoinModal(true)}
                size="lg"
                className="bg-coral hover:bg-coral/90 text-coral-foreground font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Users className="h-5 w-5 mr-2" />
                Join a Pool
              </Button>
              <Button 
                onClick={() => setShowCreateModal(true)}
                variant="outline"
                size="lg"
                className="border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-brand-teal-foreground font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your Pool
              </Button>
            </div>
          ) : (
            <div className="hero-actions text-center mb-6">
              <div className="bg-gradient-to-r from-coral/10 to-brand-teal/10 border border-coral/30 rounded-xl p-6 mb-4">
                <p className="text-dark text-lg mb-4">
                  Sign in to join or create a pool!
                </p>
                <Button 
                  onClick={() => navigate('/auth')}
                  size="lg"
                  className="bg-coral hover:bg-coral/90 text-coral-foreground font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}

          {user && (
            <div className="bg-gradient-to-r from-brand-teal/10 to-coral/10 border border-brand-teal/30 rounded-xl p-6 mt-8">
              <p className="text-dark/80 text-lg mb-4">
                Ready to manage your pools?
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="lg"
                className="border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-brand-teal-foreground font-semibold px-8 py-3 text-lg rounded-xl"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4">
        {/* How It Works Section */}
        <div className={`${isMobile ? 'mb-8' : 'mb-16'}`}>
          <h2 className={`${isMobile ? 'responsive-text-2xl' : 'text-3xl'} font-bold text-center text-dark mb-8`}>Ready to Play?</h2>
          <p className="text-center text-dark/80 text-lg mb-8">Join thousands of Big Brother fans in the ultimate fantasy experience</p>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-3 gap-8'}`}>
            <Card className="text-center border-2 border-brand-teal/30 hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <div className="text-4xl mb-4">🎉</div>
                <CardTitle className="text-xl text-dark">Join the Fun</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dark/70">Get your invite code and jump into the ultimate Big Brother fantasy experience with friends!</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 border-brand-teal/30 hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <div className="text-4xl mb-4">👑</div>
                <CardTitle className="text-xl text-dark">Build Your Dream Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dark/70">Choose your champions! Draft 5 houseguests and put your Big Brother knowledge to the test.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 border-brand-teal/30 hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <div className="text-4xl mb-4">🏆</div>
                <CardTitle className="text-xl text-dark">Win Glory (& Maybe Cash!)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dark/70">Earn points all season long as your picks dominate competitions. Bragging rights guaranteed, prizes possible!</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="text-center mb-16">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-brand-teal/20">
            <Trophy className="h-12 w-12 text-coral mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-dark mb-6">Why Play?</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-dark mb-2">🎯 Strategic Fun</h4>
                <p className="text-dark/70 text-sm">Draft wisely and predict outcomes to outsmart your friends.</p>
              </div>
              <div>
                <h4 className="font-semibold text-dark mb-2">👥 Social Gaming</h4>
                <p className="text-dark/70 text-sm">Create private pools with friends, family, or coworkers.</p>
              </div>
              <div>
                <h4 className="font-semibold text-dark mb-2">📊 Live Tracking</h4>
                <p className="text-dark/70 text-sm">Real-time leaderboards and weekly score updates.</p>
              </div>
              <div>
                <h4 className="font-semibold text-dark mb-2">🏆 Compete to Win</h4>
                <p className="text-dark/70 text-sm">Optional buy-ins for prize pools or just play for bragging rights.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation to Dashboard for Authenticated Users */}
        {user && (
          <div className="text-center mb-16">
            <p className="text-dark/70 mb-4">Ready to manage your pools?</p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 text-lg font-semibold bg-brand-teal hover:bg-brand-teal/90 text-brand-teal-foreground rounded-xl"
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-dark/60 text-sm mt-16 py-8 border-t border-brand-teal/20">
          <p>© 2025 Poolside Picks | May the best picks win! 🏆</p>
        </footer>

        {/* Modals */}
        <PoolCreateModal 
          open={showCreateModal} 
          onOpenChange={setShowCreateModal}
          onSuccess={handlePoolSuccess}
        />
        <PoolJoinModal 
          open={showJoinModal} 
          onOpenChange={setShowJoinModal}
          onSuccess={handlePoolSuccess}
        />
      </div>
    </div>
  );
};

export default Landing;