
import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useDraftForm } from '@/hooks/useDraftForm';
import { HeaderNavigation } from '@/components/index/HeaderNavigation';
import { HeroSection } from '@/components/index/HeroSection';
import { HowToPlaySection } from '@/components/index/HowToPlaySection';
import { MainContent } from '@/components/index/MainContent';
import { Footer } from '@/components/index/Footer';
import { PoolSwitcher } from '@/components/pools/PoolSwitcher';
import { usePool } from '@/contexts/PoolContext';
import { usePoolRedirect } from '@/hooks/usePoolRedirect';

const Index = () => {
  const navigate = useNavigate();
  const { hasAccess } = usePoolRedirect();
  const [showRules, setShowRules] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userEntry, setUserEntry] = useState<any>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const { formData } = useDraftForm();
  const { activePool } = usePool();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserEntry(session.user.id);
      }
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
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserEntry = async (userId: string) => {
    try {
      if (!activePool) return;
      
      // Get user's pool entries for the active pool
      const { data: entriesData } = await supabase
        .from('pool_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('pool_id', activePool.id);

      if (entriesData && entriesData.length > 0) {
        const mainEntry = entriesData[0];
        setUserEntry(mainEntry);
        
        // Get user's rank in the active pool
        const { data: allEntries } = await supabase
          .from('pool_entries')
          .select('*')
          .eq('pool_id', activePool.id)
          .order('total_points', { ascending: false });
        
        if (allEntries) {
          const rank = allEntries.findIndex(entry => entry.id === mainEntry.id) + 1;
          setUserRank(rank);
        }
      } else {
        setUserEntry(null);
        setUserRank(null);
      }
    } catch (error) {
      console.error('Error loading user entry:', error);
    }
  };

  // Reload user entry when active pool changes
  useEffect(() => {
    if (user && activePool) {
      loadUserEntry(user.id);
    }
  }, [user, activePool]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleJoinPool = () => {
    navigate('/draft');
  };

  if (!hasAccess) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <HeaderNavigation
            user={user}
            userEntry={userEntry}
            userRank={userRank}
            onSignOut={handleSignOut}
            onJoinPool={handleJoinPool}
          />
          {user && <PoolSwitcher />}
        </div>
        
        <HeroSection />
        
        <HowToPlaySection
          showRules={showRules}
          onToggleRules={() => setShowRules(!showRules)}
        />

        <MainContent formData={formData} />

        <Footer />
      </div>
    </div>
  );
};

export default Index;
