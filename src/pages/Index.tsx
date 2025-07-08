
import React from 'react';
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
import { usePool } from '@/contexts/PoolContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userEntry, setUserEntry] = useState<any>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { formData } = useDraftForm();
  const { 
    activePool, 
    userPools, 
    loading: poolsLoading, 
    poolEntries // Use pool-scoped entries from context
  } = usePool();

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

  const loadUserEntry = async (userId: string) => {
    try {
      if (!activePool || !poolEntries.length) return;
      
      // Find user's entry in the pool-scoped entries from context
      const userEntry = poolEntries.find(entry => entry.user_id === userId);
      
      if (userEntry) {
        setUserEntry(userEntry);
        
        // Calculate rank from sorted entries
        const sortedEntries = [...poolEntries].sort((a, b) => b.total_points - a.total_points);
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

  if (authLoading || poolsLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to landing...</div>;
  }

  // Auto-open create pool modal for new users
  const [showCreateModal, setShowCreateModal] = useState(userPools.length === 0);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handlePoolSuccess = () => {
    setShowCreateModal(false);
    setShowJoinModal(false);
  };

  // Show pool selection if user has no pools but keep it minimal
  if (userPools.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple/5 via-background to-teal/5">
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          <div className="text-center">
            <p className="text-lg mb-4">Getting your pool set up...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple/5 via-background to-teal/5">
      <div className="container mx-auto px-4 py-8">
        <ProfessionalNavigation
          user={user}
          userEntry={userEntry}
          userRank={userRank}
          onSignOut={handleSignOut}
          onJoinPool={handleJoinPool}
        />
        
        <div className="flex items-center justify-between mb-8">
          <div></div>
          <div className="flex items-center gap-2">
            {user && <PoolSwitcher />}
            {user && activePool && <InviteFriendsButton />}
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
};

export default Index;
