import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Users, Target, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrizePoolInAbout } from '@/components/PrizePoolInAbout';
import { usePoolData } from '@/hooks/usePoolData';

const About = () => {
  const navigate = useNavigate();
  const { poolSettings, loading: poolLoading } = usePoolData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Main Site
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
                {poolLoading ? 'Loading...' : `Select ${poolSettings?.picks_per_team || 5} houseguests from different groups to build your ultimate Big Brother team.`}
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
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Scoring System</CardTitle>
            <CardDescription>How your houseguests earn points each week</CardDescription>
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
                          <Badge variant="secondary">+5 points</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span>Runner-up</span>
                          <Badge variant="secondary">+3 points</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span>America's Favorite</span>
                          <Badge variant="secondary">+3 points</Badge>
                        </div>
              </div>
            </div>
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
                <li>{poolLoading ? 'Loading...' : `Draft exactly ${poolSettings?.picks_per_team || 5} houseguests for your team`}</li>
                <li>You must select one houseguest from each of the groups, plus additional picks as configured</li>
                <li>No duplicate picks - each houseguest can only be on one team</li>
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

        {/* Prize Pool Section */}
        <PrizePoolInAbout />

        {/* Call to Action */}
        <div className="text-center">
          <Card className="inline-block p-8">
            <CardContent className="space-y-4">
              <h2 className="text-2xl font-bold">Ready to Play?</h2>
              <p className="text-gray-600">
                Join the pool and start building your championship team!
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
              >
                Start Drafting Your Team
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