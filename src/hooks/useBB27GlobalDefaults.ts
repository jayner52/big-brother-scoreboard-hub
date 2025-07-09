import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { populateSeason27GlobalDefaults } from '@/data/season27Houseguests';

export const useBB27GlobalDefaults = () => {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeBB27Defaults();
  }, []);

  const initializeBB27Defaults = async () => {
    if (isInitialized || isInitializing) return;
    
    setIsInitializing(true);
    console.log('🌍 Initializing BB27 global defaults...');
    
    try {
      const result = await populateSeason27GlobalDefaults();
      
      if (result.success) {
        if (result.count > 0) {
          console.log('🌍 BB27: Created', result.count, 'global default contestants');
          toast({
            title: "Season 27 Ready",
            description: `Big Brother 27 global defaults initialized with ${result.count} contestants`,
          });
        } else {
          console.log('🌍 BB27: Global defaults already exist');
        }
        setIsInitialized(true);
      } else {
        console.error('🌍 BB27: Failed to initialize global defaults:', result.error);
        toast({
          title: "Initialization Warning",
          description: "BB27 global defaults may not be available. Manual setup may be required.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('🌍 BB27: Error during initialization:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize BB27 defaults. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return {
    isInitializing,
    isInitialized,
    initializeBB27Defaults
  };
};