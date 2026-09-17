
// DoG RaceHub
// Service Worker bewusst deaktiviert.
// Die Anwendung soll bei jedem normalen Seitenaufruf die aktuelle
// Version von GitHub Pages laden. Die Daten liegen zentral in Supabase.

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return self.clients.matchAll();
    }).then(clients => {
      clients.forEach(client => {
        client.navigate(client.url);
      });
    })
  );
});