import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const { activePool, userPools, userPoolsLoading, poolEntries, setActivePool } = usePool();

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
                  Welcome back, {profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0]}! 👋
                </p>
                <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 mb-8 max-w-2xl mx-auto`}>
                  Ready to dominate your Big Brother pools?
                </p>
              </div>

              {/* Pool Selection Grid */}
              {userPoolsLoading ? (
                <div className="mb-8 max-w-4xl mx-auto text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mx-auto mb-4"></div>
                  <p className="text-lg text-dark/70">Loading your pools...</p>
                </div>
              ) : userPools.length > 0 && (
                <div className="mb-8 max-w-4xl mx-auto">
                  <h3 className="text-2xl font-bold text-dark mb-6 text-center">Your Pools</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userPools.map((membership) => {
                      const userEntry = poolEntries.find(entry => entry.user_id === user.id && entry.pool_id === membership.pool_id);
                      const isActivePool = activePool?.id === membership.pool_id;
                      const sortedEntries = [...poolEntries.filter(entry => entry.pool_id === membership.pool_id)].sort((a, b) => b.total_points - a.total_points);
                      const userRankInPool = userEntry ? sortedEntries.findIndex(entry => entry.id === userEntry.id) + 1 : null;
                      
                      return (
                        <Card 
                          key={membership.pool_id} 
                          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                            isActivePool ? 'ring-2 ring-primary shadow-lg' : ''
                          }`}
                          onClick={() => {
                            // Set active pool and navigate to dashboard
                            if (!isActivePool) {
                              setActivePool(membership.pool!);
                              setTimeout(() => navigate('/dashboard'), 100);
                            } else {
                              navigate('/dashboard');
                            }
                          }}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg truncate">{membership.pool?.name || 'Unknown Pool'}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {membership.role === 'owner' ? 'Owner' : membership.role === 'admin' ? 'Admin' : 'Member'}
                                  </Badge>
                                  {isActivePool && (
                                    <Badge className="text-xs bg-primary">Active</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {userEntry ? (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Your Rank</span>
                                  <span className="font-semibold">#{userRankInPool}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Points</span>
                                  <span className="font-semibold">{userEntry.total_points}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Playing as</span>
                                  <span className="text-sm font-medium truncate max-w-[120px]" title={userEntry.participant_name}>
                                    {userEntry.participant_name}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-sm text-muted-foreground mb-2">No entry yet</p>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/draft');
                                  }}
                                >
                                  Join Pool
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
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
                <Button
                  onClick={() => navigate('/about')}
                  variant="outline"
                  size={isMobile ? "default" : "lg"}
                  className={`${isMobile ? 'w-full text-lg' : 'px-12 py-6 text-xl'} font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white`}
                >
                  Learn How It Works
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
                  Learn How It Works
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
  );
};