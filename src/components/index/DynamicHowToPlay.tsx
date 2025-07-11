import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Target, Trophy, DollarSign, AlertCircle, Crown, Calendar, Star, Scale, Gavel, Zap } from 'lucide-react';
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
    console.log('🔧 HOW TO PLAY - Starting fetch for poolId:', poolId);
    
    try {
      setLoading(true);
      setError(null);

      // Fetch pool details
      console.log('🔧 HOW TO PLAY - Fetching pool details...');
      const { data: pool, error: poolError } = await supabase
        .from('pools')
        .select('*')
        .eq('id', poolId)
        .single();

      if (poolError) {
        console.error('🔧 HOW TO PLAY - Pool fetch error:', poolError);
        throw poolError;
      }
      
      console.log('🔧 HOW TO PLAY - Pool data received:', pool);

      // Fetch scoring rules for THIS POOL ONLY
      console.log('🔧 HOW TO PLAY - Fetching scoring rules for pool:', poolId);
      const { data: rules, error: rulesError } = await supabase
        .from('detailed_scoring_rules')
        .select('*')
        .eq('pool_id', poolId)
        .eq('is_active', true)
        .order('category', { ascending: true });

      console.log('=== RAW SCORING RULES RESULTS ===');
      console.log('Total rules from DB for pool:', rules?.length);
      console.log('Sample rules:', rules?.slice(0, 3).map(r => ({
        id: r.id,
        category: r.category,
        subcategory: r.subcategory,
        description: r.description
      })));

      // Check for duplicates in raw data
      const subcategoryCount = {};
      rules?.forEach(rule => {
        subcategoryCount[rule.subcategory] = (subcategoryCount[rule.subcategory] || 0) + 1;
      });
      console.log('Subcategory counts:', subcategoryCount);

      if (rulesError) {
        console.error('🔧 HOW TO PLAY - Scoring rules fetch error:', rulesError);
        throw rulesError;
      }
      
      console.log('🔧 HOW TO PLAY - Scoring rules received:', rules);

      // Fetch bonus questions for this pool
      console.log('🔧 HOW TO PLAY - Fetching bonus questions for pool:', poolId);
      const { data: questions, error: questionsError } = await supabase
        .from('bonus_questions')
        .select('*')
        .eq('pool_id', poolId)
        .eq('is_active', true)
        .order('sort_order');

      if (questionsError) {
        console.error('🔧 HOW TO PLAY - Bonus questions fetch error:', questionsError);
        throw questionsError;
      }
      
      console.log('🔧 HOW TO PLAY - Bonus questions received:', questions);

      // Fetch entry count
      console.log('🔧 HOW TO PLAY - Fetching entry count...');
      const { count, error: countError } = await supabase
        .from('pool_entries')
        .select('id', { count: 'exact' })
        .eq('pool_id', poolId);

      if (countError) {
        console.error('🔧 HOW TO PLAY - Entry count fetch error:', countError);
        throw countError;
      }
      
      console.log('🔧 HOW TO PLAY - Entry count received:', count);

      setPoolConfig(pool);
      setScoringRules(rules || []);
      setBonusQuestions(questions || []);
      setTotalEntries(count || 0);
      
      console.log('🔧 HOW TO PLAY - Final state set:', {
        poolName: pool?.name,
        scoringRulesCount: rules?.length || 0,
        bonusQuestionsCount: questions?.length || 0,
        totalEntries: count || 0
      });
    } catch (err) {
      console.error('🔧 HOW TO PLAY - ERROR fetching pool configuration:', err);
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

  const competitionRules = getRulesByCategory('competition');
  const weeklyRules = getRulesByCategory('weekly_events');
  const specialAchievementRules = getRulesByCategory('special_achievements');
  const juryRules = getRulesByCategory('jury');
  const finalPlacementRules = getRulesByCategory('final_placement');
  const specialEventRules = getRulesByCategory('special_events');

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

          {/* Prize Pool Section - Show ONLY individual prizes, NEVER the total */}
          {poolConfig.has_buy_in && prizeCalculation && prizeCalculation.prizes.length > 0 && totalEntries > 0 && (
            <Card className="mb-8 border-yellow-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  Prize Pool
                </CardTitle>
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
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">🎉</div>
                <CardTitle>Join the Fun</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get your invite code and jump into the ultimate Big Brother fantasy experience with friends!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">👑</div>
                <CardTitle>Build Your Dream Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Choose your champions! Draft {poolConfig.picks_per_team} houseguests and put your Big Brother knowledge to the test.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">🏆</div>
                <CardTitle>Win Glory (& Maybe Cash!)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Earn points all season long as your picks dominate competitions. Bragging rights guaranteed, prizes possible!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Scoring System */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Scoring System for {poolConfig.name}
              </CardTitle>
              <p className="text-muted-foreground">How your houseguests earn points in this pool</p>
            </CardHeader>
            <CardContent>
              {/* Desktop Layout */}
              <div className="hidden md:block space-y-8">
                {competitionRules.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Crown className="h-5 w-5 text-blue-600" />
                      <h3 className="text-xl font-semibold">Competition Wins</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {competitionRules.map((rule) => (
                        <div key={rule.id} className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 flex flex-col justify-between">
                          <span className="font-medium text-gray-800 mb-2">{rule.description || rule.subcategory}</span>
                          <Badge 
                            variant={rule.points >= 0 ? "default" : "destructive"}
                            className="self-start"
                          >
                            {rule.points >= 0 ? '+' : ''}{rule.points} point{Math.abs(rule.points) !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {weeklyRules.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <h3 className="text-xl font-semibold">Weekly Events</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {weeklyRules.map((rule) => (
                        <div key={rule.id} className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 flex flex-col justify-between">
                          <span className="font-medium text-gray-800 mb-2">{rule.description || rule.subcategory}</span>
                          <Badge 
                            variant={rule.points >= 0 ? "default" : "destructive"}
                            className="self-start"
                          >
                            {rule.points >= 0 ? '+' : ''}{rule.points} point{Math.abs(rule.points) !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {specialAchievementRules.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-purple-600" />
                      <h3 className="text-xl font-semibold">Special Achievements</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {specialAchievementRules.map((rule) => (
                        <div key={rule.id} className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 flex flex-col justify-between">
                          <span className="font-medium text-gray-800 mb-2">{rule.description || rule.subcategory}</span>
                          <Badge 
                            variant={rule.points >= 0 ? "default" : "destructive"}
                            className="self-start"
                          >
                            {rule.points >= 0 ? '+' : ''}{rule.points} point{Math.abs(rule.points) !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {juryRules.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Scale className="h-5 w-5 text-orange-600" />
                      <h3 className="text-xl font-semibold">Jury Phase</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {juryRules.map((rule) => (
                        <div key={rule.id} className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 flex flex-col justify-between">
                          <span className="font-medium text-gray-800 mb-2">{rule.description || rule.subcategory}</span>
                          <Badge 
                            variant={rule.points >= 0 ? "default" : "destructive"}
                            className="self-start"
                          >
                            {rule.points >= 0 ? '+' : ''}{rule.points} point{Math.abs(rule.points) !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {finalPlacementRules.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <h3 className="text-xl font-semibold">Final Placement</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {finalPlacementRules.map((rule) => (
                        <div key={rule.id} className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4 flex flex-col justify-between">
                          <span className="font-medium text-gray-800 mb-2">{rule.description || rule.subcategory}</span>
                          <Badge 
                            variant={rule.points >= 0 ? "default" : "destructive"}
                            className="self-start"
                          >
                            {rule.points >= 0 ? '+' : ''}{rule.points} point{Math.abs(rule.points) !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {specialEventRules.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="h-5 w-5 text-red-600" />
                      <h3 className="text-xl font-semibold">Special Events</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {specialEventRules.map((rule) => (
                        <div key={rule.id} className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 flex flex-col justify-between">
                          <span className="font-medium text-gray-800 mb-2">{rule.description || rule.subcategory}</span>
                          <Badge 
                            variant={rule.points >= 0 ? "default" : "destructive"}
                            className="self-start"
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
                    <div className="flex items-center gap-2 mb-4">
                      <Gavel className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-xl font-semibold">Bonus Questions ({bonusQuestions.length} questions)</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {bonusQuestions.slice(0, 6).map((question) => (
                        <div key={question.id} className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-4 flex flex-col justify-between">
                          <span className="font-medium text-gray-800 mb-2 text-sm">{question.question_text}</span>
                          <Badge variant="default" className="self-start">
                            +{question.points_value} point{question.points_value !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      ))}
                      {bonusQuestions.length > 6 && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 flex items-center justify-center text-muted-foreground text-sm">
                          ... and {bonusQuestions.length - 6} more questions
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Layout - Accordion */}
              <div className="md:hidden">
                <Accordion type="multiple" className="space-y-2">
                  {competitionRules.length > 0 && (
                    <AccordionItem value="competition" className="border rounded-xl px-1">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold">Competition Wins</span>
                          <Badge variant="outline" className="ml-auto">{competitionRules.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          {competitionRules.map((rule) => (
                            <div key={rule.id} className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-medium text-gray-800 text-sm">{rule.description || rule.subcategory}</span>
                                <Badge 
                                  variant={rule.points >= 0 ? "default" : "destructive"}
                                  className="shrink-0"
                                >
                                  {rule.points >= 0 ? '+' : ''}{rule.points}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {weeklyRules.length > 0 && (
                    <AccordionItem value="weekly" className="border rounded-xl px-1">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">Weekly Events</span>
                          <Badge variant="outline" className="ml-auto">{weeklyRules.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          {weeklyRules.map((rule) => (
                            <div key={rule.id} className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-medium text-gray-800 text-sm">{rule.description || rule.subcategory}</span>
                                <Badge 
                                  variant={rule.points >= 0 ? "default" : "destructive"}
                                  className="shrink-0"
                                >
                                  {rule.points >= 0 ? '+' : ''}{rule.points}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {specialAchievementRules.length > 0 && (
                    <AccordionItem value="achievements" className="border rounded-xl px-1">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold">Special Achievements</span>
                          <Badge variant="outline" className="ml-auto">{specialAchievementRules.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          {specialAchievementRules.map((rule) => (
                            <div key={rule.id} className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-medium text-gray-800 text-sm">{rule.description || rule.subcategory}</span>
                                <Badge 
                                  variant={rule.points >= 0 ? "default" : "destructive"}
                                  className="shrink-0"
                                >
                                  {rule.points >= 0 ? '+' : ''}{rule.points}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {juryRules.length > 0 && (
                    <AccordionItem value="jury" className="border rounded-xl px-1">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-orange-600" />
                          <span className="font-semibold">Jury Phase</span>
                          <Badge variant="outline" className="ml-auto">{juryRules.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          {juryRules.map((rule) => (
                            <div key={rule.id} className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-medium text-gray-800 text-sm">{rule.description || rule.subcategory}</span>
                                <Badge 
                                  variant={rule.points >= 0 ? "default" : "destructive"}
                                  className="shrink-0"
                                >
                                  {rule.points >= 0 ? '+' : ''}{rule.points}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {finalPlacementRules.length > 0 && (
                    <AccordionItem value="final" className="border rounded-xl px-1">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                          <span className="font-semibold">Final Placement</span>
                          <Badge variant="outline" className="ml-auto">{finalPlacementRules.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          {finalPlacementRules.map((rule) => (
                            <div key={rule.id} className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-3">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-medium text-gray-800 text-sm">{rule.description || rule.subcategory}</span>
                                <Badge 
                                  variant={rule.points >= 0 ? "default" : "destructive"}
                                  className="shrink-0"
                                >
                                  {rule.points >= 0 ? '+' : ''}{rule.points}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {specialEventRules.length > 0 && (
                    <AccordionItem value="special" className="border rounded-xl px-1">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-red-600" />
                          <span className="font-semibold">Special Events</span>
                          <Badge variant="outline" className="ml-auto">{specialEventRules.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          {specialEventRules.map((rule) => (
                            <div key={rule.id} className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-3">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-medium text-gray-800 text-sm">{rule.description || rule.subcategory}</span>
                                <Badge 
                                  variant={rule.points >= 0 ? "default" : "destructive"}
                                  className="shrink-0"
                                >
                                  {rule.points >= 0 ? '+' : ''}{rule.points}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {bonusQuestions.length > 0 && (
                    <AccordionItem value="bonus" className="border rounded-xl px-1">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Gavel className="h-4 w-4 text-indigo-600" />
                          <span className="font-semibold">Bonus Questions</span>
                          <Badge variant="outline" className="ml-auto">{bonusQuestions.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          {bonusQuestions.map((question) => (
                            <div key={question.id} className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-3">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-medium text-gray-800 text-sm">{question.question_text}</span>
                                <Badge variant="default" className="shrink-0">
                                  +{question.points_value}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>

              {competitionRules.length === 0 && weeklyRules.length === 0 && specialAchievementRules.length === 0 && juryRules.length === 0 && finalPlacementRules.length === 0 && specialEventRules.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No scoring rules configured for this pool yet.</p>
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