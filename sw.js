'use strict';

const CACHE_PREFIX = 'gera-pwa-';
const LEGACY_CACHE_PREFIX = 'teclado-virtual-pwa-';
const CACHE_NAME = CACHE_PREFIX + 'v3.15.33';
const OFFLINE_URL = './offline.html';

const PRECACHE_URLS = [
    "./",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/icon-maskable-512.png",
    "./index.html",
    "./js/storage.js",
    "./js/chords.js",
    "./js/state.js",
    "./js/transport/clock.js",
    "./js/transport/scheduler.js",
    "./js/transport/boundaries.js",
    "./js/transport/tempo.js",
    "./js/transport/drum-sync.js",
    "./js/transport/chord-sequence-sync.js",
    "./js/transport/sequence-transitions.js",
    "./js/transport/coordinator.js",
    "./js/ui/transport-status.js",
    "./js/ui/header.js",
    "./js/ui/compact-panel.js",
    "./js/ui/keyboard.js",
    "./js/ui/chords-circle.js",
    "./js/ui/drums.js",
    "./js/ui/sequencer.js",
    "./js/ui/songs-library.js",
    "./js/ui/settings-modals.js",
    "./js/audio/core.js",
    "./kit-acustico-selecionado/MAPEAMENTO.txt",
    "./kit-acustico-selecionado/cymbals/crash-1.wav",
    "./kit-acustico-selecionado/cymbals/crash-2.wav",
    "./kit-acustico-selecionado/cymbals/ride.wav",
    "./kit-acustico-selecionado/hihat/hihat-closed-1.wav",
    "./kit-acustico-selecionado/hihat/hihat-closed-2.wav",
    "./kit-acustico-selecionado/hihat/hihat-open.wav",
    "./kit-acustico-selecionado/hihat/hihat-semiopen.wav",
    "./kit-acustico-selecionado/kick/kick-hard.wav",
    "./kit-acustico-selecionado/kick/kick-medium.wav",
    "./kit-acustico-selecionado/kick/kick-soft.wav",
    "./kit-acustico-selecionado/snare/snare-hard.wav",
    "./kit-acustico-selecionado/snare/snare-medium.wav",
    "./kit-acustico-selecionado/snare/snare-soft.wav",
    "./kit-acustico-selecionado/toms/tom-high.wav",
    "./kit-acustico-selecionado/toms/tom-low.wav",
    "./kit-acustico-selecionado/toms/tom-mid.wav",
    "./manifest.json",
    "./manual-gera.html",
    "./offline.html",
    "./styles/inline-style-01.css"
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            return cache.addAll(PRECACHE_URLS);
        })
        .then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
        .then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (
                        (
                            cacheName.indexOf(CACHE_PREFIX) === 0 ||
                            cacheName.indexOf(LEGACY_CACHE_PREFIX) === 0
                        ) &&
                        cacheName !== CACHE_NAME
                    ) {
                        return caches.delete(cacheName);
                    }
                    return Promise.resolve(false);
                })
            );
        })
        .then(function() {
            return self.clients.claim();
        })
    );
});

function isSameOrigin(request) {
    try {
        return new URL(request.url).origin === self.location.origin;
    } catch (error) {
        return false;
    }
}

function cacheResponse(request, response) {
    if (!response || response.status !== 200 || response.type === 'opaque') {
        return Promise.resolve(response);
    }

    const copy = response.clone();
    return caches.open(CACHE_NAME)
        .then(function(cache) {
            return cache.put(request, copy);
        })
        .then(function() {
            return response;
        });
}

function navigationStrategy(request) {
    return fetch(request)
        .then(function(response) {
            return cacheResponse(request, response);
        })
        .catch(function() {
            return caches.match(request)
                .then(function(cached) {
                    if (cached) return cached;
                    return caches.match('./index.html');
                })
                .then(function(cachedIndex) {
                    if (cachedIndex) return cachedIndex;
                    return caches.match(OFFLINE_URL);
                });
        });
}

function cacheFirstStrategy(request) {
    return caches.match(request)
        .then(function(cached) {
            if (cached) return cached;

            return fetch(request)
                .then(function(response) {
                    return cacheResponse(request, response);
                });
        });
}

function networkFirstStrategy(request) {
    return fetch(request)
        .then(function(response) {
            return cacheResponse(request, response);
        })
        .catch(function() {
            return caches.match(request);
        });
}

self.addEventListener('fetch', function(event) {
    const request = event.request;

    if (request.method !== 'GET') return;
    if (!isSameOrigin(request)) return;

    if (request.mode === 'navigate') {
        event.respondWith(navigationStrategy(request));
        return;
    }

    const destination = request.destination;

    if (
        destination === 'audio' ||
        destination === 'image' ||
        destination === 'style' ||
        destination === 'script' ||
        destination === 'font'
    ) {
        event.respondWith(cacheFirstStrategy(request));
        return;
    }

    event.respondWith(networkFirstStrategy(request));
});

self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
