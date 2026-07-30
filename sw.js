self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('mathquest-v1').then(function(cache) {
      return cache.addAll([
        './',
        './index.html',
        './js/data.js',
        './js/store.js',
        './js/generator.js',
        './js/app.js',
        './manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).catch(function() { return r; });
    })
  );
});
