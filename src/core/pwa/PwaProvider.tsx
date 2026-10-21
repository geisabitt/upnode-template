'use client'
import { useEffect } from 'react'
// Uses the same configuration-driven provider pattern as the clients, without
// importing their Serwist dependency or its general-purpose commerce caching rules.
export default function PwaProvider({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const owned = (url: string) => ['/upnode-sw.js', '/serwist/'].some(path => new URL(url).pathname.startsWith(path))
    if (enabled) {
      void navigator.serviceWorker.register('/upnode-sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {})
    } else {
      void navigator.serviceWorker.getRegistrations().then(async registrations => {
        for (const registration of registrations) {
          const worker = registration.active || registration.waiting || registration.installing
          if (worker && owned(worker.scriptURL)) await registration.unregister()
        }
        if ('caches' in window) for (const key of await caches.keys()) if (key.startsWith('upnode-pwa')) await caches.delete(key)
      }).catch(() => {})
    }
  }, [enabled])
  return null
}
