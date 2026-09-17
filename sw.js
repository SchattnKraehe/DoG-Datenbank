const CACHE='dog-racehub-v2-12';

const CORE=[
  './',
  './index.html',
  './style.css?v=2.6',
  './app.js?v=2.11',
  './flaggen.js?v=1.0',
  './lang.js?v=2.11',
  './config.js?v=2.11',
  './manifest.webmanifest',
  './icon-192.png',
  './flag-be.png',
  './flag-jp.png',
  './flag-nl.png',
  './flag-in.png',
  './flag-it.png',
  './flag-jm.png',
  './flag-th.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(CORE))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;

  const url=new URL(event.request.url);
  const isAppResource =
    event.request.mode==='navigate' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/app.js') ||
    url.pathname.endsWith('/style.css') ||
    url.pathname.endsWith('/lang.js') ||
    url.pathname.endsWith('/config.js') ||
    url.pathname.endsWith('/flaggen.js') ||
    url.pathname.endsWith('/manifest.webmanifest');

  // App-Shell immer zuerst aus dem Netz holen. Dadurch darf ein normales
  // F5 niemals eine alte app.js/index.html aus dem Service-Worker-Cache
  // bevorzugen. Falls das Netz nicht erreichbar ist, nutzen wir den Cache.
  if(isAppResource){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
          return response;
        })
        .catch(()=>caches.match(event.request))
    );
    return;
  }

  // Bilder und sonstige statische Dateien dürfen normal gecacht werden.
  event.respondWith(
    caches.match(event.request).then(cached=>{
      return cached || fetch(event.request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      }).catch(()=>cached);
    })
  );
});
