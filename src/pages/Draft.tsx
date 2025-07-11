import React from 'react';
import { PoolProvider } from '@/contexts/PoolContext';
import { TeamDraftFormFixed } from '@/components/TeamDraftFormFixed';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Draft = () => {
  const navigate = useNavigate();

  return (
    <PoolProvider>
      <DraftContent navigate={navigate} />
    </PoolProvider>
  );
};

const DraftContent = ({ navigate }: { navigate: any }) => {
  return (
    <div className="min-h-screen bg-pale-yellow">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* TeamDraftFormFixed handles all locking internally */}
        <TeamDraftFormFixed />

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-16 py-8 border-t">
          <p>© 2025 Big Brother Fantasy Pool | May the best picks win! 🏆</p>
        </footer>
      </div>
    </div>
  );
};

export default Draft;