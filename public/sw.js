self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  self.registration.showNotification(data.title || 'GEMA', {
    body: data.body || '',
    icon: '/icon.png',
    badge: '/icon.png',
    data: { url: data.url || '/' },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const client = clientList.find((c) => c.url === url && 'focus' in c);
      if (client) return client.focus();
      return clients.openWindow(url);
    })
  );
});
