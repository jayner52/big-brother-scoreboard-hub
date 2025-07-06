import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Trophy, DollarSign } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { PrizePoolSection } from './PrizePoolSection';

interface HowToPlaySectionProps {
  showRules: boolean;
  onToggleRules: () => void;
}

export const HowToPlaySection: React.FC<HowToPlaySectionProps> = ({
  showRules,
  onToggleRules,
}) => {
  const { activePool } = usePool();
  const picksPerTeam = activePool?.picks_per_team || 5;
  return (
    <div className="mb-8 text-center">

      {showRules && (
        <div className="max-w-6xl mx-auto">
          {/* Prize Pool Section */}
          <PrizePoolSection />
          
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
  );
};