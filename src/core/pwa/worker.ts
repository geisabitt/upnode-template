import { canCachePublicDocument, type ModuleConfig } from '@/core/lib/module-config'
export function workerSource(config: ModuleConfig): string {
  const allowed = canCachePublicDocument(config, '/offline')
  const cache = 'upnode-pwa-safe-v1-' + JSON.stringify(config)
  // Only the neutral offline fallback is stored. No APIs, RSC, catalogs, checkout,
  // order HTML or third-party requests are cached, regardless of enabled modules.
  return `const cacheName = ${JSON.stringify(cache)};
const enabled = ${allowed};
const cleanup = async () => { for (const name of await caches.keys()) if (name.startsWith('upnode-pwa') && (!enabled || name !== cacheName)) await caches.delete(name); };
self.addEventListener('install', event => { event.waitUntil((async () => {
  if (enabled) { const response = await fetch('/offline', {cache:'no-store', credentials:'omit'}); if (response.ok) await (await caches.open(cacheName)).put('/offline', response); }
  await self.skipWaiting();
})()); });
self.addEventListener('activate', event => { event.waitUntil((async () => { await cleanup(); if (!enabled) await self.registration.unregister(); else await self.clients.claim(); })()); });
if (enabled) self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate' || url.origin !== self.location.origin) return;
  const prefixes = ['/loja','/carrinho','/checkout','/pedido','/minha-conta','/admin','/api'];
  if (prefixes.some(prefix => url.pathname === prefix || url.pathname.startsWith(prefix + '/'))) return;
  event.respondWith(fetch(event.request).catch(async () => (await (await caches.open(cacheName)).match('/offline')) || Response.error()));
});`
}
