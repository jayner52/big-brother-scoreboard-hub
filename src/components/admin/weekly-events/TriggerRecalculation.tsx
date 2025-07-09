import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useAutoPointsRecalculation } from '@/hooks/useAutoPointsRecalculation';

export const TriggerRecalculation: React.FC = () => {
  const { triggerRecalculation } = useAutoPointsRecalculation();
  const [isRecalculating, setIsRecalculating] = React.useState(false);

  const handleRecalculation = async () => {
    setIsRecalculating(true);
    try {
      await triggerRecalculation('Manual trigger - Weekly events scoring rules updated');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Auto-trigger recalculation on component mount (when scoring rules are updated)
  React.useEffect(() => {
    const autoTrigger = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
      await triggerRecalculation('Automatic - Weekly events scoring rules updated');
    };
    
    autoTrigger();
  }, [triggerRecalculation]);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-blue-800">Points Recalculation</h3>
          <p className="text-xs text-blue-600 mt-1">
            Scoring rules have been updated. Points will be recalculated automatically.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRecalculation}
          disabled={isRecalculating}
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRecalculating ? 'animate-spin' : ''}`} />
          {isRecalculating ? 'Recalculating...' : 'Manual Recalc'}
        </Button>
      </div>
    </div>
  );
};