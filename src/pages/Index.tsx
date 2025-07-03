
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PoolProvider } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useDraftForm } from '@/hooks/useDraftForm';
import { HeaderNavigation } from '@/components/index/HeaderNavigation';
import { HeroSection } from '@/components/index/HeroSection';
import { HowToPlaySection } from '@/components/index/HowToPlaySection';
import { MainContent } from '@/components/index/MainContent';
import { Footer } from '@/components/index/Footer';

const Index = () => {
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userEntry, setUserEntry] = useState<any>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const { formData } = useDraftForm();

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
      // Get user's pool entries (support multiple teams)
      const { data: entriesData } = await supabase
        .from('pool_entries')
        .select('*')
        .eq('user_id', userId);

      if (entriesData && entriesData.length > 0) {
        // For now, show the first entry, but we can enhance this later
        const mainEntry = entriesData[0];
        setUserEntry({
          ...mainEntry,
          allEntries: entriesData // Store all entries for future use
        });
        
        // Get user's rank based on their best team
        const { data: allEntries } = await supabase
          .from('pool_entries')
          .select('*')
          .order('total_points', { ascending: false });
        
        if (allEntries) {
          const rank = allEntries.findIndex(entry => entry.id === mainEntry.id) + 1;
          setUserRank(rank);
        }
      }
    } catch (error) {
      console.error('Error loading user entry:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleJoinPool = () => {
    navigate('/draft');
  };

  return (
    <PoolProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <HeaderNavigation
            user={user}
            userEntry={userEntry}
            userRank={userRank}
            onSignOut={handleSignOut}
            onJoinPool={handleJoinPool}
          />
          
          <HeroSection />
          
          {/* How to Play Section - only show if not logged in */}
          {!user && (
            <HowToPlaySection
              showRules={showRules}
              onToggleRules={() => setShowRules(!showRules)}
            />
          )}

          <MainContent formData={formData} />

          <Footer />
        </div>
      </div>
    </PoolProvider>
  );
};

export default Index;
