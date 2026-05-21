// 🏥 Minimal Service Worker to satisfy PWA installation criteria
const CACHE_NAME = 'jkucma-hub-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Acts as a passthrough network fetch strategy
  event.respondWith(fetch(event.request));
});