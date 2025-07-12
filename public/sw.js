/**
 * Advanced Service Worker for Poolside Picks
 * Implements offline support, caching strategies, and background sync
 */

const CACHE_NAME = 'poolside-picks-v3';
const API_CACHE_NAME = 'poolside-api-v3';
const STATIC_CACHE_NAME = 'poolside-static-v3';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first', 
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// URLs to cache
const STATIC_URLS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/favicon.ico'
];

const API_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/rest\/v1\//,
  /^https:\/\/.*\.supabase\.co\/auth\/v1\//
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => !name.includes('v3'))
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (API_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle navigation requests with stale-while-revalidate
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
});

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Network first for real-time data
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache if network fails
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Add offline indicator to cached responses
      const response = cachedResponse.clone();
      response.headers.set('X-From-Cache', 'true');
      return response;
    }
    
    // Return offline response for failed requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Unable to fetch data. Check your connection.' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // Cache first for static assets
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return fallback for failed static requests
    return new Response('Resource not available offline', { status: 503 });
  }
}

async function handleNavigationRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    return cache.match('/');
  }
}

// Background Sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'draft-submission') {
    event.waitUntil(processPendingDrafts());
  }
  
  if (event.tag === 'pool-data-sync') {
    event.waitUntil(syncPoolData());
  }
});

async function processPendingDrafts() {
  // Get pending drafts from IndexedDB
  const pendingDrafts = await getPendingDrafts();
  
  for (const draft of pendingDrafts) {
    try {
      await fetch('/api/submit-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      });
      
      // Remove from pending queue
      await removePendingDraft(draft.id);
    } catch (error) {
      console.error('Failed to sync draft:', error);
    }
  }
}

async function syncPoolData() {
  // Sync any pending pool updates
  console.log('Background sync: Updating pool data');
}

// IndexedDB helpers for offline storage
async function getPendingDrafts() {
  return new Promise((resolve) => {
    const request = indexedDB.open('poolside-offline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['drafts'], 'readonly');
      const store = transaction.objectStore('drafts');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
    };
  });
}

async function removePendingDraft(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('poolside-offline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');
      store.delete(id);
      
      transaction.oncomplete = () => {
        resolve();
      };
    };
  });
}