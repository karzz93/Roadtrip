/* Roadtrip Companion service worker
   Shell is precached. Trip data lives in localStorage, so the app is usable
   with no network at all. Map tiles and weather are cached opportunistically
   and served stale when offline, with the UI told the data may be old. */
const V = 'rtc-v3';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V + '-shell').then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => !k.startsWith(V)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const put = (cache, req, res) => { caches.open(cache).then(c => c.put(req, res)); };

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* navigations: serve the shell so a cold start works offline */
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  /* weather: fresh if possible, last reading if not */
  if (url.hostname.endsWith('open-meteo.com')) {
    e.respondWith(fetch(req).then(r => { put(V + '-api', req, r.clone()); return r; })
      .catch(() => caches.match(req)));
    return;
  }

  /* map tiles: cache first, capped so we never bulk-download a provider */
  if (/tile\.openstreetmap\.org|tiles?\./.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok) caches.open(V + '-tiles').then(async c => {
        const keys = await c.keys();
        if (keys.length > 900) await c.delete(keys[0]);
        c.put(req, r.clone());
      });
      return r;
    }).catch(() => new Response('', { status: 504 }))));
    return;
  }

  /* fonts and everything else same-origin: cache first, revalidate quietly */
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r.ok) put(V + '-shell', req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
