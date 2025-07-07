import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Trophy, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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

interface DynamicHowToPlayProps {
  poolId: string;
  showRules: boolean;
  onToggleRules: () => void;
}

export const DynamicHowToPlay: React.FC<DynamicHowToPlayProps> = ({
  poolId,
  showRules,
  onToggleRules,
}) => {
  const [poolConfig, setPoolConfig] = useState<Pool | null>(null);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [bonusQuestions, setBonusQuestions] = useState<BonusQuestion[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (poolId) {
      fetchPoolConfiguration();
    }
  }, [poolId]);

  const fetchPoolConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch pool details
      const { data: pool, error: poolError } = await supabase
        .from('pools')
        .select('*')
        .eq('id', poolId)
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
        .eq('pool_id', poolId)
        .eq('is_active', true)
        .order('sort_order');

      if (questionsError) throw questionsError;

      // Fetch entry count
      const { count, error: countError } = await supabase
        .from('pool_entries')
        .select('id', { count: 'exact' })
        .eq('pool_id', poolId);

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

  if (loading) {
    return (
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
          <span className="ml-3 text-muted-foreground">Loading pool configuration...</span>
        </div>
      </div>
    );
  }

  if (error || !poolConfig) {
    return (
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center py-12 text-destructive">
          <AlertCircle className="h-8 w-8 mr-3" />
          <span>{error || 'Pool configuration not found'}</span>
        </div>
      </div>
    );
  }

  // Group scoring rules by category
  const getRulesByCategory = (category: string) =>
    scoringRules.filter(rule => rule.category === category);

  const weeklyRules = getRulesByCategory('weekly');
  const specialRules = getRulesByCategory('special_events');
  const finalRules = getRulesByCategory('final_results');

  // Calculate prize pool if applicable
  const prizeCalculation = poolConfig.has_buy_in ? calculatePrizes(poolConfig, totalEntries) : null;

  return (
    <div className="mb-8 text-center">
      {showRules && (
        <div className="max-w-6xl mx-auto">
          {/* Pool Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-dark mb-4">
              How to Play: {poolConfig.name}
            </h2>
            {poolConfig.description && (
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {poolConfig.description}
              </p>
            )}
          </div>

          {/* Prize Pool Section */}
          {poolConfig.has_buy_in && prizeCalculation && prizeCalculation.prizes.length > 0 && totalEntries > 0 && (
            <Card className="mb-8 border-yellow-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  Prize Pool
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total Prize Pool: {formatPrize(prizeCalculation.totalPrizePool, poolConfig.entry_fee_currency)} from {totalEntries} entries
                </p>
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
              </CardContent>
            </Card>
          )}
          
          {/* How It Works Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-8 w-8 mx-auto text-coral" />
                <CardTitle>Draft Your Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Select {poolConfig.picks_per_team} houseguests to build your team for {poolConfig.name}.
                </p>
              </CardContent>
            </Card>

            {poolConfig.enable_bonus_questions && bonusQuestions.length > 0 && (
              <Card className="text-center">
                <CardHeader>
                  <Target className="h-8 w-8 mx-auto text-brand-teal" />
                  <CardTitle>Answer Bonus Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Answer {bonusQuestions.length} bonus questions to earn up to {bonusQuestions.reduce((sum, q) => sum + q.points_value, 0)} extra points.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="text-center">
              <CardHeader>
                <Trophy className="h-8 w-8 mx-auto text-purple-600" />
                <CardTitle>Earn Points</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your houseguests earn points based on the custom scoring system configured for this pool.
                </p>
              </CardContent>
            </Card>

            {poolConfig.has_buy_in && (
              <Card className="text-center">
                <CardHeader>
                  <DollarSign className="h-8 w-8 mx-auto text-yellow" />
                  <CardTitle>Win Prizes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Compete for cash prizes! Entry fee: {formatPrize(poolConfig.entry_fee_amount, poolConfig.entry_fee_currency)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Scoring System */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Scoring System for {poolConfig.name}</CardTitle>
              <p className="text-sm text-muted-foreground">How your houseguests earn points in this pool</p>
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
                  <p>No scoring rules configured for this pool yet.</p>
                  <p className="text-sm mt-2">Contact your pool administrator to set up scoring rules.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};