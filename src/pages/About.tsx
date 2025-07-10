import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Users, Target, Award, Trophy, MessageCircle, Tv } from 'lucide-react';
import { PoolsidePicksLogo } from '@/components/brand/PoolsidePicksLogo';
import { PoolFloat } from '@/components/brand/PoolFloat';
import { useIsMobile } from '@/hooks/use-mobile';

const About = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      {/* Floating Pool Elements */}
      <div className="absolute top-20 left-10 opacity-40 animate-bounce">
        <PoolFloat className="w-16 h-16" color="teal" />
      </div>
      <div className="absolute top-40 right-20 opacity-30 animate-bounce" style={{ animationDelay: '1s' }}>
        <PoolFloat className="w-12 h-12" color="yellow" />
      </div>
      <div className="absolute bottom-32 left-20 opacity-50 animate-bounce" style={{ animationDelay: '2s' }}>
        <PoolFloat className="w-20 h-20" color="orange" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <PoolsidePicksLogo size="sm" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={`${isMobile ? 'text-4xl' : 'text-6xl'} font-bold text-dark mb-6`}>
            What is Poolside Picks?
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 mb-8 leading-relaxed`}>
              Poolside Picks is a free fantasy league platform built for Big Brother fans and reality TV obsessives. 
              Instead of just picking one winner, you draft a full team of houseguests and score points each week based 
              on what happens in the show—HOH wins, nominations, evictions, twists, and more.
            </p>
            
            <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 mb-8 leading-relaxed`}>
              Unlike traditional snake drafts or simple vote predictions, Poolside Picks lets you fully customize your fantasy league:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-8 text-left max-w-3xl mx-auto">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-brand-teal" />
                <span className="text-dark">Choose how many contestants are drafted per team</span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-coral" />
                <span className="text-dark">Set your own point system (25+ trackable events)</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-yellow" />
                <span className="text-dark">Create weekly bonus questions or predictions</span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-orange" />
                <span className="text-dark">Invite friends to join with a custom link</span>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-brand-teal" />
                <span className="text-dark">Set a prize pool or play for fun</span>
              </div>
            </div>

            <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 leading-relaxed`}>
              Whether you're a spreadsheet legend or a casual viewer, it's the easiest way to turn your summer 
              Big Brother obsession into something competitive, fun, and (yes) slightly chaotic.
            </p>
            
            <p className={`${isMobile ? 'text-xl' : 'text-2xl'} text-brand-teal font-bold mt-8`}>
              Create your league, draft your team, and let the drama begin.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-center text-dark mb-4`}>
            How It Works
          </h2>
          <p className="text-xl text-center text-dark/70 mb-12 max-w-3xl mx-auto">
            Poolside Picks is a customizable fantasy league platform designed for fans of Big Brother and other reality TV shows. Here's how it works:
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-coral)' }}>
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Step 1: Create Your League</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dark/70">
                  Start by setting up a league for you and your friends. You can play with as few as 2 people or as many as you want. 
                  Choose whether to play for fun or set your own buy-in and prizes.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-teal)' }}>
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Step 2: Customize Your Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dark/70">
                  Decide how many houseguests each team should draft, how many teams each person can make, and which events should be tracked. 
                  You can assign point values to 25+ different outcomes—everything from comp wins to getting into a showmance.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-yellow)' }}>
                  <Tv className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Step 3: Draft Your Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dark/70">
                  Each player builds a fantasy team by choosing real Big Brother houseguests. Everyone can use the same pool of players, 
                  or you can set restrictions. Think of it like fantasy football… but for reality chaos.
                </p>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-orange)' }}>
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Step 4: Make Weekly Picks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dark/70">
                  Each week, you can set bonus questions—like "Who will win Veto?" or "Will anyone cry in the DR?"—and your league members 
                  can submit their predictions for extra points.
                </p>
              </CardContent>
            </Card>

            {/* Step 5 */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-summer)' }}>
                  <Award className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Step 5: Score Automatically</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dark/70">
                  You or an admin user inputs the week's real-life results (for now), and scores are updated based on the custom rules you chose. 
                  In the future, this will be automated with AI scoring.
                </p>
              </CardContent>
            </Card>

            {/* Step 6 */}
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-coral)' }}>
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Step 6: Track the Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dark/70">
                  Real-time scores, team rankings, and bonus point breakdowns are all available on the dashboard. Talk trash, make trades 
                  (if you allow them), and compete for the crown.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final Message */}
        <div className="text-center mb-16">
          <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 mb-8 leading-relaxed`}>
                Built by a reality TV fan (with no coding background), Poolside Picks is designed to be flexible, fun, 
                and totally shareable. Whether you want a quick 1-on-1 competition or a full-season game with your group chat, 
                we've got you covered.
              </p>
              
              <Button
                onClick={() => navigate('/')}
                size={isMobile ? "default" : "lg"}
                className={`${isMobile ? 'w-full text-lg' : 'px-12 py-6 text-xl'} font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
                style={{ 
                  background: 'var(--gradient-coral)',
                  color: 'hsl(var(--coral-foreground))'
                }}
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Ready to Play? Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;