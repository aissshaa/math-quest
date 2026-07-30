self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('mathquest-v6').then(function(cache) {
      return cache.addAll([
        './',
        './index.html',
        './js/data.js',
        './js/store.js',
        './js/generator.js',
        './js/auth.js',
        './js/app.js',
        './manifest.json',
        './icon-192.png',
        './icon-512.png'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(names.map(function(name) {
        if (name !== 'mathquest-v6') return caches.delete(name);
      }));
    }).then(function() { return clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).catch(function() { return r; });
    })
  );
});
