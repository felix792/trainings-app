const CACHE = 'tactiq-v50';
const ASSETS = [
  '/trainings-app/',
  '/trainings-app/index.html',
  '/trainings-app/team.html',
  '/trainings-app/settings.html',
  '/trainings-app/players.html',
  '/trainings-app/player.html',
  '/trainings-app/exercises.html',
  '/trainings-app/exercise.html',
  '/trainings-app/plays.html',
  '/trainings-app/play.html',
  '/trainings-app/stats.html',
  '/trainings-app/stat.html',
  '/trainings-app/points.html',
  '/trainings-app/cards.html',
  '/trainings-app/blackbox.html',
  '/trainings-app/styles.css',
  '/trainings-app/app.js',
  '/trainings-app/team.js',
  '/trainings-app/settings.js',
  '/trainings-app/players.js',
  '/trainings-app/player.js',
  '/trainings-app/exercises.js',
  '/trainings-app/exercise.js',
  '/trainings-app/plays.js',
  '/trainings-app/play.js',
  '/trainings-app/stats.js',
  '/trainings-app/stat.js',
  '/trainings-app/points.js',
  '/trainings-app/cards.js',
  '/trainings-app/blackbox.js',
  '/trainings-app/calendar.html',
  '/trainings-app/calendar.js',
  '/trainings-app/lineups.html',
  '/trainings-app/lineups.js',
  '/trainings-app/lineup.html',
  '/trainings-app/lineup.js',
  '/trainings-app/livegame.html',
  '/trainings-app/livegame.js',
  '/trainings-app/profile.html',
  '/trainings-app/profile.js',
  '/trainings-app/icon-192.png',
  '/trainings-app/icon-512.png',
  '/trainings-app/firebase-config.js',
  '/trainings-app/db.js',
  '/trainings-app/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first: always try network, fall back to cache if offline
  e.respondWith(
    fetch(e.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, copy));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
