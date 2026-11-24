/* ITP Studio service worker: keeps the app working offline and lets it update itself.
   dist.py fills in VERSION (the build time) and FILES. A new deploy changes VERSION,
   so the browser sees a new worker, the page offers "Update", and old caches are removed. */
const VERSION = '20261124-175500';
const APP = 'itp-app-' + VERSION, FONTS = 'itp-fonts';
const FILES = ["./", "index.html", "favicon.svg", "manifest.webmanifest"];

self.addEventListener('install', e => {
  // fetch fresh copies (skip the browser's HTTP cache) so the new version is really new
  e.waitUntil(caches.open(APP).then(c => c.addAll(FILES.map(u => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('itp-app-') && k !== APP).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Google Fonts: serve the saved copy straight away and refresh it in the background
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // pages: try the live site first (so a broken saved copy can never lock anyone out),
  // fall back to the saved app when offline, and finally to a plain offline message
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      if (r && r.ok) { const copy = r.clone(); caches.open(APP).then(c => c.put('index.html', copy)); }
      return r;
    }).catch(async () => (await caches.match('index.html', { ignoreSearch: true })) || (await caches.match('./')) ||
      new Response('<!doctype html><meta name=viewport content="width=device-width"><body style="font-family:system-ui;padding:40px;text-align:center"><h1>ITP Studio</h1><p>You appear to be offline. Reconnect and refresh to open ITP Studio.</p></body>', { headers: { 'Content-Type': 'text/html' } })));
    return;
  }
  e.respondWith(caches.open(APP).then(c => c.match(req, { ignoreSearch: true })).then(hit => hit || fetch(req)).catch(() => fetch(req)));
});
