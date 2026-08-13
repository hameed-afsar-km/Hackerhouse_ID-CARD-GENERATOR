import 'server-only';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp, isAdminConfigured } from '@/lib/firebase/admin';
import { PublicBuilder } from '@/types/builder';

let warned = false;

function warnUnconfigured(): void {
  if (warned) return;
  warned = true;
  console.warn(
    '[builder-registry] Firebase Admin SDK not configured — registry lookups are unavailable. ' +
      'Set FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY or GOOGLE_APPLICATION_CREDENTIALS.'
  );
}

export async function getBuilderById(id: string): Promise<PublicBuilder | null> {
  if (!isAdminConfigured()) {
    warnUnconfigured();
    return null;
  }
  try {
    const app = getAdminApp();
    const doc = await getFirestore(app).collection('builders').doc(id).get();
    if (!doc.exists) return null;
    return { ...(doc.data() as PublicBuilder), id };
  } catch (err) {
    console.error('Failed to read builder', err);
    return null;
  }
}

export async function getBuilderByCode(code: string): Promise<PublicBuilder | null> {
  if (!isAdminConfigured()) {
    warnUnconfigured();
    return null;
  }
  try {
    const app = getAdminApp();
    const db = getFirestore(app);
    const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length !== 12) return null;

    const snap = await db.collection('codes').doc(clean).get();
    if (!snap.exists) return null;

    const uid = (snap.data() as { uid: string }).uid;
    return getBuilderById(uid);
  } catch (err) {
    console.error('Failed to read builder by code', err);
    return null;
  }
}
