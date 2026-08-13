import 'server-only';
import { applicationDefault, cert, getApps, initializeApp, type App } from 'firebase-admin/app';

let adminApp: App | undefined;

/** True when the Admin SDK can initialize without throwing. */
export function isAdminConfigured(): boolean {
  if (adminApp || getApps().some((app) => app.name === 'hhgoa-admin')) return true;
  return Boolean(
    (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
}

export function getAdminApp(): App {
  if (adminApp) return adminApp;

  const existing = getApps().find((app) => app.name === 'hhgoa-admin');
  if (existing) {
    adminApp = existing;
    return existing;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const googleAppCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  let credential;
  if (clientEmail && privateKey) {
    credential = cert({ projectId: projectId as string, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') });
  } else if (googleAppCredentials) {
    credential = applicationDefault();
  } else {
    throw new Error(
      'Firebase Admin SDK is not configured. Add FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL (or GOOGLE_APPLICATION_CREDENTIALS) to your environment.'
    );
  }

  const app = initializeApp({ projectId, credential }, 'hhgoa-admin');
  adminApp = app;
  return app;
}
