import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, BarChart3, MessageCircle, ArrowRight, Tv } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const AvailableShowsSection: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBigBrotherLaunch = () => {
    navigate('/landing');
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-center text-dark mb-6`}>
          Available Reality Shows
        </h2>
        <p className="text-xl text-center text-dark/70 mb-16 max-w-2xl mx-auto">
          Start with Big Brother and stay tuned for more shows coming soon!
        </p>
        
        <div className="max-w-2xl mx-auto">
          {/* Big Brother Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-coral/30 bg-gradient-to-br from-coral/5 to-brand-teal/5">
            <CardHeader className="text-center pb-4">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-coral to-brand-teal rounded-full flex items-center justify-center">
                <Tv className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-3xl text-dark mb-2">Big Brother</CardTitle>
              <CardDescription className="text-lg text-dark/70">
                Draft houseguests, predict evictions, and compete for the ultimate prize pool
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-white/60 p-3 rounded-lg">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-coral" />
                  <div className="font-semibold">Draft Teams</div>
                  <div className="text-dark/70">Pick 5 houseguests</div>
                </div>
                <div className="bg-white/60 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-brand-teal" />
                  <div className="font-semibold">Live Scoring</div>
                  <div className="text-dark/70">Real-time updates</div>
                </div>
                <div className="bg-white/60 p-3 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-yellow" />
                  <div className="font-semibold">Pool Play</div>
                  <div className="text-dark/70">Compete with friends</div>
                </div>
                <div className="bg-white/60 p-3 rounded-lg">
                  <MessageCircle className="h-6 w-6 mx-auto mb-2 text-orange" />
                  <div className="font-semibold">Pool Chat</div>
                  <div className="text-dark/70">Trash talk included</div>
                </div>
              </div>
              
              <Button
                onClick={handleBigBrotherLaunch}
                size="lg"
                className="w-full group-hover:scale-105 transition-transform duration-300"
                style={{ 
                  background: 'var(--gradient-teal)',
                  color: 'white'
                }}
              >
                Play Big Brother Pool
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Coming Soon Cards */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Card className="opacity-60 bg-gradient-to-br from-muted/50 to-muted/30">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-muted-foreground">Survivor</CardTitle>
                <CardDescription>Coming Soon</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="opacity-60 bg-gradient-to-br from-muted/50 to-muted/30">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-muted-foreground">The Bachelor</CardTitle>
                <CardDescription>Coming Soon</CardDescription>
              </CardHeader>
            </Card>

            <Card className="opacity-60 bg-gradient-to-br from-muted/50 to-muted/30">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-muted-foreground">Traitors</CardTitle>
                <CardDescription>Coming Soon</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="opacity-60 bg-gradient-to-br from-muted/50 to-muted/30">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-muted-foreground">The Circle</CardTitle>
                <CardDescription>Coming Soon</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};