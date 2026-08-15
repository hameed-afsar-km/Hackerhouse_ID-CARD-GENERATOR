import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { browserLocalPersistence } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazily initialized on first use so the SDK never runs during server prerendering.
export function getClientApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let clientAuth: Auth | null = null;

type AuthWithInit = Auth & {
  _initializationPromise?: Promise<void>;
  _initializeWithPersistence?: (persistences: unknown[]) => Promise<void>;
};

/**
 * Firebase Auth boots its IndexedDB persistence on a "floating" promise. If the
 * document is hidden while that happens (background tab, or the page getting
 * hidden mid-init), `_openDb()` rejects with "Database is closing/hidden" and,
 * being unhandled, surfaces as a Next.js runtime error. We swallow it and re-run
 * initialization once the page is visible so auth recovers without a reload.
 */
export function getClientAuth(): Auth {
  if (clientAuth) return clientAuth;

  const auth = getAuth(getClientApp());
  clientAuth = auth;

  const internal = auth as AuthWithInit;
  internal._initializationPromise?.catch(() => {
    const retry = () => {
      internal._initializeWithPersistence?.([browserLocalPersistence])?.catch(() => {});
    };
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      document.addEventListener(
        'visibilitychange',
        () => {
          if (document.visibilityState === 'visible') retry();
        },
        { once: true }
      );
    } else {
      retry();
    }
  });

  return auth;
}

export function getClientStorage(): FirebaseStorage {
  return getStorage(getClientApp());
}
