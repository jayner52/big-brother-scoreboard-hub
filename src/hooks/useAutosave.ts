import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export const useAutosave = <T>({
  data,
  onSave,
  delay = 2000,
  enabled = true
}: AutosaveOptions<T>) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);
  const { toast } = useToast();

  const save = useCallback(async (dataToSave: T) => {
    if (isSavingRef.current) return;
    
    try {
      isSavingRef.current = true;
      await onSave(dataToSave);
      lastSavedRef.current = JSON.stringify(dataToSave);
    } catch (error) {
      console.error('Autosave failed:', error);
      toast({
        title: "Autosave Failed",
        description: "Your changes could not be automatically saved. Please save manually.",
        variant: "destructive"
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, toast]);

  useEffect(() => {
    if (!enabled || !data) return;

    const currentDataString = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (currentDataString === lastSavedRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  return {
    isSaving: isSavingRef.current,
    forceSave: () => save(data)
  };
};