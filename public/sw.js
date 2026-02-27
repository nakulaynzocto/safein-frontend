// SafeIn PWA Service Worker
// Version is injected via URL query param: /sw.js?v=1.1
// Set NEXT_PUBLIC_APP_VERSION in .env to control this — no need to edit this file!
const _swVersion = new URL(self.location.href).searchParams.get('v') || '1.0';
const CACHE_NAME = `safein-v${_swVersion}`;

const OFFLINE_URL = '/offline';

// Static assets to cache on install (app shell)
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/aynzo-logo.png',
  '/aynzo-logo.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
];

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache failed for some assets:', err);
      });
    })
  );
  // Take control immediately — no need for user to close/reopen tab
  self.skipWaiting();
});

// ─── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', CACHE_VERSION);
  event.waitUntil(
    // Delete ALL old caches that don't match current version
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  // Claim all open clients immediately so new SW takes over without reload
  self.clients.claim();
});

// ─── Fetch Strategy ─────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and API calls
  if (
    request.method !== 'GET' ||
    url.protocol === 'chrome-extension:' ||
    url.pathname.startsWith('/api/') ||
    url.hostname !== self.location.hostname
  ) {
    return;
  }

  // For navigation requests: network-first, fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match(OFFLINE_URL)
          )
        )
    );
    return;
  }

  // For static assets: Stale-While-Revalidate strategy
  // → Serve cached version instantly (fast UX)
  // → Simultaneously fetch fresh version in background (always up-to-date)
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|eot|css|js)$/)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cached) => {
          // Fetch fresh copy in background regardless
          const networkFetch = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => null);

          // Return cached immediately if available, else wait for network
          return cached || networkFetch;
        });
      })
    );
    return;
  }

  // Default: network-first with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ─── Message Handler (for instant update from app) ───────────────────────────
// When the app sends { type: 'SKIP_WAITING' }, new SW activates immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING — activating new version now');
    self.skipWaiting();
  }
});

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'SafeIn', body: 'You have a new notification.' };
  try {
    data = event.data?.json() ?? data;
  } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/aynzo-logo.png',
      badge: '/aynzo-logo.png',
      tag: data.tag || 'safein-notification',
      data: { url: data.url || '/' },
      vibrate: [100, 50, 100],
      actions: [
        { action: 'open', title: 'Open App' },
        { action: 'close', title: 'Dismiss' },
      ],
    })
  );
});

// ─── Notification Click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      })
  );
});
