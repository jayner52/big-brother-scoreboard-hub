import { useEffect, useRef, useCallback } from 'react';

/**
 * Optimize real-time subscriptions to prevent excessive re-connections
 */
export const useOptimizedRealtime = (
  subscriptionFn: () => any,
  dependencies: any[] = [],
  options: { debounceMs?: number; maxRetries?: number } = {}
) => {
  const { debounceMs = 1000, maxRetries = 3 } = options;
  const subscriptionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);

  const createSubscription = useCallback(() => {
    // Clear existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe?.();
      subscriptionRef.current = null;
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce subscription creation
    timeoutRef.current = setTimeout(() => {
      try {
        subscriptionRef.current = subscriptionFn();
        retryCountRef.current = 0; // Reset retry count on success
      } catch (error) {
        console.error('Real-time subscription error:', error);
        
        // Retry with exponential backoff
        if (retryCountRef.current < maxRetries) {
          const retryDelay = Math.pow(2, retryCountRef.current) * 1000;
          retryCountRef.current++;
          
          setTimeout(() => {
            createSubscription();
          }, retryDelay);
        }
      }
    }, debounceMs);
  }, dependencies);

  useEffect(() => {
    createSubscription();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe?.();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependencies);

  return subscriptionRef.current;
};

/**
 * Reduce real-time update frequency for heavy components
 */
export const useThrottledRealtime = (
  subscriptionFn: () => any,
  dependencies: any[] = [],
  throttleMs: number = 2000
) => {
  const lastUpdateRef = useRef(Date.now());

  const throttledSubscriptionFn = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current >= throttleMs) {
      lastUpdateRef.current = now;
      return subscriptionFn();
    }
    return null;
  }, [subscriptionFn, throttleMs]);

  return useOptimizedRealtime(throttledSubscriptionFn, dependencies, {
    debounceMs: throttleMs / 2
  });
};