// Firebase initialization and Firestore export
// Uses singleton pattern to avoid re-initializing in Fast Refresh

import { initializeApp, getApps } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getFirestore } from 'firebase/firestore';
// Analytics is imported lazily via dynamic import helpers to avoid SSR issues

const firebaseConfig = {
  apiKey: 'AIzaSyBd-KG-6V1bFUSgXA85q8gVwepu3UnD600',
  authDomain: 'yoav-site.firebaseapp.com',
  projectId: 'yoav-site',
  storageBucket: 'yoav-site.firebasestorage.app',
  messagingSenderId: '666949858235',
  appId: '1:666949858235:web:10b5727aa719ce9cf0ca9e',
  measurementId: 'G-Y86DJJCLQT',
};

// Singleton Firebase app
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

/**
 * Lazy (browser-only) Analytics accessor.
 * Avoids throwing during SSR / build and skips if analytics not supported (e.g. in some environments).
 */
let _analyticsPromise: Promise<import('firebase/analytics').Analytics | null> | null = null;

export function getAnalyticsInstance() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (_analyticsPromise) return _analyticsPromise;
  _analyticsPromise = (async () => {
    try {
      const { isSupported, getAnalytics } = await import('firebase/analytics');
      const supported = await isSupported();
      if (!supported) return null;
      return getAnalytics(app);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[firebase] Analytics init skipped:', err);
      }
      return null;
    }
  })();
  return _analyticsPromise;
}

// Small helper for fire & forget logging without forcing every caller to await
export function logFirebaseEvent(eventName: string, params?: Record<string, any>) {
  // Do not block UI; run after current frame
  if (typeof window === 'undefined') return;
  getAnalyticsInstance().then((analytics) => {
    if (!analytics) return;
    import('firebase/analytics').then(({ logEvent }) => {
      try {
        logEvent(analytics, eventName as any, params);
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[firebase] logEvent failed', e);
        }
      }
    });
  });
}

// Convenience: log a page_view; used by AnalyticsProvider
export function logPageView(path: string) {
  logFirebaseEvent('page_view', { 
    page_path: path,
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
    page_title: typeof document !== 'undefined' ? document.title : undefined,
  });
}

export { app }; // in case other libs need the initialized app

// Set user properties (GA4). Safe no-op on server / unsupported envs.
export function setAnalyticsUserProperties(props: Record<string, any>) {
  if (typeof window === 'undefined') return;
  getAnalyticsInstance().then((analytics) => {
    if (!analytics) return;
    import('firebase/analytics').then(({ setUserProperties }) => {
      try {
        setUserProperties(analytics, props as any);
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[firebase] setUserProperties failed', e);
        }
      }
    });
  });
}
