self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : { title: 'Notification', body: 'You have a new update!' };
    
    const title = data.title || 'Aston Recruitment Update';
    const options = {
      body: data.body || 'You have a new update.',
      icon: '/logo.jpeg',
      badge: '/logo.jpeg',
      data: {
        url: '/'
      }
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error handling push event:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const clickActionUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with this url
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(clickActionUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new one
      if (clients.openWindow) {
        return clients.openWindow(clickActionUrl);
      }
    })
  );
});
