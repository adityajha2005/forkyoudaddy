// ForkYouDaddy Service Worker
const CACHE_VERSION = 'v2'; // Increment this to force cache refresh
const CACHE_NAME = `forkyoudaddy-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        // Cache files individually to handle failures gracefully
        return Promise.allSettled(
          STATIC_FILES.map(file => cache.add(file))
        );
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker install failed:', error);
        // Continue installation even if caching fails
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete all old caches to force refresh
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        // Force refresh all clients
        return self.clients.claim().then(() => {
          return self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({ type: 'CACHE_UPDATED' });
            });
          });
        });
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests differently
  if (url.pathname.startsWith('/api/') || url.hostname !== location.hostname) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Return offline data from localStorage if available
          if (url.pathname.includes('/ips')) {
            return new Response(
              JSON.stringify([]),
              {
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
          return new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Handle static files
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Always try to fetch from network first for fresh content
        return fetch(request)
          .then((networkResponse) => {
            // Cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Return cached version if network fails
            if (response) {
              return response;
            }
            
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(
      // Sync any pending actions when back online
      syncPendingActions()
    );
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from ForkYouDaddy',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore IPs',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ForkYouDaddy', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/explore')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function to sync pending actions
async function syncPendingActions() {
  try {
    // Get pending actions from IndexedDB or localStorage
    const pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
    
    for (const action of pendingActions) {
      try {
        // Retry the action
        await retryAction(action);
        
        // Remove from pending actions if successful
        const updatedActions = pendingActions.filter(a => a.id !== action.id);
        localStorage.setItem('pendingActions', JSON.stringify(updatedActions));
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  } catch (error) {
    console.error('Error syncing pending actions:', error);
  }
}

// Helper function to retry failed actions
async function retryAction(action) {
  switch (action.type) {
    case 'createIP':
      // Retry IP creation
      return fetch('/api/ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data)
      });
    
    case 'createComment':
      // Retry comment creation
      return fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data)
      });
    
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
} 