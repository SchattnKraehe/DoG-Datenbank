const CACHE='dog-racehub-v1-90';
const CORE=['./','./index.html','./style.css?v=1.90','./app.js?v=1.90','./lang.js?v=1.90','./manifest.webmanifest','./dog-logo.png','./flag-de.png','./flag-ch.png','./flag-es.png','./flag-at.png','./flag-gb.png','./flag-dk.png','./flag-se.png','./flag-no.png','./flag-pl.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('dog-racehub-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,copy));return r})));});
