// sw.js — Caffè Italiano
// Simpele service worker: cachet de app-shell zodat de app ook offline opent.
//
// BELANGRIJK bij elke update van index.html / avatars / manifest / icons:
// verhoog het versienummer hieronder (bv. 'v2', 'v3', ...). Anders blijven
// bezoekers de oude, gecachte versie zien.
const CACHE_NAME = 'caffe-italiano-v2';

// Alles wat nodig is om de app zonder internet te openen.
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './apple-touch-icon.png',
  './1789331721645.jpg?v=2',
  './avatars/avatar_01.png',
  './avatars/avatar_02.png',
  './avatars/avatar_03.png',
  './avatars/avatar_04.png',
  './avatars/avatar_05.png',
  './avatars/avatar_06.png',
  './avatars/avatar_07.png',
  './avatars/avatar_08.png',
  './avatars/avatar_09.png',
  './avatars/avatar_10.png',
  './avatars/avatar_11.png',
  './avatars/avatar_12.png',
  './avatars/avatar_13.png',
  './avatars/avatar_14.png',
  './avatars/avatar_15.png',
  './avatars/avatar_16.png',
  './avatars/avatar_17.png',
  './avatars/avatar_18.png',
  './avatars/avatar_19.png',
  './avatars/avatar_20.png',
];

// Bij installatie: alle bestanden vast in de cache zetten.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Bij activatie: oude cache-versies opruimen.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Bij elk verzoek: eerst proberen via het netwerk (zodat je altijd de
// nieuwste versie krijgt als je online bent), en als dat mislukt
// (= offline) terugvallen op wat er in de cache staat.
self.addEventListener('fetch', (event) => {
  // Alleen eigen verzoeken afhandelen (geen Google Fonts e.d.), anders
  // laten we de browser het gewoon zelf regelen.
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Verse kopie ook meteen in de cache bijwerken.
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
