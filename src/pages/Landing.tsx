import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Trophy, Star, Target, Award, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PoolCreateModal } from '@/components/pools/PoolCreateModal';
import { PoolJoinModal } from '@/components/pools/PoolJoinModal';

const Landing = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header with Auth State */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Big Brother Fantasy Pool
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    {user.user_metadata?.display_name || user.email}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white py-12 px-16 rounded-xl shadow-2xl mb-8">
            <div className="flex items-center justify-center mb-6">
              <Trophy className="h-16 w-16 text-white mr-4" />
              <h1 className="text-6xl font-bold">
                Big Brother Fantasy Pool
              </h1>
            </div>
            <p className="text-2xl text-red-100 mb-4">
              Draft your dream team and compete with friends!
            </p>
            <p className="text-lg text-red-200">
              Create private pools, draft houseguests, and see who can predict the season best
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl">1. Draft Your Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Select 5 houseguests and answer bonus questions to build your winning strategy.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-xl">2. Earn Points</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Score points when your houseguests win competitions, survive evictions, and hit milestones.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-xl">3. Win Prizes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Compete for the top spot on the leaderboard and claim your victory!</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Get Started Section */}
        <div className="text-center mb-16">
          <div className="max-w-2xl mx-auto">
            {!user ? (
              <>
                <Button 
                  onClick={() => navigate('/auth')}
                  size="lg"
                  className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:from-red-700 hover:via-orange-600 hover:to-yellow-600 text-white px-12 py-4 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-6"
                >
                  Get Started - It's Free!
                </Button>
                <p className="text-gray-600 text-lg mb-4">
                  Sign in to create or join a fantasy pool
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Play?</h2>
                {/* Pool Action Buttons - Only for authenticated users */}
                <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-6 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Pool
                  </Button>
                  <Button 
                    onClick={() => setShowJoinModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Join Pool
                  </Button>
                </div>
                <p className="text-gray-600 text-lg">
                  Create your own pool or join an existing one to get started
                </p>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="text-center mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-orange-200">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Why Play?</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🎯 Strategic Fun</h4>
                <p className="text-gray-600 text-sm">Draft wisely and predict outcomes to outsmart your friends.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">👥 Social Gaming</h4>
                <p className="text-gray-600 text-sm">Create private pools with friends, family, or coworkers.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">📊 Live Tracking</h4>
                <p className="text-gray-600 text-sm">Real-time leaderboards and weekly score updates.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🏆 Compete to Win</h4>
                <p className="text-gray-600 text-sm">Optional buy-ins for prize pools or just play for bragging rights.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation to Dashboard for Authenticated Users */}
        {user && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Ready to manage your pools?</p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white"
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-16 py-8 border-t border-orange-200">
          <p>© 2025 Big Brother Fantasy Pool | May the best picks win! 🏆</p>
        </footer>

        {/* Modals - Only for authenticated users */}
        {user && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Landing;