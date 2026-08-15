import { notificationService } from '../services/api'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Web Push is not supported in this browser.');
    return;
  }

  try {
    // 1. Register Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered successfully:', registration);

    // 2. Request Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied.');
      return;
    }

    // 3. Subscribe to push manager
    const VAPID_PUBLIC_KEY = 'BKW_d-SdnyDzLJb5-Bta9LPu0bQRY5Y0ojO7b06J39pi1O_vsY5rpuTTmpfJD8lOVhngVbBTlfQ22yAr6lxf4cY';
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
    }

    // 4. Send subscription details to backend
    await notificationService.subscribePush(subscription);
    console.log('User successfully subscribed to Web Push.');
  } catch (error) {
    console.error('Failed to subscribe user to push notifications:', error);
  }
}
