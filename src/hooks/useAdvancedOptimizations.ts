import { useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Advanced real-time optimization hooks
 */

/**
 * Intelligent subscription batching to reduce server load
 */
export const useBatchedSubscriptions = <T>(
  subscriptions: Array<() => Promise<T>>,
  batchSize: number = 3,
  delay: number = 100
) => {
  const batchRef = useRef<Array<() => Promise<T>>>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const resultsRef = useRef<T[]>([]);

  const processBatch = useCallback(async () => {
    const currentBatch = batchRef.current.splice(0, batchSize);
    
    if (currentBatch.length > 0) {
      try {
        const results = await Promise.allSettled(
          currentBatch.map(fn => fn())
        );
        
        const successfulResults = results
          .filter((result): result is PromiseFulfilledResult<Awaited<T>> => result.status === 'fulfilled')
          .map(result => result.value);
          
        resultsRef.current = [...resultsRef.current, ...successfulResults];
      } catch (error) {
        console.error('Batch subscription error:', error);
      }
    }

    if (batchRef.current.length > 0) {
      timeoutRef.current = setTimeout(processBatch, delay);
    }
  }, [batchSize, delay]);

  const addToBatch = useCallback((subscription: () => Promise<T>) => {
    batchRef.current.push(subscription);
    
    if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(processBatch, delay);
    }
  }, [processBatch, delay]);

  useEffect(() => {
    subscriptions.forEach(addToBatch);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [subscriptions, addToBatch]);

  return {
    results: resultsRef.current,
    addToBatch
  };
};

/**
 * Smart data prefetching based on user behavior
 */
export const useSmartPrefetch = (
  prefetchTargets: Record<string, () => Promise<any>>,
  userInteractions: string[] = []
) => {
  const prefetchedRef = useRef<Set<string>>(new Set());
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const predictNextAction = useCallback((interactions: string[]) => {
    // Simple prediction based on common patterns
    const patterns = {
      dashboard: ['leaderboard', 'picks'],
      leaderboard: ['picks', 'contestants'],
      picks: ['contestants', 'results'],
      contestants: ['bios', 'results'],
      draft: ['contestants', 'leaderboard']
    };

    const lastInteraction = interactions[interactions.length - 1];
    return patterns[lastInteraction as keyof typeof patterns] || [];
  }, []);

  const prefetchData = useCallback(async (keys: string[]) => {
    const newPrefetches = keys.filter(key => 
      !prefetchedRef.current.has(key) && prefetchTargets[key]
    );

    if (newPrefetches.length > 0) {
      console.log('🔮 Smart prefetch:', newPrefetches);
      
      await Promise.allSettled(
        newPrefetches.map(async key => {
          try {
            await prefetchTargets[key]();
            prefetchedRef.current.add(key);
          } catch (error) {
            console.warn(`Prefetch failed for ${key}:`, error);
          }
        })
      );
    }
  }, [prefetchTargets]);

  const onHoverStart = useCallback((targetKey: string) => {
    hoverTimeoutRef.current = setTimeout(() => {
      prefetchData([targetKey]);
    }, 300); // Prefetch after 300ms hover
  }, [prefetchData]);

  const onHoverEnd = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  }, []);

  // Auto-prefetch based on user behavior
  useEffect(() => {
    const predicted = predictNextAction(userInteractions);
    if (predicted.length > 0) {
      // Delay auto-prefetch to avoid interfering with current action
      setTimeout(() => prefetchData(predicted), 1000);
    }
  }, [userInteractions, predictNextAction, prefetchData]);

  return {
    onHoverStart,
    onHoverEnd,
    prefetchData,
    prefetchedKeys: Array.from(prefetchedRef.current)
  };
};

/**
 * Connection quality aware subscription management
 */
export const useAdaptiveSubscriptions = () => {
  const connectionQuality = useRef<'slow' | 'fast'>('fast');
  const subscriptionIntervals = useRef<Map<string, number>>(new Map());

  const detectConnectionQuality = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType || '4g';
      
      connectionQuality.current = ['slow-2g', '2g', '3g'].includes(effectiveType) ? 'slow' : 'fast';
      
      // Adjust intervals based on connection quality
      const intervals = connectionQuality.current === 'slow' 
        ? { realtime: 5000, polling: 10000, sync: 30000 }
        : { realtime: 1000, polling: 3000, sync: 10000 };
        
      Object.entries(intervals).forEach(([key, interval]) => {
        subscriptionIntervals.current.set(key, interval);
      });
      
      console.log(`🌐 Connection quality: ${connectionQuality.current}`, intervals);
    }
  }, []);

  useEffect(() => {
    detectConnectionQuality();
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', detectConnectionQuality);
      
      return () => {
        connection?.removeEventListener('change', detectConnectionQuality);
      };
    }
  }, [detectConnectionQuality]);

  const getInterval = useCallback((type: string): number => {
    return subscriptionIntervals.current.get(type) || 3000;
  }, []);

  return {
    connectionQuality: connectionQuality.current,
    getInterval,
    isSlowConnection: connectionQuality.current === 'slow'
  };
};

/**
 * Memory-efficient data pagination
 */
export const useVirtualPagination = <T>(
  data: T[],
  pageSize: number = 20,
  virtualSize: number = 100
) => {
  const currentPageRef = useRef(0);
  const cacheRef = useRef<Map<number, T[]>>(new Map());

  const getPage = useCallback((pageIndex: number): T[] => {
    if (cacheRef.current.has(pageIndex)) {
      return cacheRef.current.get(pageIndex)!;
    }

    const start = pageIndex * pageSize;
    const end = start + pageSize;
    const pageData = data.slice(start, end);
    
    // Cache with size limit
    if (cacheRef.current.size >= virtualSize / pageSize) {
      const oldestKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(oldestKey);
    }
    
    cacheRef.current.set(pageIndex, pageData);
    return pageData;
  }, [data, pageSize, virtualSize]);

  const totalPages = Math.ceil(data.length / pageSize);
  
  return {
    getPage,
    totalPages,
    currentPage: currentPageRef.current,
    setCurrentPage: (page: number) => {
      currentPageRef.current = Math.max(0, Math.min(page, totalPages - 1));
    },
    cacheSize: cacheRef.current.size
  };
};