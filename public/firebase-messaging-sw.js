importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCdRcClZV4kwR3-TJKDDcyDyRYREJOnv90",
  authDomain: "safein-b3311.firebaseapp.com",
  projectId: "safein-b3311",
  storageBucket: "safein-b3311.firebasestorage.app",
  messagingSenderId: "490473344402",
  appId: "1:490473344402:web:60bfe9829c6f302cecc54b",
  measurementId: "G-5N63MD37YJ"
});



const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png', 
    badge: '/icon-192.png',
    data: payload.data,
    sound: '/sounds/notification.mp3', // Try to play custom sound
    vibrate: [200, 100, 200] // Vibrate pattern
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


