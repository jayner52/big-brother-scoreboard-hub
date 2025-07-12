/**
 * Service Worker Registration and Management
 */

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * Register service worker with proper lifecycle management
 */
export const registerServiceWorker = async (config: ServiceWorkerConfig = {}) => {
  if ('serviceWorker' in navigator && 'caches' in window) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available
              config.onUpdate?.(registration);
            }
          });
        }
      });

      // Handle successful registration
      if (registration.active) {
        config.onSuccess?.(registration);
      }

      console.log('✅ Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      config.onError?.(error as Error);
      throw error;
    }
  } else {
    throw new Error('Service Worker not supported');
  }
};

/**
 * Background sync for offline functionality
 */
export const backgroundSync = {
  /**
   * Queue draft submission for background sync
   */
  queueDraftSubmission: async (draftData: any) => {
    if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
      try {
        // Store in IndexedDB for later sync
        await storePendingDraft(draftData);
        
        // Register background sync
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('draft-submission');
        
        console.log('✅ Draft queued for background sync');
      } catch (error) {
        console.error('❌ Background sync failed:', error);
        throw error;
      }
    }
  },

  /**
   * Queue pool data sync
   */
  queuePoolDataSync: async () => {
    if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('pool-data-sync');
        
        console.log('✅ Pool data sync queued');
      } catch (error) {
        console.error('❌ Pool data sync failed:', error);
      }
    }
  }
};

/**
 * Cache management utilities
 */
export const cacheManager = {
  /**
   * Clear all application caches
   */
  clearAll: async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      console.log('✅ All caches cleared');
    }
  },

  /**
   * Get cache size information
   */
  getSize: async () => {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage,
        available: estimate.quota,
        percentage: estimate.usage && estimate.quota ? 
          Math.round((estimate.usage / estimate.quota) * 100) : 0
      };
    }
    return null;
  },

  /**
   * Preload critical resources
   */
  preloadCritical: async (urls: string[]) => {
    if ('caches' in window) {
      const cache = await caches.open('poolside-critical-v1');
      await cache.addAll(urls);
      console.log('✅ Critical resources preloaded');
    }
  }
};

/**
 * Offline detection and handling
 */
export const offlineManager = {
  isOnline: () => navigator.onLine,
  
  onOffline: (callback: () => void) => {
    window.addEventListener('offline', callback);
    return () => window.removeEventListener('offline', callback);
  },
  
  onOnline: (callback: () => void) => {
    window.addEventListener('online', callback);
    return () => window.removeEventListener('online', callback);
  },

  showOfflineNotification: () => {
    // Create offline notification
    const notification = document.createElement('div');
    notification.id = 'offline-notification';
    notification.innerHTML = `
      <div style="
        position: fixed; 
        top: 0; 
        left: 0; 
        right: 0; 
        background: #f59e0b; 
        color: white; 
        padding: 8px; 
        text-align: center; 
        z-index: 9999;
        font-size: 14px;
      ">
        📡 You're offline. Some features may be limited.
      </div>
    `;
    document.body.prepend(notification);
  },

  hideOfflineNotification: () => {
    const notification = document.getElementById('offline-notification');
    if (notification) {
      notification.remove();
    }
  }
};

/**
 * IndexedDB helpers for offline storage
 */
const storePendingDraft = async (draftData: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('poolside-offline', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');
      
      const addRequest = store.add({
        ...draftData,
        timestamp: Date.now()
      });
      
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };
  });
};