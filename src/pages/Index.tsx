
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, BookOpen, LogOut, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);
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
          {/* Header with User Status */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
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
            </div>

            {/* Center Title */}
            <div className="text-center">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Big Brother Fantasy Pool
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-2">
                Draft your team of 5 houseguests and earn points based on their performance!
              </p>
            </div>

            {/* Right Side - Admin and User Panel */}
            <div className="flex-1 flex justify-end">
              <div className="flex flex-col items-end gap-4">
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
                
                {/* User Status Panel */}
                {user && (
                  <div className="w-72 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">Your Status</h3>
                      <Button
                        onClick={() => navigate('/auth')}
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Account
                      </Button>
                    </div>
                    
                    {userEntry ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Team:</span>
                          <span className="font-medium text-gray-800">{userEntry.team_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Points:</span>
                          <span className="font-bold text-green-600">{userEntry.total_points}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rank:</span>
                          <span className="font-medium text-gray-800">#{userEntry.current_rank || 'TBD'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="text-green-600 font-medium">Registered</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 mb-2">Not registered</p>
                        <Button
                          onClick={() => navigate('/draft')}
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          Join Pool
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* How to Play Section - only show if not logged in */}
          {!user && (
            <div className="mb-8 text-center">
              <Button
                onClick={() => setShowRules(!showRules)}
                variant="outline"
                className="mb-4"
              >
                {showRules ? 'Hide' : 'Show'} How to Play
              </Button>

              {showRules && (
                <Card className="max-w-4xl mx-auto text-left">
                  <CardHeader>
                    <CardTitle>How to Play</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Draft Phase:</h4>
                      <p>Select 5 houseguests for your team before the deadline.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Scoring:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>HOH Winner: +5 points</li>
                        <li>POV Winner: +3 points</li>
                        <li>Nominated: +1 point</li>
                        <li>Survival: +2 points per week</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

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
