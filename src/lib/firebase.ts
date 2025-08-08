// Firebase initialization and Firestore export
// Uses singleton pattern to avoid re-initializing in Fast Refresh

import { initializeApp, getApps } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBd-KG-6V1bFUSgXA85q8gVwepu3UnD600',
  authDomain: 'yoav-site.firebaseapp.com',
  projectId: 'yoav-site',
  storageBucket: 'yoav-site.firebasestorage.app',
  messagingSenderId: '666949858235',
  appId: '1:666949858235:web:10b5727aa719ce9cf0ca9e',
  measurementId: 'G-Y86DJJCLQT',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize App Check in the browser only
if (typeof window !== 'undefined') {
  // Optional: enable App Check debug token in dev (set NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN)
  const dbg = process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN;
  if (dbg) {
    // When set to 'true', Firebase generates a token in console for you to copy
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = dbg === 'true' ? true : dbg;
  }
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    // Avoid throwing in dev if not configured yet; just warn
    console.warn('[firebase] NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set. App Check not initialized.');
  } else {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (e) {
      // If hot-reload tries to re-init, ignore duplicate init errors
      // eslint-disable-next-line no-console
      console.debug('[firebase] App Check already initialized or failed quietly:', e);
    }
  }
}

export const db = getFirestore(app);
