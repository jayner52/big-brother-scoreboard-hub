
import React, { useState, useEffect } from 'react';
import { PoolProvider } from '@/contexts/PoolContext';
import { TeamDraftForm } from '@/components/TeamDraftForm';
import { TeamLeaderboard } from '@/components/TeamLeaderboard';
import { EveryonesPicks } from '@/components/EveryonesPicks';
import { LiveResults } from '@/components/LiveResults';
import { HouseguestValues } from '@/components/HouseguestValues';
import { ContestantBios } from '@/components/ContestantBios';
import { PrizePoolDisplay } from '@/components/PrizePoolDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, BookOpen, LogOut, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userEntry, setUserEntry] = useState<any>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

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
      // Get user's pool entry
      const { data: entryData } = await supabase
        .from('pool_entries')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (entryData) {
        setUserEntry(entryData);
        
        // Get user's rank
        const { data: allEntries } = await supabase
          .from('pool_entries')
          .select('*')
          .order('total_points', { ascending: false });
        
        if (allEntries) {
          const rank = allEntries.findIndex(entry => entry.id === entryData.id) + 1;
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

  return (
    <PoolProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-between items-start mb-4">
              {!user ? (
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    Login / Sign Up
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      {userEntry?.participant_name || user.email}
                    </span>
                    {userRank && (
                      <Badge variant="secondary">#{userRank}</Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Big Brother Fantasy Pool
              </h1>
              <Link to="/admin">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Draft your favorite houseguests and compete with friends as the drama unfolds in the Big Brother house!
            </p>
            
            {/* User Status Display */}
            {user && userEntry && (
              <div className="mt-4 max-w-lg mx-auto">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-2">Your Team: {userEntry.team_name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Current Rank:</span>
                      <Badge variant="outline" className="ml-1">#{userRank}</Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Points:</span>
                      <Badge variant="default" className="ml-1">{userEntry.total_points}</Badge>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Team: {[userEntry.player_1, userEntry.player_2, userEntry.player_3, userEntry.player_4, userEntry.player_5].join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* How to Play Card */}
          <div className="text-center mb-8">
            <Link to="/about">
              <div className="inline-block p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <BookOpen className="w-8 h-8" />
                  <h3 className="text-xl font-bold">How to Play & Rules</h3>
                </div>
                <p className="text-purple-100">
                  Learn the scoring system, draft rules, and how to win the pool!
                </p>
              </div>
            </Link>
          </div>

          {/* Tabbed Interface */}
          <Tabs defaultValue="draft" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="draft">Draft Team</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="picks">Everyone's Picks</TabsTrigger>
              <TabsTrigger value="results">Live Results</TabsTrigger>
              <TabsTrigger value="contestants">Houseguest Values</TabsTrigger>
              <TabsTrigger value="bios">Houseguest Bios</TabsTrigger>
            </TabsList>

            <TabsContent value="draft">
              <TeamDraftForm />
            </TabsContent>

            <TabsContent value="leaderboard">
              <TeamLeaderboard />
            </TabsContent>

            <TabsContent value="picks">
              <EveryonesPicks />
            </TabsContent>

            <TabsContent value="results">
              <LiveResults />
            </TabsContent>

            <TabsContent value="contestants">
              <HouseguestValues />
            </TabsContent>

            <TabsContent value="bios">
              <ContestantBios />
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <footer className="text-center text-gray-500 text-sm mt-16 py-8 border-t">
            <p>© 2025 Big Brother Fantasy Pool | May the best picks win! 🏆</p>
          </footer>
        </div>
      </div>
    </PoolProvider>
  );
};

export default Index;
