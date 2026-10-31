// Service Worker بسيط – كاش للأصول الثابتة
const CACHE = 'metanoia-v1'
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon.svg']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return

  // طلبات Supabase تعدّي على الشبكة مباشرة
  if (request.url.includes('supabase.co')) return

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(res => {
        const copy = res.clone()
        caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {})
        return res
      }).catch(() => caches.match('/index.html'))
    })
  )
})