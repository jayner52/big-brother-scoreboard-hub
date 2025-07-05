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
          <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white py-12 px-16 rounded-xl shadow-2xl mb-8">
            <div className="flex items-center justify-center mb-6">
              <Trophy className="h-16 w-16 text-white mr-4" />
              <h1 className="text-6xl font-bold">
                Big Brother Fantasy Pool
              </h1>
            </div>
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

        {/* Get Started Section */}
        <div className="text-center mb-16">
          <div className="max-w-2xl mx-auto">
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:from-red-700 hover:via-orange-600 hover:to-yellow-600 text-white px-12 py-4 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-6"
            >
              Get Started - Join the Fun!
            </Button>
            
            {/* Pool Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto mb-6">
            <Button 
              onClick={() => navigate('/auth?action=create-pool')}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Pool
            </Button>
            <Button 
              onClick={() => navigate('/auth?action=join-pool')}
              variant="outline"
              className="py-3 px-6 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2"
            >
              <Users className="h-5 w-5 mr-2" />
              Join Pool
            </Button>
            </div>
            
            <p className="text-gray-600 text-lg">
              Create your account and start competing in minutes
            </p>
          </div>
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
            className="px-8 py-3 text-lg font-semibold border-2 hover:bg-gray-50"
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