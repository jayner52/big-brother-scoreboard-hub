import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Users, Plus, Trophy } from 'lucide-react';
import { usePool } from '@/contexts/PoolContext';
import { useToast } from '@/hooks/use-toast';

const Welcome = () => {
  const navigate = useNavigate();
  const { joinPoolByCode, createPool } = usePool();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinPool = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invite code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await joinPoolByCode(inviteCode.trim().toUpperCase());
      
      if (result.success) {
        toast({
          title: "Success!",
          description: `Joined pool successfully`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to join pool",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join pool",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePool = async () => {
    setLoading(true);
    try {
      const pool = await createPool({
        name: "My Big Brother Pool",
        description: "A new fantasy pool for Big Brother fans",
        is_public: false,
        has_buy_in: true,
        entry_fee_amount: 25,
        entry_fee_currency: "CAD",
        payment_method_1: "E-transfer",
        payment_details_1: "email@example.com",
        draft_open: true,
        enable_bonus_questions: true,
        picks_per_team: 5,
      });

      if (pool) {
        toast({
          title: "Success!",
          description: "Pool created successfully",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: "Failed to create pool",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create pool",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white py-8 px-12 rounded-xl shadow-2xl mb-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <h1 className="text-5xl font-bold mb-4">
              🏠 Big Brother Fantasy Pool
            </h1>
            <p className="text-xl text-red-100">
              Draft your dream team and compete with friends!
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Join Pool Card */}
          <Card className="border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Join a Pool</CardTitle>
              <CardDescription className="text-gray-600">
                Enter an invite code to join an existing fantasy pool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-code">Invite Code</Label>
                <Input
                  id="invite-code"
                  placeholder="Enter 8-character code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="text-center text-lg font-mono tracking-wider"
                />
              </div>
              <Button 
                onClick={handleJoinPool}
                disabled={loading || !inviteCode.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              >
                {loading ? 'Joining...' : 'Join Pool'}
              </Button>
            </CardContent>
          </Card>

          {/* Create Pool Card */}
          <Card className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Create New Pool</CardTitle>
              <CardDescription className="text-gray-600">
                Start your own fantasy pool and invite friends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">What you get:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Unique invite code to share</li>
                  <li>• Full pool management control</li>
                  <li>• Customizable settings</li>
                  <li>• Weekly scoring updates</li>
                </ul>
              </div>
              <Button 
                onClick={handleCreatePool}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
              >
                {loading ? 'Creating...' : 'Create Pool'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-orange-200">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">1. Draft Your Team</h4>
                <p className="text-gray-600 text-sm">Select 5 houseguests and answer bonus questions to build your winning strategy.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">2. Earn Points</h4>
                <p className="text-gray-600 text-sm">Score points when your players win competitions, survive evictions, and hit milestones.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">3. Win Prizes</h4>
                <p className="text-gray-600 text-sm">Compete for the top spot on the leaderboard and claim your victory!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-16 py-8 border-t border-orange-200">
          <p>© 2025 Big Brother Fantasy Pool | May the best picks win! 🏆</p>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;