// Bump VERSION whenever you change the app so phones pick up the update.
const VERSION = 'hw-v6';
// Every file the app needs offline. Add new css/ and js/ files here too.
const CSS = ['base', 'addbar', 'list', 'tabbar', 'timer', 'sheets', 'dialogs', 'toast'].map(n => `css/${n}.css`);
const JS = ['core', 'types', 'dates', 'state', 'addbar', 'pages', 'render', 'progress', 'toast', 'items', 'sheets',
  'itemview', 'edit', 'timer', 'reminders', 'settings', 'updates', 'boot'].map(n => `js/${n}.js`);
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', ...CSS, ...JS];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first (so updates show up), fall back to cache when offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
