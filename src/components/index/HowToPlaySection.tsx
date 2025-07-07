import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Trophy, DollarSign } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { PrizePoolSection } from './PrizePoolSection';
import { DynamicPrizeDisplay } from './DynamicPrizeDisplay';
import { useScoringRules } from '@/hooks/useScoringRules';

interface HowToPlaySectionProps {
  showRules: boolean;
  onToggleRules: () => void;
}

export const HowToPlaySection: React.FC<HowToPlaySectionProps> = ({
  showRules,
  onToggleRules,
}) => {
  const { activePool } = usePool();
  const { scoringRules, loading } = useScoringRules();
  const picksPerTeam = activePool?.picks_per_team || 5;

  // Group scoring rules by category
  const getRulesByCategory = (category: string) =>
    scoringRules.filter(rule => rule.category === category);

  const weeklyRules = getRulesByCategory('weekly');
  const specialRules = getRulesByCategory('special_events');
  const finalRules = getRulesByCategory('final_results');
  return (
    <div className="mb-8 text-center">

      {showRules && (
        <div className="max-w-6xl mx-auto">
          {/* Dynamic Prize Pool Section - Only show if pool has buy-in and participants */}
          {activePool?.has_buy_in && (
            <div className="mb-8">
              <PrizePoolSection />
            </div>
          )}
          
          {/* How It Works Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-8 w-8 mx-auto text-blue-500" />
                <CardTitle>Draft Your Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Select {picksPerTeam} houseguests from different groups to build your ultimate Big Brother team.
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
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading scoring rules...</p>
                </div>
              ) : (
                <>
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

                  {!loading && weeklyRules.length === 0 && specialRules.length === 0 && finalRules.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No scoring rules configured for this pool yet.</p>
                      <p className="text-sm mt-2">Contact your pool administrator to set up scoring rules.</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};