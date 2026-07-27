/* סוכני הסייבר — Service Worker (PWA offline shell) */
const CACHE = 'cyber-agents-v7';
const ASSETS = [
  '/', '/index.html', '/manifest.webmanifest', '/manifest-teacher.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png',
  '/icons/maskable-192.png', '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png', '/icons/favicon-32.png',
  '/icons/teacher-icon-192.png', '/icons/teacher-icon-512.png',
  '/icons/teacher-maskable-192.png', '/icons/teacher-maskable-512.png',
  '/icons/teacher-apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Version marker: always hit the network — the whole point is to reflect the current deploy,
  // so it must never get stuck on whatever response happened to be cached first.
  if (url.pathname === '/api/version') {
    e.respondWith(fetch(req));
    return;
  }

  // Navigations: network-first so updates show; fall back to cached shell offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('/index.html', cp)); return r; })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Other same-origin assets: cache-first, then network (and cache it).
  e.respondWith(
    caches.match(req).then(c => c || fetch(req).then(r => {
      const cp = r.clone(); caches.open(CACHE).then(cc => cc.put(req, cp)); return r;
    }))
  );
});
