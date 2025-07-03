import React from 'react';
import { PoolProvider } from '@/contexts/PoolContext';
import { DraftWizard } from '@/components/draft/DraftWizard';
import { EnhancedDraftSummaryBanner } from '@/components/draft/EnhancedDraftSummaryBanner';
import { LiveDraftSummary } from '@/components/draft/LiveDraftSummary';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePoolData } from '@/hooks/usePoolData';
import { useDraftForm } from '@/hooks/useDraftForm';

const Draft = () => {
  const navigate = useNavigate();

  return (
    <PoolProvider>
      <DraftContent navigate={navigate} />
    </PoolProvider>
  );
};

const DraftContent = ({ navigate }: { navigate: any }) => {
  const { poolSettings, loading } = usePoolData();
  const { formData, updateFormData } = useDraftForm();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
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

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white py-6 px-8 rounded-lg shadow-lg mb-6">
            <h1 className="text-4xl font-bold mb-2">
              🏠 Draft Your Team
            </h1>
            <p className="text-lg text-red-100">
              Select your 5 houseguests and answer bonus questions to build your winning team!
            </p>
          </div>
          
        {/* Enhanced Summary Banner */}
        {poolSettings && <EnhancedDraftSummaryBanner poolSettings={poolSettings} />}
      </div>

      {/* Live Draft Summary - built from scratch */}
      <LiveDraftSummary 
        formData={formData} 
        onPaymentUpdate={(confirmed) => updateFormData({ payment_confirmed: confirmed })}
      />

        {/* Draft Wizard */}
        <DraftWizard />

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-16 py-8 border-t">
          <p>© 2025 Big Brother Fantasy Pool | May the best picks win! 🏆</p>
        </footer>
      </div>
    </div>
  );
};

export default Draft;