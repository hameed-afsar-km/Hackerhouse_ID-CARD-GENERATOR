import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp, isAdminConfigured } from '@/lib/firebase/admin';
import { PublicBuilder, PhotoFilterSettings, StackCategory } from '@/types/builder';
import { generateClaimCode } from '@/lib/builder-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ClaimBody {
  idToken?: string;
  identity?: Partial<PublicBuilder>;
}

function sanitizePhotoSettings(settings: unknown): PhotoFilterSettings | undefined {
  if (!settings || typeof settings !== 'object') return undefined;
  const s = settings as Record<string, unknown>;
  const zoom = typeof s.zoom === 'number' && Number.isFinite(s.zoom) ? Math.min(2, Math.max(1, s.zoom)) : undefined;
  const panX = typeof s.panX === 'number' && Number.isFinite(s.panX) ? Math.min(50, Math.max(-50, s.panX)) : undefined;
  const panY = typeof s.panY === 'number' && Number.isFinite(s.panY) ? Math.min(50, Math.max(-50, s.panY)) : undefined;
  const preset = ['RAW', 'VIVID', 'DARK', 'WARM'].includes(String(s.preset)) ? String(s.preset) : undefined;
  const cardTheme = ['TROPICAL', 'SUNSET', 'CYBER', 'OBSIDIAN'].includes(String(s.cardTheme)) ? (s.cardTheme as PhotoFilterSettings['cardTheme']) : 'TROPICAL';
  const frameStyle = ['WREATH', 'SUNBURST', 'NEON', 'CIRCUIT'].includes(String(s.frameStyle)) ? (s.frameStyle as PhotoFilterSettings['frameStyle']) : 'WREATH';
  const cardBackground = ['NIGHT', 'SUNSET', 'FOREST', 'CYBER'].includes(String(s.cardBackground)) ? (s.cardBackground as PhotoFilterSettings['cardBackground']) : undefined;
  if (zoom === undefined || panX === undefined || panY === undefined || !preset) return undefined;
  const result: PhotoFilterSettings = { zoom, panX, panY, preset: preset as PhotoFilterSettings['preset'], cardTheme, frameStyle };
  if (cardBackground) result.cardBackground = cardBackground;
  return result;
}

function sanitizeIdentity(identity: Partial<PublicBuilder>, uid: string): PublicBuilder | null {
  if (!identity || !identity.name || !identity.photoUrl || !identity.builderNumber || !identity.title || !identity.stats) {
    return null;
  }
  const stack = Array.isArray(identity.stack)
    ? identity.stack.filter((s): s is StackCategory => typeof s === 'string')
    : [];
  if (stack.length === 0) return null;

  const res: PublicBuilder = {
    id: uid,
    name: String(identity.name).slice(0, 60),
    photoUrl: String(identity.photoUrl).slice(0, 3000000),
    stack,
    photoSettings: sanitizePhotoSettings(identity.photoSettings) ?? { zoom: 1, panX: 0, panY: 0, preset: 'RAW' },
    builderNumber: String(identity.builderNumber).slice(0, 20),
    claimCode: String(identity.claimCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12),
    title: String(identity.title).slice(0, 40),
    stats: identity.stats,
    createdAt: new Date().toISOString(),
  };

  const cleanX = identity.xUsername ? String(identity.xUsername).replace(/^@/, '').trim().slice(0, 30) : '';
  if (cleanX) {
    res.xUsername = cleanX;
  }

  return res;
}

// Reserve a unique 12-char claim code and return it. The client-provided code
// is used when valid and unused, so the preview matches the minted card.
async function reserveClaimCode(
  db: FirebaseFirestore.Firestore,
  uid: string,
  preferred?: string
): Promise<string> {
  const tryReserve = async (code: string): Promise<boolean> => {
    const ref = db.collection('codes').doc(code);
    const claimed = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists) return false;
      tx.set(ref, { uid, createdAt: new Date().toISOString() });
      return true;
    });
    return claimed;
  };

  if (preferred && /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{12}$/.test(preferred)) {
    try {
      if (await tryReserve(preferred)) return preferred;
    } catch (err) {
      console.warn('Preferred code reservation failed, retrying with a fresh code', err);
    }
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateClaimCode();
    try {
      if (await tryReserve(code)) return code;
    } catch (err) {
      console.warn('Code reservation failed, retrying', err);
    }
  }
  throw new Error('Could not allocate a unique claim code');
}

export async function POST(request: NextRequest) {
  let body: ClaimBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { idToken, identity } = body;
  if (!idToken || !identity) {
    return NextResponse.json({ error: 'Missing idToken or identity' }, { status: 400 });
  }

  let app: ReturnType<typeof getAdminApp>;
  let uid: string;
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Builder registry unavailable' }, { status: 503 });
  }
  try {
    app = getAdminApp();
    const decoded = await getAuth(app).verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
  }

  const builder = sanitizeIdentity(identity, uid);
  if (!builder) {
    return NextResponse.json({ error: 'Invalid identity payload' }, { status: 400 });
  }

  // Firestore caps documents at ~1MiB; a base64 data-URL photo must stay well
  // under that or the write is rejected with INVALID_ARGUMENT.
  if (builder.photoUrl.length > 1000000) {
    return NextResponse.json(
      { error: 'Photo is too large to save. Please upload a smaller image and try again.' },
      { status: 413 }
    );
  }

  try {
    const db = getFirestore(app);
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch {
      // ignore if settings already initialized
    }

    // Reserve a unique 12-char code BEFORE creating the builder so the
    // code -> uid mapping and the builder doc always land together.
    const claimCode = await reserveClaimCode(db, uid, builder.claimCode);
    const savedBuilder: PublicBuilder = { ...builder, claimCode };

    const userRef = db.collection('users').doc(uid);
    const builderRef = db.collection('builders').doc(uid);

    const result = await db.runTransaction(async (tx) => {
      const userDoc = await tx.get(userRef);
      if (userDoc.exists) {
        return { already: true, builder: null };
      }
      tx.set(userRef, { builderId: uid, createdAt: new Date().toISOString() });
      tx.set(builderRef, savedBuilder);
      return { already: false, builder: savedBuilder };
    });

    if (result.already) {
      return NextResponse.json({ error: 'This account has already claimed a Builder ID', id: uid }, { status: 409 });
    }

    return NextResponse.json({ id: uid, builder: result.builder }, { status: 201 });
  } catch (err) {
    console.error('Failed to claim builder', err);
    return NextResponse.json({ error: 'Failed to claim Builder ID. Please retry.' }, { status: 500 });
  }
}
