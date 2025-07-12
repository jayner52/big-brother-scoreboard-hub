import { useMemo, useCallback } from 'react';

/**
 * Optimize useEffect dependencies by providing stable references
 */
export const useStableDependencies = <T extends Record<string, any>>(deps: T): T => {
  return useMemo(() => deps, [JSON.stringify(deps)]);
};

/**
 * Memoize callbacks to prevent unnecessary re-renders
 */
export const useStableCallback = <T extends (...args: any[]) => any>(callback: T): T => {
  return useCallback(callback, []);
};

/**
 * Optimize object/array comparisons for useEffect dependencies
 */
export const useDeepMemo = <T>(value: T, deps: any[]): T => {
  return useMemo(() => value, deps);
};

/**
 * Reduce database query frequency
 */
export const useQueryThrottle = (queryFn: () => void, delay: number = 1000) => {
  const throttledQuery = useCallback(() => {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(queryFn, delay);
    };
  }, [queryFn, delay]);

  return throttledQuery();
};