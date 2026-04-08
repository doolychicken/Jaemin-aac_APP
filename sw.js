/**
 * Service Worker for AAC App
 * Strategy: Cache-first for images, network-first for HTML/JS/CSS
 * On first visit, pre-caches all images so subsequent loads are instant.
 */

const CACHE_VERSION = 'v4';
const CACHE_NAME = `jaemin-aac-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/app.css',
  './js/data.js',
  './js/app.js',
  // ── Images ──
  './images/apple.png',
  './images/bannana.png',
  './images/brush.png',
  './images/bus.png',
  './images/dad car.png',
  './images/dad_carkey.png',
  './images/eggs.png',
  './images/grape.png',
  './images/grape1.png',
  './images/home.png',
  './images/ipad.png',
  './images/knobpuzzle_fruits.png',
  './images/knobpuzzle_numbers.png',
  './images/knobpuzzle_numbers2.png',
  './images/knobpuzzle_numbers3.png',
  './images/knobpuzzle_shapes.png',
  './images/knobpuzzle_shapes2.png',
  './images/knobpuzzle_vehicles.png',
  './images/meal.png',
  './images/orange.png',
  './images/outing.png',
  './images/outing_bakery.png',
  './images/outing_cafe.png',
  './images/outing_mart1.png',
  './images/outing_park1.png',
  './images/outing_person_activity_support.png',
  './images/outing_person_dad.png',
  './images/outing_person_grandma.png',
  './images/outing_person_grandpa.png',
  './images/outing_person_me.png',
  './images/outing_person_mom.png',
  './images/outing_school1.png',
  './images/pee.png',
  './images/pineapple.png',
  './images/poo.png',
  './images/school bus.png',
  './images/school_boccia.png',
  './images/school_cafeteria.png',
  './images/school_classroom.png',
  './images/school_digital_active_room.png',
  './images/school_elevator.png',
  './images/school_friends.png',
  './images/school_friends_\uAC74\uBBFC.png',
  './images/school_friends_\uB3D9\uD558.png',
  './images/school_friends_\uC2B9\uC6B0.png',
  './images/school_friends_\uC724\uD76C.png',
  './images/school_friends_\uC724\uD76C1.png',
  './images/school_friends_\uD558\uB9B0.png',
  './images/school_garden.png',
  './images/school_gym.png',
  './images/school_homeroom_teacher.png',
  './images/school_imagination_room.png',
  './images/school_restroom.png',
  './images/school_shoe_locker.png',
  './images/school_subject_room.png',
  './images/shower.png',
  './images/sing.png',
  './images/stickerbook_animal.png',
  './images/stickerbook_eyenosemouth.png',
  './images/stickerbook_fruit.png',
  './images/stickerbook_language.png',
  './images/stickerbook_mart.png',
  './images/stickerbook_myhome.png',
  './images/stickerbook_number.png',
  './images/stickerbook_pet.png',
  './images/stickerbook_shape.png',
  './images/stickerbook_vehicle.png',
  './images/strawberry.png',
  './images/study.png',
  './images/study_color_pencil.png',
  './images/study_pegboard.png',
  './images/study_soundbook_card.png',
  './images/therapy_center_severance.png',
  './images/therapy_class_cognitive.png',
  './images/therapy_class_music.png',
  './images/therapy_class_speech.png',
  './images/therapy_class_swallowing.png',
  './images/toilet.png',
  './images/tomato.png',
  './images/transport_bike.png',
  './images/transport_bus.png',
  './images/transport_calltaxi.png',
  './images/transport_car.png',
  './images/transport_subway.png',
  './images/transport_subway_JM.png',
  './images/transport_walk.png',
  './images/wash_face.png',
  './images/wash_hands.png',
  './images/watermelon.png',
  './images/youtube.png',
];

// ── Install: pre-cache everything ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // addAll will fail silently per-item if we use individual fetches
      Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch(() => {
            // ignore individual failures (e.g. missing optional image)
          })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ── Activate: delete old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for images, network-first for everything else ────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests from the same origin
  if (event.request.method !== 'GET') return;

  const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(url.pathname);

  if (isImage) {
    // Cache-first: serve instantly from cache, fall back to network
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
  } else {
    // Stale-while-revalidate for HTML/CSS/JS: respond from cache if available,
    // but always fetch a fresh copy in the background to keep cache up-to-date.
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          const networkFetch = fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          }).catch(() => cached);

          return cached || networkFetch;
        })
      )
    );
  }
});
