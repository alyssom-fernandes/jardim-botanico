// Mapa do Jardim Botânico: funciona sem internet depois da primeira visita.
const V = 'jb-app-v2';
const TILES = 'jb-tiles-v1';
const SHELL = [
  './', 'index.html', 'style.css', 'app.js', 'data.js', 'manifest.webmanifest', 'icon-192.png', 'icon-180.png',
  'vendor/maplibre-gl.js', 'vendor/maplibre-gl.css',
  'fonts/Noto%20Sans%20Regular/0-255.pbf', 'fonts/Noto%20Sans%20Italic/0-255.pbf', 'fonts/Noto%20Sans%20Bold/0-255.pbf',
  'fonts/Noto%20Sans%20Regular/8192-8447.pbf', 'fonts/Noto%20Sans%20Italic/8192-8447.pbf',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k !== TILES).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.hostname === 'server.arcgisonline.com') {
    e.respondWith(caches.open(TILES).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      try { const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r; } catch (err) { return Response.error(); }
    }));
    return;
  }
  if (u.origin !== self.location.origin) return;
  if (u.pathname.includes('/vendor/') || u.pathname.includes('/fonts/') || u.pathname.endsWith('.png')) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { const cp = r.clone(); if (r.ok) caches.open(V).then((c) => c.put(req, cp)); return r; })));
    return;
  }
  // app e dados: tenta a rede (pega atualizações), cai no cache se o sinal estiver ruim
  e.respondWith(Promise.race([fetch(req), timeout(5000)]).then((r) => {
    const cp = r.clone(); if (r.ok) caches.open(V).then((c) => c.put(req, cp)); return r;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((h) => h || caches.match('index.html'))));
});
