
import React from 'react';
import { PoolProvider } from '@/contexts/PoolContext';
import { PoolEntryForm } from '@/components/PoolEntryForm';
import { PoolTable } from '@/components/PoolTable';
import { ScoringPanel } from '@/components/ScoringPanel';

const Index = () => {
  return (
    <PoolProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Big Brother Fantasy Pool
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Draft your favorite houseguests and compete with friends as the drama unfolds in the Big Brother house!
            </p>
          </div>

          {/* Pool Entry Form */}
          <div className="mb-12">
            <PoolEntryForm />
          </div>

          {/* Scoring Panel */}
          <div className="mb-12">
            <ScoringPanel />
          </div>

          {/* Pool Table */}
          <div className="mb-8">
            <PoolTable />
          </div>

          {/* Footer */}
          <footer className="text-center text-gray-500 text-sm mt-16 py-8 border-t">
            <p>© 2024 Big Brother Fantasy Pool | May the best picks win! 🏆</p>
          </footer>
        </div>
      </div>
    </PoolProvider>
  );
};

export default Index;
