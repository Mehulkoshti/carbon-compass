'use client';

import { useEffect } from 'react';

/** Registers the service worker so the app is installable and works offline. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* registration is best-effort; the app works fine without it */
      });
    }
  }, []);
  return null;
}
