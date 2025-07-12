/**
 * Bundle Analysis Utility
 * Helps identify and optimize bundle size issues
 */

export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return;

  const analyzeImports = () => {
    // Analyze dynamic imports
    const dynamicImports = Array.from(document.querySelectorAll('script[src]'))
      .map(script => ({
        src: script.getAttribute('src'),
        size: 'unknown'
      }));

    console.group('📦 Bundle Analysis');
    console.log('Dynamic imports detected:', dynamicImports.length);
    console.table(dynamicImports);
    console.groupEnd();
  };

  const analyzePerformance = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      console.group('⚡ Performance Metrics');
      console.log('DOM Content Loaded:', `${Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)}ms`);
      console.log('Load Complete:', `${Math.round(navigation.loadEventEnd - navigation.loadEventStart)}ms`);
      console.log('Resource Count:', resources.length);
      
      // Largest resources
      const largestResources = resources
        .filter(r => r.transferSize && r.transferSize > 0)
        .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
        .slice(0, 10)
        .map(r => ({
          name: r.name.split('/').pop(),
          size: `${Math.round((r.transferSize || 0) / 1024)}KB`,
          duration: `${Math.round(r.duration)}ms`
        }));
      
      console.table(largestResources);
      console.groupEnd();
    }
  };

  const analyzeMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.group('🧠 Memory Usage');
      console.log('Used:', `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`);
      console.log('Total:', `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`);
      console.log('Limit:', `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`);
      console.groupEnd();
    }
  };

  // Run analysis after page load
  if (document.readyState === 'complete') {
    analyzeImports();
    analyzePerformance();
    analyzeMemoryUsage();
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        analyzeImports();
        analyzePerformance();
        analyzeMemoryUsage();
      }, 1000);
    });
  }
};

/**
 * Tree shaking optimization helpers
 */
export const optimizeImports = {
  // Example of proper tree shaking for lucide icons
  getOptimizedIcon: (iconName: string) => {
    switch (iconName) {
      case 'users': return import('lucide-react/dist/esm/icons/users');
      case 'trophy': return import('lucide-react/dist/esm/icons/trophy');
      case 'eye': return import('lucide-react/dist/esm/icons/eye');
      case 'bar-chart-2': return import('lucide-react/dist/esm/icons/bar-chart-2');
      case 'user': return import('lucide-react/dist/esm/icons/user');
      case 'clipboard-list': return import('lucide-react/dist/esm/icons/clipboard-list');
      default: return import('lucide-react/dist/esm/icons/help-circle');
    }
  },

  // Optimize utility imports
  getOptimizedUtil: (utilName: string) => {
    switch (utilName) {
      case 'cn': return import('@/lib/utils').then(m => m.cn);
      case 'format': return import('date-fns/format');
      case 'isValid': return import('date-fns/isValid');
      default: return Promise.resolve(() => {});
    }
  }
};

/**
 * Performance monitoring
 */
export const performanceMonitor = {
  startMeasure: (name: string) => {
    performance.mark(`${name}-start`);
  },

  endMeasure: (name: string) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    if (measure.duration > 100) {
      console.warn(`⚠️ Slow operation detected: ${name} took ${Math.round(measure.duration)}ms`);
    }
  },

  clearMeasures: () => {
    performance.clearMarks();
    performance.clearMeasures();
  }
};