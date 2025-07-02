
import React, { useState } from 'react';
import { PoolProvider } from '@/contexts/PoolContext';
import { TeamDraftForm } from '@/components/TeamDraftForm';
import { TeamLeaderboard } from '@/components/TeamLeaderboard';
import { EveryonesPicks } from '@/components/EveryonesPicks';
import { LiveResults } from '@/components/LiveResults';
import { HouseguestValues } from '@/components/HouseguestValues';
import { ContestantBios } from '@/components/ContestantBios';
import { PrizePoolDisplay } from '@/components/PrizePoolDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, BookOpen } from 'lucide-react';

const Index = () => {
  return (
    <PoolProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-between items-start mb-4">
              <Link to="/auth">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  Login / Sign Up
                </Button>
              </Link>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Big Brother Fantasy Pool
              </h1>
              <Link to="/admin">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Draft your favorite houseguests and compete with friends as the drama unfolds in the Big Brother house!
            </p>
          </div>

          {/* How to Play Card */}
          <div className="text-center mb-8">
            <Link to="/about">
              <div className="inline-block p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <BookOpen className="w-8 h-8" />
                  <h3 className="text-xl font-bold">How to Play & Rules</h3>
                </div>
                <p className="text-purple-100">
                  Learn the scoring system, draft rules, and how to win the pool!
                </p>
              </div>
            </Link>
          </div>

          {/* Tabbed Interface */}
          <Tabs defaultValue="draft" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="draft">Draft Team</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="picks">Everyone's Picks</TabsTrigger>
              <TabsTrigger value="results">Live Results</TabsTrigger>
              <TabsTrigger value="contestants">Houseguest Values</TabsTrigger>
              <TabsTrigger value="bios">Houseguest Bios</TabsTrigger>
            </TabsList>

            <TabsContent value="draft">
              <TeamDraftForm />
            </TabsContent>

            <TabsContent value="leaderboard">
              <TeamLeaderboard />
            </TabsContent>

            <TabsContent value="picks">
              <EveryonesPicks />
            </TabsContent>

            <TabsContent value="results">
              <LiveResults />
            </TabsContent>

            <TabsContent value="contestants">
              <HouseguestValues />
            </TabsContent>

            <TabsContent value="bios">
              <ContestantBios />
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <footer className="text-center text-gray-500 text-sm mt-16 py-8 border-t">
            <p>© 2025 Big Brother Fantasy Pool | May the best picks win! 🏆</p>
          </footer>
        </div>
      </div>
    </PoolProvider>
  );
};

export default Index;
