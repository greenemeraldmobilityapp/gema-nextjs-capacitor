importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

const firebaseConfig = {
  apiKey: null,
  authDomain: null,
  projectId: null,
  messagingSenderId: null,
  appId: null,
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const notificationTitle = payload.notification?.title || data.title || 'GEMA';
  const notificationBody = payload.notification?.body || data.body || '';
  const notificationUrl = data.url || '/';

  self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: '/icon.png',
    badge: '/icon.png',
    data: { url: notificationUrl, ...data },
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
