import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Users, Target, Award, Trophy, MessageCircle, Tv, Mail, Heart, Shield, Calendar, HelpCircle, Star, CheckCircle } from 'lucide-react';
import { PoolsidePicksLogo } from '@/components/brand/PoolsidePicksLogo';
import { PoolFloat } from '@/components/brand/PoolFloat';
import { useIsMobile } from '@/hooks/use-mobile';

const About = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const faqs = [
    {
      question: "How much does it cost?",
      answer: "Poolside Picks is completely free! You can create unlimited leagues, invite unlimited friends, and play all season long without any cost. If you'd like to support the platform, you can optionally contribute a small percentage of your buy-in when setting up prize pools. You can see this option in 'prize pool management' in your pool settings, but it's completely voluntary!"
    },
    {
      question: "Do I need to know anything about Big Brother to play?",
      answer: "Not at all! The platform is designed for both superfans and casual viewers. We provide explanations for all scoring events, and you can learn as you go."
    },
    {
      question: "Can I create private leagues with my friends?",
      answer: "Yes! Every league gets a unique invite code that you can share with friends. Only people with your code can join your league."
    },
    {
      question: "How does scoring work?",
      answer: "You earn points when your drafted houseguests perform well in competitions, survive evictions, or achieve other milestones. You can customize point values for 25+ different events."
    },
    {
      question: "Can I change my team after the draft?",
      answer: "That depends on your league settings! League creators can enable trades, allow certain substitutions, or lock teams after the draft - it's completely customizable."
    },
    {
      question: "What devices can I use?",
      answer: "Poolside Picks works on any device with a web browser - phones, tablets, computers. It's fully responsive and even works offline as a PWA."
    }
  ];

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
          <PoolsidePicksLogo size="xxl" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={`${isMobile ? 'text-4xl' : 'text-6xl'} font-bold text-dark mb-6`}>
            How It Works
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} text-brand-teal font-bold mb-8`}>
              The Smartest Way to Watch Dumb TV 📺
            </p>
            
            <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 mb-8 leading-relaxed`}>
              Poolside Picks is a <strong>completely free</strong> fantasy league platform built for Big Brother fans and reality TV obsessives. 
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
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-coral" />
                <span className="text-dark">Private leagues with your friends only</span>
              </div>
            </div>

            <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 leading-relaxed`}>
              Whether you're a spreadsheet legend or a casual viewer, it's the easiest way to turn your summer 
              Big Brother obsession into something competitive, fun, and (yes) slightly chaotic.
            </p>
            
            <p className={`${isMobile ? 'text-xl' : 'text-2xl'} text-brand-teal font-bold mt-8`}>
              Create your league, draft your team, and let the drama begin. 🎭
            </p>
          </div>
        </div>

        {/* Creator Story Section */}
        <div className="mb-16">
          <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-brand-teal/20">
            <CardHeader className="text-center">
              <CardTitle className={`${isMobile ? 'text-2xl' : 'text-3xl'} text-dark flex items-center justify-center gap-3`}>
                <Heart className="h-8 w-8 text-coral" />
                Built by a Reality TV Fan
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 mb-6 leading-relaxed`}>
                Hi! I'm a lifelong Big Brother superfan who got tired of managing fantasy leagues in messy spreadsheets. 
                After years of manually tracking points and sending weekly updates to my friends, I decided to build 
                something better.
              </p>
              <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 mb-6 leading-relaxed`}>
                Poolside Picks started as a personal project to make fantasy Big Brother leagues more fun and less work. 
                Now it's a full platform that can handle everything from casual family pools to serious competition leagues.
              </p>
              <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-brand-teal font-semibold`}>
                Made with ❤️ for the reality TV community
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Season Information */}
        <div className="mb-16">
          <h2 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-center text-dark mb-8`}>
            <Calendar className="inline mr-3 h-8 w-8 text-brand-teal" />
            Current Season Support
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-xl text-brand-teal">Big Brother 27 (2025)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dark/70">
                  Full support for the current season with real contestant data, live scoring updates, 
                  and all the latest twists and competitions.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-xl text-coral">Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dark/70">
                  Support for Celebrity Big Brother, The Challenge, Survivor, and other reality competition shows. 
                  Vote on which shows you want to see next!
                </p>
              </CardContent>
            </Card>
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
                  <Users className="h-8 w-8 text-white" />
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
                  <HelpCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Step 4: Answer Bonus Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dark/70">
                  Make predictions about the season and earn bonus points for correct guesses. Answer questions like "Who will win Veto?" 
                  or "Will anyone get in a showmance?" and see your points stack up.
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

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-center text-dark mb-8`}>
            <HelpCircle className="inline mr-3 h-8 w-8 text-brand-teal" />
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-brand-teal flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-coral mt-0.5 flex-shrink-0" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-dark/80 leading-relaxed pl-9">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact & Support Section */}
        <div className="mb-16">
          <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-brand-teal/20">
            <CardHeader className="text-center">
              <CardTitle className={`${isMobile ? 'text-2xl' : 'text-3xl'} text-dark flex items-center justify-center gap-3`}>
                <Mail className="h-8 w-8 text-brand-teal" />
                Need Help or Have Feedback?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 mb-6 leading-relaxed`}>
                Got questions? Found a bug? Have an idea for a new feature? I'd love to hear from you!
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <h4 className="font-semibold text-brand-teal mb-2">For Support & Questions</h4>
                  <p className="text-dark/70">Use the feedback form in the app or reach out through our community channels.</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-coral mb-2">Feature Requests</h4>
                  <p className="text-dark/70">Your ideas help shape the future of Poolside Picks! Let us know what you'd like to see.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy & Data Brief */}
        <div className="mb-16">
          <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className={`${isMobile ? 'text-2xl' : 'text-3xl'} text-dark flex items-center justify-center gap-3`}>
                <Shield className="h-8 w-8 text-brand-teal" />
                Your Privacy Matters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 text-center">
                <div>
                  <h4 className="font-semibold text-brand-teal mb-2">What We Collect</h4>
                  <p className="text-dark/70 text-sm">Only what's needed: email for account creation, your league data, and basic usage analytics to improve the platform.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-coral mb-2">What We Don't Do</h4>
                  <p className="text-dark/70 text-sm">We don't sell your data, send spam emails, or share your info with advertisers. Your leagues are private to you and your friends.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials Section */}
        <div className="mb-16">
          <h2 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-center text-dark mb-8`}>
            <Star className="inline mr-3 h-8 w-8 text-yellow" />
            What Players Are Saying
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="text-center bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <p className="text-dark/80 italic mb-4">"Finally, a fantasy platform that actually gets Big Brother! The customization options are incredible."</p>
                <p className="text-brand-teal font-semibold">- Sarah M.</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <p className="text-dark/80 italic mb-4">"Our friend group has been using this all season. It's made watching so much more fun and competitive!"</p>
                <p className="text-coral font-semibold">- Mike R.</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <p className="text-dark/80 italic mb-4">"Super easy to set up and manage. Love that it's completely free with no ads or catches."</p>
                <p className="text-brand-teal font-semibold">- Jessica L.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mb-16">
          <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-dark mb-6`}>
                Ready to Transform Your Big Brother Experience?
              </h3>
              <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-dark/80 mb-8 leading-relaxed`}>
                Join thousands of reality TV fans who have already discovered the most fun way to watch Big Brother. 
                Create your first league in under 2 minutes - completely free, no credit card required.
              </p>
              
              <div className={`flex ${isMobile ? 'flex-col gap-4' : 'gap-6 justify-center'}`}>
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
                  Start Playing Free
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;