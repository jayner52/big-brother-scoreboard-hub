import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Users, Target, DollarSign, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePool } from '@/contexts/PoolContext';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { calculatePrizes, formatPrize, getPlaceText } from '@/utils/prizeCalculation';
import { Pool } from '@/types/pool';

interface ScoringRule {
  id: string;
  category: string;
  subcategory: string;
  points: number;
  description: string;
  is_active: boolean;
}

interface BonusQuestion {
  id: string;
  question_text: string;
  question_type: string;
  points_value: number;
}

const About = () => {
  const navigate = useNavigate();
  const { activePool } = usePool();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isPoolAdmin, setIsPoolAdmin] = useState(false);
  const [poolConfig, setPoolConfig] = useState<Pool | null>(null);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    if (activePool?.id) {
      fetchPoolConfiguration();
      checkAdminStatus();
    } else {
      // For non-authenticated users, fetch default rules
      fetchDefaultConfiguration();
    }
  }, [activePool?.id, user]);

  const checkAdminStatus = async () => {
    if (!activePool?.id || !user) return;
    
    try {
      const { data: membership } = await supabase
        .from('pool_memberships')
        .select('role')
        .eq('pool_id', activePool.id)
        .eq('user_id', user.id)
        .single();
      
      setIsPoolAdmin(membership?.role === 'owner' || membership?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchPoolConfiguration = async () => {
    if (!activePool?.id) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch pool details
      const { data: pool, error: poolError } = await supabase
        .from('pools')
        .select('*')
        .eq('id', activePool.id)
        .single();

      if (poolError) throw poolError;

      // Fetch scoring rules
      const { data: rules, error: rulesError } = await supabase
        .from('detailed_scoring_rules')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (rulesError) throw rulesError;

      // Fetch bonus questions for this pool
      const { data: questions, error: questionsError } = await supabase
        .from('bonus_questions')
        .select('*')
        .eq('pool_id', activePool.id)
        .eq('is_active', true)
        .order('sort_order');

      if (questionsError) throw questionsError;

      // Fetch entry count
      const { count, error: countError } = await supabase
        .from('pool_entries')
        .select('id', { count: 'exact' })
        .eq('pool_id', activePool.id);

      if (countError) throw countError;

      setPoolConfig(pool);
      setScoringRules(rules || []);
      setBonusQuestions(questions || []);
      setTotalEntries(count || 0);
    } catch (err) {
      console.error('Error fetching pool configuration:', err);
      setError('Failed to load pool configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch scoring rules for general display
      const { data: rules, error: rulesError } = await supabase
        .from('detailed_scoring_rules')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (rulesError) throw rulesError;

      setScoringRules(rules || []);
      // Set default values for general display
      setPoolConfig({
        picks_per_team: 5,
        enable_bonus_questions: true,
        has_buy_in: false,
      } as Pool);
      setBonusQuestions([]);
      setTotalEntries(0);
    } catch (err) {
      console.error('Error fetching default configuration:', err);
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  // Group scoring rules by category
  const getRulesByCategory = (category: string) =>
    scoringRules.filter(rule => rule.category === category);

  const weeklyRules = getRulesByCategory('weekly');
  const specialRules = getRulesByCategory('special_events');
  const finalRules = getRulesByCategory('final_results');

  // Calculate prize pool if applicable and admin allows it to be shown
  const prizeCalculation = poolConfig?.has_buy_in && activePool ? calculatePrizes(poolConfig, totalEntries) : null;
  const showPrizeSection = poolConfig?.has_buy_in && (poolConfig?.show_prize_amounts || isPoolAdmin);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
            <span className="ml-3 text-lg text-muted-foreground">Loading pool information...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !poolConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-32 text-destructive">
            <AlertCircle className="h-12 w-12 mr-3" />
            <span className="text-lg">{error || 'Configuration not found'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {user ? 'Back to Dashboard' : 'Back to Home'}
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent leading-tight py-2">
            Big Brother Fantasy Pool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Draft your favorite houseguests, make predictions, and compete with friends in the ultimate Big Brother fantasy experience!
          </p>
        </div>

        {/* How It Works Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-8 w-8 mx-auto text-blue-500" />
              <CardTitle>Draft Your Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Select {poolConfig.picks_per_team} houseguests from different groups to build your ultimate Big Brother team.
              </p>
            </CardContent>
          </Card>

          {poolConfig.enable_bonus_questions && (
            <Card className="text-center">
              <CardHeader>
                <Target className="h-8 w-8 mx-auto text-green-500" />
                <CardTitle>Make Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {bonusQuestions.length > 0 
                    ? `Answer ${bonusQuestions.length} bonus questions to earn up to ${bonusQuestions.reduce((sum, q) => sum + q.points_value, 0)} extra points.`
                    : 'Answer bonus questions about the season to earn extra points for your predictions.'
                  }
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="text-center">
            <CardHeader>
              <Trophy className="h-8 w-8 mx-auto text-purple-500" />
              <CardTitle>Earn Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Your houseguests earn points based on the {scoringRules.length > 0 ? 'configured scoring system' : 'weekly competitions, surviving evictions, and more'}.
              </p>
            </CardContent>
          </Card>

          {poolConfig.has_buy_in && (
            <Card className="text-center">
              <CardHeader>
                <DollarSign className="h-8 w-8 mx-auto text-yellow-500" />
                <CardTitle>Win Prizes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Top performers at the end of the season win cash prizes! Entry fee: {formatPrize(poolConfig.entry_fee_amount || 0, poolConfig.entry_fee_currency || 'CAD')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Scoring System */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Scoring System</CardTitle>
            <CardDescription>{activePool ? `How your houseguests earn points in ${poolConfig.name || 'this pool'}` : 'How your houseguests earn points each week'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {weeklyRules.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Weekly Competition Points</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {weeklyRules.map((rule) => (
                    <div key={rule.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border">
                      <span>{rule.description || rule.subcategory}</span>
                      <Badge 
                        variant={rule.points >= 0 ? "secondary" : "destructive"}
                      >
                        {rule.points >= 0 ? '+' : ''}{rule.points} point{Math.abs(rule.points) !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {specialRules.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Special Events & Achievements</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {specialRules.map((rule) => (
                    <div key={rule.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border">
                      <span>{rule.description || rule.subcategory}</span>
                      <Badge 
                        variant={rule.points >= 0 ? "secondary" : "destructive"}
                      >
                        {rule.points >= 0 ? '+' : ''}{rule.points} point{Math.abs(rule.points) !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {finalRules.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Final Results</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {finalRules.map((rule) => (
                    <div key={rule.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border">
                      <span>{rule.description || rule.subcategory}</span>
                      <Badge 
                        variant={rule.points >= 0 ? "secondary" : "destructive"}
                      >
                        {rule.points >= 0 ? '+' : ''}{rule.points} point{Math.abs(rule.points) !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bonusQuestions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Bonus Questions ({bonusQuestions.length} questions)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {bonusQuestions.slice(0, 6).map((question) => (
                    <div key={question.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border">
                      <span className="text-sm">{question.question_text}</span>
                      <Badge variant="secondary">
                        +{question.points_value} point{question.points_value !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))}
                  {bonusQuestions.length > 6 && (
                    <div className="text-center p-3 text-muted-foreground text-sm">
                      ... and {bonusQuestions.length - 6} more questions
                    </div>
                  )}
                </div>
              </div>
            )}

            {weeklyRules.length === 0 && specialRules.length === 0 && finalRules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No scoring rules configured yet.</p>
                <p className="text-sm mt-2">Contact your pool administrator to set up scoring rules.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rules Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Pool Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Team Building</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Draft exactly {poolConfig.picks_per_team} houseguests for your team</li>
                <li>You must select one houseguest from each of the groups, plus additional picks as configured</li>
                <li>{poolConfig.allow_duplicate_picks ? 'Duplicate picks are allowed' : 'No duplicate picks - each houseguest can only be on one team'}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Bonus Questions</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Answer bonus prediction questions for extra points</li>
                <li>Points are awarded when answers are revealed during the season</li>
                <li>Some questions have higher point values based on difficulty</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Scoring</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Points are calculated weekly based on your houseguests' performance</li>
                <li>Your total score includes weekly points + bonus question points</li>
                <li>Rankings are updated after each episode</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Prize Pool Section - Only show if admin allows it */}
        {showPrizeSection && prizeCalculation && prizeCalculation.prizes.length > 0 && totalEntries > 0 && (
          <Card className="mb-12 border-yellow-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                Prize Pool
              </CardTitle>
              {/* Only show total prize pool to admins */}
              {isPoolAdmin && (
                <p className="text-sm text-muted-foreground">
                  Total Prize Pool: {formatPrize(prizeCalculation.totalPrizePool, poolConfig.entry_fee_currency)} from {totalEntries} entries
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {prizeCalculation.prizes.map((prize, index) => (
                  <div 
                    key={prize.place} 
                    className={`text-center p-6 rounded-xl border-2 shadow-md ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300' :
                      index === 1 ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300' :
                      index === 2 ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300' :
                      'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300'
                    }`}
                  >
                    <div className="text-lg font-semibold mb-3">
                      {getPlaceText(prize.place)}
                    </div>
                    <Badge variant="secondary" className="text-xl font-bold py-2 px-4">
                      {formatPrize(prize.amount, poolConfig.entry_fee_currency)}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4 text-sm text-gray-600">
                Winners will be determined based on final ranking at the end of the season
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <Card className="inline-block p-8">
            <CardContent className="space-y-4">
              <h2 className="text-2xl font-bold">Ready to Play?</h2>
              <p className="text-gray-600">
                Join the pool and start building your championship team!
              </p>
              <Button 
                onClick={() => navigate(user ? '/dashboard' : '/')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
              >
                {user ? 'Go to Dashboard' : 'Start Drafting Your Team'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-16 py-8 border-t">
          <p>© 2025 Big Brother Fantasy Pool • May the odds be ever in your favor!</p>
        </footer>
      </div>
    </div>
  );
};

export default About;
