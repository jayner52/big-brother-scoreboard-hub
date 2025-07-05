import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Trophy, Star, Target, Award } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white py-12 px-16 rounded-xl shadow-2xl mb-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <h1 className="text-6xl font-bold mb-6">
              🏠 Big Brother Fantasy Pool
            </h1>
            <p className="text-2xl text-red-100 mb-4">
              Draft your dream team and compete with friends!
            </p>
            <p className="text-lg text-red-200">
              Create private pools, draft houseguests, and see who can predict the season best
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl">1. Draft Your Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Select 5 houseguests and answer bonus questions to build your winning strategy.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-xl">2. Earn Points</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Score points when your houseguests win competitions, survive evictions, and hit milestones.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2 border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-xl">3. Win Prizes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Compete for the top spot on the leaderboard and claim your victory!</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Join Pool Card */}
          <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Join a Pool</CardTitle>
              <CardDescription className="text-gray-600">
                Enter an invite code to join an existing fantasy pool
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => navigate('/welcome')}
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
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                <h4 className="font-semibold text-green-800 mb-2">What you get:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Unique invite code to share</li>
                  <li>• Full pool management control</li>
                  <li>• Customizable settings</li>
                  <li>• Weekly scoring updates</li>
                </ul>
              </div>
              <Button 
                onClick={() => navigate('/welcome')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
              >
                Create Pool
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="text-center mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-orange-200">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Why Play?</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🎯 Strategic Fun</h4>
                <p className="text-gray-600 text-sm">Draft wisely and predict outcomes to outsmart your friends.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">👥 Social Gaming</h4>
                <p className="text-gray-600 text-sm">Create private pools with friends, family, or coworkers.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">📊 Live Tracking</h4>
                <p className="text-gray-600 text-sm">Real-time leaderboards and weekly score updates.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🏆 Compete to Win</h4>
                <p className="text-gray-600 text-sm">Optional buy-ins for prize pools or just play for bragging rights.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Already Have Account */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Already have an account?</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')}
            className="px-8 py-2"
          >
            Sign In
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-16 py-8 border-t border-orange-200">
          <p>© 2025 Big Brother Fantasy Pool | May the best picks win! 🏆</p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;