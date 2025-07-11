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
                      const pool = membership.pool;
                      if (!pool) return null;
                      
                      const userEntry = poolEntries.find(entry => entry.user_id === user.id && entry.pool_id === membership.pool_id);
                      const isActivePool = activePool?.id === membership.pool_id;
                      const poolEntriesForThisPool = poolEntries.filter(entry => entry.pool_id === membership.pool_id);
                      const sortedEntries = [...poolEntriesForThisPool].sort((a, b) => b.total_points - a.total_points);
                      const userRankInPool = userEntry ? sortedEntries.findIndex(entry => entry.id === userEntry.id) + 1 : null;
                      const participantCount = poolEntriesForThisPool.length;
                      
                      // Draft status logic
                      const isDraftAccessible = pool.draft_open && pool.allow_new_participants;
                      const hasDeadline = pool.registration_deadline;
                      const deadline = hasDeadline ? new Date(pool.registration_deadline!) : null;
                      const isDeadlinePassed = deadline ? new Date() > deadline : false;
                      const isDraftComplete = !!userEntry;
                      
                      // Status determination
                      let statusColor = 'bg-green-500';
                      let statusText = 'Open';
                      let actionText = 'Complete Draft';
                      
                      if (!isDraftAccessible || isDeadlinePassed) {
                        statusColor = 'bg-red-500';
                        statusText = 'Closed';
                        actionText = 'Draft Closed';
                      } else if (isDraftComplete) {
                        statusColor = 'bg-blue-500';
                        statusText = 'Entered';
                        actionText = 'View Entry';
                      } else if (!userEntry && pool.has_buy_in && !userEntry?.payment_confirmed) {
                        statusColor = 'bg-yellow-500';
                        statusText = 'Payment Due';
                        actionText = 'Complete Entry';
                      }
                      
                      // Time until deadline
                      const getTimeUntilDeadline = () => {
                        if (!deadline) return null;
                        const now = new Date();
                        const diffMs = deadline.getTime() - now.getTime();
                        if (diffMs < 0) return 'Deadline passed';
                        
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        
                        if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
                        if (diffHours > 0) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} left`;
                        return 'Less than 1 hour left';
                      };
                      
                      const deadlineText = getTimeUntilDeadline();
                      
                      return (
                        <Card 
                          key={membership.pool_id} 
                          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                            isActivePool ? 'ring-2 ring-primary shadow-lg' : ''
                          }`}
                          onClick={() => {
                            if (!isActivePool) {
                              setActivePool(pool);
                              setTimeout(() => navigate('/dashboard'), 100);
                            } else {
                              navigate('/dashboard');
                            }
                          }}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg truncate">{pool.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant="secondary" className="text-xs">
                                    {membership.role === 'owner' ? 'Owner' : membership.role === 'admin' ? 'Admin' : 'Member'}
                                  </Badge>
                                  {isActivePool && (
                                    <Badge className="text-xs bg-primary">Active</Badge>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                                    <span className="text-xs text-muted-foreground">{statusText}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {/* Pool Stats */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Players</span>
                                <span className="font-medium">{participantCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Entry Fee</span>
                                <span className="font-medium">
                                  {pool.has_buy_in ? `${pool.entry_fee_currency} $${pool.entry_fee_amount}` : 'Free'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Deadline Info */}
                            {deadlineText && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Draft closes</span>
                                <span className={`font-medium ${isDeadlinePassed ? 'text-red-600' : 'text-orange-600'}`}>
                                  {deadlineText}
                                </span>
                              </div>
                            )}
                            
                            {/* User Entry Status */}
                            {userEntry ? (
                              <div className="space-y-2 pt-2 border-t">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Your Rank</span>
                                  <span className="font-semibold">#{userRankInPool}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Points</span>
                                  <span className="font-semibold">{userEntry.total_points}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Team</span>
                                  <span className="text-sm font-medium truncate max-w-[120px]" title={userEntry.team_name}>
                                    {userEntry.team_name}
                                  </span>
                                </div>
                                {pool.has_buy_in && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Payment</span>
                                    <span className={`text-sm font-medium ${userEntry.payment_confirmed ? 'text-green-600' : 'text-red-600'}`}>
                                      {userEntry.payment_confirmed ? 'Confirmed' : 'Pending'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="pt-2 border-t">
                                <Button 
                                  size="sm" 
                                  variant={isDraftAccessible && !isDeadlinePassed ? "default" : "outline"}
                                  disabled={!isDraftAccessible || isDeadlinePassed}
                                  className="w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isDraftAccessible && !isDeadlinePassed) {
                                      setActivePool(pool);
                                      navigate('/draft');
                                    }
                                  }}
                                >
                                  {actionText}
                                </Button>
                                {!isDraftAccessible && (
                                  <p className="text-xs text-muted-foreground mt-1 text-center">
                                    New registrations are closed
                                  </p>
                                )}
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