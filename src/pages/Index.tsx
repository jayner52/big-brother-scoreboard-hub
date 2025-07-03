
import React, { useState, useEffect } from 'react';
import { PoolProvider } from '@/contexts/PoolContext';
import { TeamDraftForm } from '@/components/TeamDraftForm';
import { EnhancedTeamLeaderboard } from '@/components/enhanced/EnhancedTeamLeaderboard';
import { EveryonesPicksMatrix } from '@/components/enhanced/EveryonesPicksMatrix';
import { LiveResults } from '@/components/LiveResults';
import { HouseguestValues } from '@/components/HouseguestValues';
import { ContestantBios } from '@/components/ContestantBios';
import { PrizePoolDisplay } from '@/components/PrizePoolDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, BookOpen, LogOut, User, Users, Target, Trophy, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Badge } from '@/components/ui/badge';

import { UserPaymentButton } from '@/components/enhanced/UserPaymentButton';

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

  return (
    <PoolProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Navigation */}
          <div className="flex justify-between items-start mb-8">
            {/* Left Side - Auth and How to Play */}
            <div className="flex-1 flex items-center gap-4">
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
              
              {/* How to Play Button - Always Visible */}
              <Link to="/about">
                <Button 
                  className="bg-purple hover:bg-purple/90 text-purple-foreground flex items-center gap-2"
                  size="sm"
                >
                  <BookOpen className="h-4 w-4" />
                  How to Play
                </Button>
              </Link>
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

            {/* Right Side - Admin and User Status */}
            <div className="flex-1 flex justify-end">
              <div className="flex flex-col items-end gap-4">
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
                
                
                {/* Join Pool Button for logged in users without entry */}
                {user && !userEntry && (
                  <div className="w-72 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-center">
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
                <div className="max-w-6xl mx-auto">
                  {/* How It Works Section */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="text-center">
                      <CardHeader>
                        <Users className="h-8 w-8 mx-auto text-blue-500" />
                        <CardTitle>Draft Your Team</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          Select 5 houseguests from different groups to build your ultimate Big Brother team.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="text-center">
                      <CardHeader>
                        <Target className="h-8 w-8 mx-auto text-green-500" />
                        <CardTitle>Make Predictions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          Answer bonus questions about the season to earn extra points for your predictions.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="text-center">
                      <CardHeader>
                        <Trophy className="h-8 w-8 mx-auto text-purple-500" />
                        <CardTitle>Earn Points</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          Your houseguests earn points for winning competitions, surviving evictions, and more.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="text-center">
                      <CardHeader>
                        <DollarSign className="h-8 w-8 mx-auto text-yellow-500" />
                        <CardTitle>Win Prizes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          Top performers at the end of the season win cash prizes from the pool!
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Scoring System */}
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle className="text-2xl">Scoring System</CardTitle>
                      <p className="text-sm text-gray-600">How your houseguests earn points each week</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Weekly Competition Points</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Head of Household (HoH)</span>
                            <Badge variant="secondary">+3 points</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Power of Veto (PoV)</span>
                            <Badge variant="secondary">+2 points</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Saved by Veto</span>
                            <Badge variant="secondary">+1 point</Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Survival Points</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Surviving Each Week</span>
                            <Badge variant="secondary">+1 point</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Being Evicted</span>
                            <Badge variant="destructive">0 points</Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Special Events & Achievements</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Making it to Jury</span>
                            <Badge variant="secondary">+2 points</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Leaves not at eviction</span>
                            <Badge variant="destructive">-3 points</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>4 weeks, no comp wins</span>
                            <Badge variant="secondary">+1 point</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>2 rounds on block, survives</span>
                            <Badge variant="secondary">+3 points</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>4 rounds on block, survives</span>
                            <Badge variant="secondary">+5 points</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Comes back after eviction</span>
                            <Badge variant="secondary">+5 points</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>In a showmance</span>
                            <Badge variant="secondary">+2 points</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Wins a prize</span>
                            <Badge variant="secondary">+2 points</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Given/Wins Special Power</span>
                            <Badge variant="secondary">+2 points</Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Final Results</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Winner</span>
                            <Badge variant="secondary">+15 points</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Runner-up</span>
                            <Badge variant="secondary">+10 points</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>America's Favorite</span>
                            <Badge variant="secondary">+5 points</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
              <EnhancedTeamLeaderboard />
            </TabsContent>

            <TabsContent value="picks">
              <EveryonesPicksMatrix />
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
