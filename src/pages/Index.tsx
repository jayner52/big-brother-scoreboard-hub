
import React, { memo } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useDraftForm } from '@/hooks/useDraftForm';
import { ProfessionalNavigation } from '@/components/navigation/ProfessionalNavigation';
import { HeroSection } from '@/components/index/HeroSection';
import { DynamicHowToPlay } from '@/components/index/DynamicHowToPlay';
import { MainContent } from '@/components/index/MainContent';
import { Footer } from '@/components/index/Footer';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { PoolSwitcher } from '@/components/pools/PoolSwitcher';
import { InviteFriendsButton } from '@/components/pools/InviteFriendsButton';
import { PoolCreateModal } from '@/components/pools/PoolCreateModal';
import { PoolJoinModal } from '@/components/pools/PoolJoinModal';
import { PoolSelection } from '@/components/pools/PoolSelection';
import { usePool } from '@/contexts/PoolContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Plus, Trophy, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserPoolRole } from '@/hooks/useUserPoolRole';
import { useUserProfile } from '@/hooks/useUserProfile';

const Index = memo(() => {
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userEntry, setUserEntry] = useState<any>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showPoolSelection, setShowPoolSelection] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  const { formData } = useDraftForm();
  
  // Safely access pool context with error handling
  let activePool = null;
  let userPools: any[] = [];
  let poolsLoading = true;
  let poolEntries: any[] = [];
  let clearActivePool = () => {};
  let forceShowPoolSelection = false;
  let setForceShowPoolSelection = (force: boolean) => {};
  
  try {
    const poolContext = usePool();
    activePool = poolContext.activePool;
    userPools = poolContext.userPools;
    poolsLoading = poolContext.loading;
    poolEntries = poolContext.poolEntries;
    clearActivePool = poolContext.clearActivePool;
    forceShowPoolSelection = poolContext.forceShowPoolSelection;
    setForceShowPoolSelection = poolContext.setForceShowPoolSelection;
  } catch (error) {
    console.error('Error accessing pool context:', error);
    setHasError(true);
  }

  const { isAdmin } = useUserPoolRole(activePool?.id, user?.id);
  const { profile } = useUserProfile(user);

  // Removed auto-redirect to admin - only redirect on new pool creation

  // Removed auto-open create pool modal - users now go to pool selection screen

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserEntry(session.user.id);
      }
      setAuthLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadUserEntry(session.user.id);
        } else {
          setUserEntry(null);
          setUserRank(null);
        }
        setAuthLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Enhanced pool selection logic with debugging
  useEffect(() => {
    const timestamp = new Date().toISOString();
    const savedPoolId = localStorage.getItem('activePoolId');
    
    console.log('🔄 DEBUG Index.tsx Pool Selection Logic:', {
      timestamp,
      user: user?.email || null,
      authLoading,
      userPoolsLength: userPools.length,
      poolsLoading,
      activePool: activePool?.name || null,
      showPoolSelection,
      forceShowPoolSelection,
      savedPoolId,
      location: window.location.href
    });

    // Force show pool selection overrides everything
    if (forceShowPoolSelection) {
      console.log('🚨 DEBUG: Force show pool selection enabled');
      setShowPoolSelection(true);
      return;
    }

    // Show pool selection when user is authenticated, has pools, and no active pool
    if (user && !authLoading && userPools.length > 0 && !poolsLoading && !activePool) {
      console.log('✅ DEBUG: Conditions met for showing pool selection');
      setShowPoolSelection(true);
    } else if (activePool && !forceShowPoolSelection) {
      console.log('❌ DEBUG: Active pool exists, hiding pool selection');
      setShowPoolSelection(false);
    }
  }, [user, authLoading, userPools, poolsLoading, activePool, forceShowPoolSelection]);

  const loadUserEntry = async (userId: string) => {
    try {
      if (!activePool || !poolEntries.length) return;
      
      // Find user's entry in the pool-scoped entries from context
      const userEntry = poolEntries.find(entry => entry.user_id === userId);
      
      if (userEntry) {
        setUserEntry(userEntry);
        
        // Calculate rank from sorted entries (optimized - avoid array spread)
        const sortedEntries = poolEntries.slice().sort((a, b) => b.total_points - a.total_points);
        const rank = sortedEntries.findIndex(entry => entry.id === userEntry.id) + 1;
        setUserRank(rank);
      } else {
        setUserEntry(null);
        setUserRank(null);
      }
    } catch (error) {
      console.error('Error loading user entry:', error);
    }
  };

  // Reload user entry when active pool changes or poolEntries are updated
  useEffect(() => {
    if (user && activePool) {
      loadUserEntry(user.id);
    }
  }, [user, activePool, poolEntries]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleJoinPool = () => {
    navigate('/draft');
  };

  const handleSelectPool = (pool: any) => {
    console.log('🎯 DEBUG: handleSelectPool called with:', pool.name);
    
    // Set the pool via localStorage and let the context pick it up
    // This is mobile-friendly and doesn't require page reload
    localStorage.setItem('activePoolId', pool.id);
    setShowPoolSelection(false);
    setForceShowPoolSelection(false);
    
    // Force a context refresh by clearing and setting the pool
    setTimeout(() => {
      // The context will automatically pick up the localStorage change
      window.dispatchEvent(new Event('storage'));
    }, 100);
    
    console.log('✅ DEBUG: Successfully set active pool via localStorage');
  };

  const handleForceShowPools = () => {
    console.log('🚨 DEBUG: Force showing pool selection');
    clearActivePool();
    setForceShowPoolSelection(true);
  };

  const handlePoolSuccess = (isNewPool?: boolean) => {
    setShowCreateModal(false);
    setShowJoinModal(false);
    setShowPoolSelection(false);
    
    // Only redirect to admin with welcome message for newly created pools
    if (isNewPool) {
      navigate('/admin?firstVisit=true', { replace: true });
    }
  };

  const handleError = () => {
    setHasError(true);
  };

  // Enhanced loading state - show different messages based on what's loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">Checking authentication...</div>
        </div>
      </div>
    );
  }

  if (user && poolsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">Loading your pools...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Redirecting to landing...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--gradient-unified)' }}>
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
          <div className="text-center">
            <p className="text-lg mb-4">Something went wrong loading your pools.</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setShowCreateModal(true)} className="create-pool-btn">
                <Plus className="h-4 w-4 mr-2" />
                Create Pool
              </Button>
              <Button variant="outline" onClick={() => setShowJoinModal(true)} className="join-pool-btn">
                <Users className="h-4 w-4 mr-2" />
                Join Pool
              </Button>
            </div>
          </div>
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
  }

  console.log('📊 Index.tsx render state:', {
    user: user?.email || null,
    poolsLoading,
    userPoolsLength: userPools.length,
    activePool: activePool?.name || null,
    authLoading
  });

  // Show pool selection screen if user has pools but hasn't selected one
  if (user && !poolsLoading && userPools.length > 0 && showPoolSelection) {
    return (
      <>
        <PoolSelection
          onSelectPool={handleSelectPool}
          onCreatePool={() => setShowCreateModal(true)}
          onJoinPool={() => setShowJoinModal(true)}
        />
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
    );
  }

  // Show pool creation if user has no pools (but only after pools have finished loading)
  if (user && !poolsLoading && userPools.length === 0) {
    console.log('🚨 Showing pool creation screen - no pools found');
    return (
      <div className="min-h-screen" style={{ background: 'var(--gradient-unified)' }}>
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Welcome to Poolside Picks!</h1>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          <div className="text-center space-y-6">
            <div>
              <Trophy className="h-16 w-16 mx-auto text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Ready to start your Big Brother pool?</h2>
              <p className="text-muted-foreground">Create your own pool or join an existing one to get started!</p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => setShowCreateModal(true)} className="create-pool-btn">
                <Plus className="h-4 w-4 mr-2" />
                Create Pool
              </Button>
              <Button size="lg" variant="outline" onClick={() => setShowJoinModal(true)} className="join-pool-btn">
                <Users className="h-4 w-4 mr-2" />
                Join Pool
              </Button>
            </div>
          </div>

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
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-unified)' }}>
      <div className="container mx-auto px-4 py-8">
        <ProfessionalNavigation
          user={user}
          userEntry={userEntry}
          userRank={userRank}
          onSignOut={handleSignOut}
          onJoinPool={handleJoinPool}
        />
        
        {/* Enhanced Welcome Header */}
        <div className="bg-gradient-welcome rounded-xl p-6 mb-8 shadow-lg border-0">
          {/* Personalized Welcome Message */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-white/90">
              Ready to dominate your Big Brother pools?
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            {/* Quick Actions */}
            <div className="flex-1 min-w-0">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Your Pool Dashboard</h2>
                <p className="text-sm sm:text-base text-white/80">Select a pool below to view your dashboard</p>
              </div>
            </div>

            {/* Action Controls */}
            {user && (
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <PoolSwitcher />
                
                {activePool && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRules(!showRules)}
                      className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal hover:text-white transition-all duration-200 text-xs sm:text-sm"
                      title={showRules ? "Hide The Rules" : "Show The Rules & Scoring"}
                    >
                      <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">{showRules ? 'Hide Rules' : 'The Rules'}</span>
                    </Button>
                    
                    <InviteFriendsButton />
                    
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin')}
                        className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal hover:text-white transition-all duration-200 text-xs sm:text-sm"
                        title="Admin Panel"
                      >
                        <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Admin</span>
                      </Button>
                    )}
                    
                    {/* Debug button for pool selection */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleForceShowPools}
                      className="border-yellow-500/30 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all duration-200 text-xs sm:text-sm"
                      title="Show All My Pools (Debug)"
                    >
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Show All Pools</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        
        <HeroSection />
        
        <StatsBar />
        
        {activePool && (
          <DynamicHowToPlay 
            poolId={activePool.id}
            showRules={showRules}
            onToggleRules={() => setShowRules(!showRules)}
          />
        )}

        <MainContent formData={formData} picksPerTeam={activePool?.picks_per_team || 5} />

        <Footer />
      </div>
    </div>
  );
});

export default Index;
