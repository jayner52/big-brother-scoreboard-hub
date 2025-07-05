import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Trophy } from 'lucide-react';
import { PoolCreateModal } from '@/components/pools/PoolCreateModal';
import { PoolJoinModal } from '@/components/pools/PoolJoinModal';

const Welcome = () => {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handlePoolSuccess = () => {
    setShowJoinModal(false);
    setShowCreateModal(false);
    navigate('/dashboard');
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
                <p className="text-sm text-gray-600">
                  Enter the invite code you received to join an existing pool.
                </p>
              </div>
              <Button 
                onClick={() => setShowJoinModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              >
                Join Pool
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
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
              >
                Create Pool
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

        {/* Modals */}
        <PoolJoinModal 
          open={showJoinModal} 
          onOpenChange={setShowJoinModal}
          onSuccess={handlePoolSuccess}
        />
        <PoolCreateModal 
          open={showCreateModal} 
          onOpenChange={setShowCreateModal}
          onSuccess={handlePoolSuccess}
        />
      </div>
    </div>
  );
};

export default Welcome;