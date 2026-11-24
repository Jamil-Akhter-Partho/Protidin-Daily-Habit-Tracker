const CACHE_NAME = 'protidin-cache-v3'
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
]

// Install: Precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate: Clean old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key)
            }
          })
        )
      )
      .then(() => self.clients.claim())
  )
})

// Fetch: Stale-While-Revalidate with offline fallback
self.addEventListener('fetch', (event) => {
  const req = event.request

  // Only handle GET requests with http/https scheme
  if (req.method !== 'GET' || !req.url.startsWith('http')) return

  // Skip dev-server internal URLs (Vite HMR, source files, etc.)
  if (req.url.includes('/@') || req.url.includes('/node_modules/') || req.url.includes('?t=')) return

  // For HTML navigations, try network first, then fall back to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone))
          }
          return networkRes
        })
        .catch(async () => {
          const cached = await caches.match('./index.html')
          return cached || (await caches.match('./'))
        })
    )
    return
  }

  // For static assets: Cache-first with network fallback
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      if (cachedRes) {
        // Fetch in background to update cache
        fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkRes))
            }
          })
          .catch(() => {})
        return cachedRes
      }

      return fetch(req)
        .then((networkRes) => {
          if (!networkRes || networkRes.status !== 200) {
            return networkRes
          }
          const resClone = networkRes.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone))
          return networkRes
        })
        .catch(() => {
          if (req.destination === 'image') {
            return caches.match('./icons/icon-192.png')
          }
        })
    })
  )
})
