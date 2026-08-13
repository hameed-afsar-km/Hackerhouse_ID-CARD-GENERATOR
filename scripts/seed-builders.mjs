// Seeding tool for HH GOA 2026 Firebase registry.
//
//   node scripts/seed-builders.mjs          -> applies changes (deletes + uploads)
//   node scripts/seed-builders.mjs --dry    -> prints the plan without changing anything
//
// What it does:
//   1. Removes every builder EXCEPT the three named keepers (and their codes / user docs).
//   2. Ensures each kept builder has a unique 12-char alphanumeric claimCode mapped in `codes`.
//   3. Generates 30 fake members (full BuilderIdentity/PublicBuilder shape) and uploads them
//      to `builders` + `codes`.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const DRY = process.argv.includes('--dry');

// ---------------------------------------------------------------------------
// Replicated identity-generation logic (matches src/lib/builder-engine.ts)
// ---------------------------------------------------------------------------
function fnv1aHash(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function createPRNG(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BUILDER_TITLES = [
  'PROMPT WHISPERER', 'PIXEL WIZARD', 'API ARCHITECT', 'MERGE MASTER', 'STACK SAMURAI',
  'FRONTEND NINJA', 'BACKEND BEAST', 'CHAOS ENGINEER', 'TERMINAL NOMAD', 'CLOUD RIDER',
  'AI EXPLORER', 'MIDNIGHT BUILDER', 'CODE SURFER', 'DEPLOY CAPTAIN', 'LOCALHOST LEGEND',
  'SCHEMA SORCERER', 'RED EYE RIDER', 'CACHE COWBOY', 'GIT COMMANDER', 'SPRINT SLICER',
];

const HACK_MODES = [
  'SOLO SHIP', 'PAIR MODE', 'WEEKEND WARRIOR', 'RED EYE', 'VIM ENTHUSIAST',
  'RABBIT HOLE', 'DOCS DETECTIVE', 'LEGACY HACKER',
];

function generateBuilderTitle(seed) {
  return BUILDER_TITLES[Math.floor(createPRNG(seed)() * BUILDER_TITLES.length)];
}

function generateBuilderStats(seed) {
  const prng = createPRNG(seed);
  const int = (min, max) => Math.floor(min + prng() * (max - min + 1));
  return {
    energy: int(60, 99),
    coffeeLevel: int(55, 99),
    chaosIndex: int(40, 99),
    commitCount: int(100, 5000),
    sleepDebt: int(2, 12),
    hackMode: HACK_MODES[int(0, HACK_MODES.length - 1)],
    shipConfidence: int(55, 99),
  };
}

function generateBuilderNumber(seed) {
  const hex = seed.toString(16).toUpperCase().padStart(4, '0').slice(-4);
  return `HH-2026-${hex}`;
}

const CLAIM_CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const CLAIM_CODE_DIGITS = '23456789';

function generateClaimCode() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const letterOf = (n) => CLAIM_CODE_LETTERS[n % CLAIM_CODE_LETTERS.length];
  const digitOf = (n) => CLAIM_CODE_DIGITS[n % CLAIM_CODE_DIGITS.length];
  const digitCount = 3 + (bytes[0] % 3);
  const positions = Array.from({ length: 12 }, (_, i) => i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = bytes[i + 1] % (i + 1);
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  const isDigit = new Set(positions.slice(0, digitCount));
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += isDigit.has(i) ? digitOf(bytes[12 + i]) : letterOf(bytes[i + 1]);
  }
  return code;
}

function uniqueClaimCode(used) {
  let code = generateClaimCode();
  let guard = 0;
  while (used.has(code) && guard++ < 50) code = generateClaimCode();
  return code;
}

function sampleAvatarSvg(name, colorHex) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#FBF6E9"/>
    <rect x="24" y="24" width="352" height="352" fill="none" stroke="#1A2E22" stroke-width="10"/>
    <rect x="44" y="44" width="312" height="312" fill="${colorHex}" fill-opacity="0.22" stroke="#1A2E22" stroke-width="6"/>
    <text x="200" y="228" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="96" fill="#1A2E22" text-anchor="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const KEEP_NAMES = ['HAMEED AFSAR KM', 'MOHAMMED AADIL', 'MOHAMED SHAKEEL'];

// Canonical identities for the three keepers (mirrors src/lib/demo-builders.ts
// SAMPLE_BUILDERS). Used to recreate them in the registry if they don't exist yet.
const KEEPERS_CANONICAL = [
  {
    name: 'Mohammed Aadil',
    stack: ['AI', 'ROBOTICS', 'FULL STACK'],
    xUsername: 'aadil',
    preset: 'VIVID',
    color: '#0B6B3A',
    seed: fnv1aHash('Mohammed Aadil-ai'),
  },
  {
    name: 'Hameed Afsar KM',
    stack: ['FRONTEND', 'DESIGN', 'PRODUCT'],
    xUsername: 'hameedafsar',
    preset: 'WARM',
    color: '#FF007A',
    seed: fnv1aHash('Hameed Afsar KM-frontend'),
  },
  {
    name: 'Mohamed Shakeel',
    stack: ['BACKEND', 'CLOUD', 'CYBERSECURITY'],
    xUsername: 'shakeel',
    preset: 'DARK',
    color: '#FFE600',
    seed: fnv1aHash('Mohamed Shakeel-backend'),
  },
];

const FAKE_MEMBERS = [
  { name: 'Arjun Nair', stack: ['AI', 'DATA'], color: '#0B6B3A' },
  { name: 'Priya Sharma', stack: ['FRONTEND', 'DESIGN'], color: '#FF007A' },
  { name: 'Rahul Verma', stack: ['BACKEND', 'CLOUD'], color: '#2EC4B6' },
  { name: 'Sneha Kulkarni', stack: ['HARDWARE', 'ROBOTICS'], color: '#064E29' },
  { name: 'Vikram Singh', stack: ['CRYPTO', 'CYBERSECURITY'], color: '#FFE600' },
  { name: 'Ananya Iyer', stack: ['AI', 'ROBOTICS'], color: '#0B6B3A' },
  { name: 'Karthik Menon', stack: ['FULL STACK', 'AI'], color: '#FF007A' },
  { name: 'Divya Patel', stack: ['PRODUCT', 'FRONTEND'], color: '#2EC4B6' },
  { name: 'Rohit Desai', stack: ['CLOUD', 'BACKEND'], color: '#064E29' },
  { name: 'Meera Krishnan', stack: ['DESIGN', 'PRODUCT'], color: '#FFE600' },
  { name: 'Aditya Reddy', stack: ['AI', 'FULL STACK'], color: '#0B6B3A' },
  { name: 'Kavya Nambiar', stack: ['FRONTEND', 'BACKEND'], color: '#FF007A' },
  { name: 'Nikhil Rao', stack: ['DATA', 'AI'], color: '#2EC4B6' },
  { name: 'Sara Sheikh', stack: ['CYBERSECURITY', 'CLOUD'], color: '#064E29' },
  { name: 'Aman Kaur', stack: ['ROBOTICS', 'HARDWARE'], color: '#FFE600' },
  { name: 'Ritika Jain', stack: ['PRODUCT', 'DESIGN'], color: '#0B6B3A' },
  { name: 'Sanjay Pillai', stack: ['BACKEND', 'FULL STACK'], color: '#FF007A' },
  { name: 'Isha Das', stack: ['AI', 'PRODUCT'], color: '#2EC4B6' },
  { name: 'Farhan Khan', stack: ['CRYPTO', 'BACKEND'], color: '#064E29' },
  { name: 'Tanvi Joshi', stack: ['FRONTEND', 'PRODUCT'], color: '#FFE600' },
  { name: 'Deepak Malhotra', stack: ['CLOUD', 'HARDWARE'], color: '#0B6B3A' },
  { name: 'Neha Agarwal', stack: ['DESIGN', 'FRONTEND'], color: '#FF007A' },
  { name: 'Suresh Yadav', stack: ['ROBOTICS', 'AI'], color: '#2EC4B6' },
  { name: 'Pooja Bhatt', stack: ['CYBERSECURITY', 'AI'], color: '#064E29' },
  { name: 'Gautam Saxena', stack: ['FULL STACK', 'CLOUD'], color: '#FFE600' },
  { name: 'Lakshmi Nair', stack: ['DATA', 'BACKEND'], color: '#0B6B3A' },
  { name: 'Manish Gupta', stack: ['HARDWARE', 'FULL STACK'], color: '#FF007A' },
  { name: 'Zoya Ansari', stack: ['DESIGN', 'AI'], color: '#2EC4B6' },
  { name: 'Ravi Shastri', stack: ['PRODUCT', 'FULL STACK'], color: '#064E29' },
  { name: 'Anjali Mishra', stack: ['BACKEND', 'DATA'], color: '#FFE600' },
];

const PRESETS = ['RAW', 'VIVID', 'DARK', 'WARM'];

// ---------------------------------------------------------------------------
// Bootstrap Admin SDK
// ---------------------------------------------------------------------------
function findServiceAccount() {
  const fromEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  const files = readdirSync(process.cwd());
  const match = files.find((f) => f.includes('firebase-adminsdk') && f.endsWith('.json'));
  if (match) return join(process.cwd(), match);
  throw new Error('No Firebase service account JSON found. Set GOOGLE_APPLICATION_CREDENTIALS or drop the adminsdk JSON in the repo root.');
}

const serviceAccountPath = findServiceAccount();
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
const app = initializeApp({
  projectId: serviceAccount.project_id,
  credential: cert({ projectId: serviceAccount.project_id, clientEmail: serviceAccount.client_email, privateKey: serviceAccount.private_key }),
});
const db = getFirestore(app);

async function main() {
  console.log(`[seed] project=${serviceAccount.project_id}  mode=${DRY ? 'DRY-RUN (no changes)' : 'APPLY'}`);

  // --- read current state --------------------------------------------------
  const buildersSnap = await db.collection('builders').get();
  const codesSnap = await db.collection('codes').get();
  const usersSnap = await db.collection('users').get();

  const builders = buildersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const codes = codesSnap.docs.map((d) => ({ code: d.id, uid: d.data().uid }));
  const users = usersSnap.docs.map((d) => d.id);

  const codeByUid = new Map();
  for (const c of codes) {
    if (!codeByUid.has(c.uid)) codeByUid.set(c.uid, []);
    codeByUid.get(c.uid).push(c.code);
  }

  console.log(`[seed] existing builders=${builders.length}  codes=${codes.length}  users=${users.length}`);

  // --- decide keep / delete -------------------------------------------------
  const keep = builders.filter((b) => KEEP_NAMES.includes(String(b.name || '').trim().toUpperCase()));
  const keepIds = new Set(keep.map((b) => b.id));
  const toDelete = builders.filter((b) => !keepIds.has(b.id));

  console.log(`[seed] KEEP ${keep.length} builder(s):`);
  for (const b of keep) console.log(`   - ${b.name} (${b.id}) code=${b.claimCode || '(none)'}`);
  console.log(`[seed] DELETE ${toDelete.length} builder(s) + their codes/users:`);
  for (const b of toDelete) console.log(`   - ${b.name} (${b.id})`);

  // --- build keepers-that-are-missing + the 30 fake members ------------------
  const usedIds = new Set(builders.map((b) => b.id));
  const usedCodes = new Set(codes.map((c) => c.code));
  // reserve kept builders' existing codes so nothing regenerates into them
  for (const b of keep) if (b.claimCode) usedCodes.add(String(b.claimCode));

  const buildIdentity = (m, usedIds, usedCodes, idx) => {
    let seed = m.seed ?? fnv1aHash(`${m.name.toUpperCase()}|${m.stack.join('-')}`);
    let id = `builder_${seed.toString(16)}`;
    if (usedIds.has(id)) {
      seed = fnv1aHash(`${m.name.toUpperCase()}|${m.stack.join('-')}|${idx}`);
      id = `builder_${seed.toString(16)}`;
    }
    usedIds.add(id);
    const code = uniqueClaimCode(usedCodes);
    usedCodes.add(code);
    return {
      id,
      name: m.name,
      photoUrl: sampleAvatarSvg(m.name, m.color),
      stack: m.stack,
      xUsername: m.xUsername ?? m.name.split(' ')[0].toLowerCase(),
      photoSettings: { zoom: 1, panX: 0, panY: 0, preset: m.preset ?? PRESETS[idx % PRESETS.length] },
      builderNumber: generateBuilderNumber(seed),
      claimCode: code,
      title: generateBuilderTitle(seed),
      stats: generateBuilderStats(seed),
      createdAt: new Date().toISOString(),
    };
  };

  // keepers missing from the registry get recreated
  const existingKeepNames = new Set(keep.map((b) => String(b.name || '').trim().toUpperCase()));
  const keepersToCreate = KEEPERS_CANONICAL.filter((m) => !existingKeepNames.has(m.name.toUpperCase()));

  let idx = 0;
  const toUpload = [];
  for (const m of keepersToCreate) {
    const ident = buildIdentity(m, usedIds, usedCodes, idx++);
    toUpload.push(ident);
    console.log(`[seed] + KEEPER (missing, recreating) ${ident.name}  ${ident.builderNumber}  code=${ident.claimCode}`);
  }
  for (const m of FAKE_MEMBERS) {
    const ident = buildIdentity(m, usedIds, usedCodes, idx++);
    toUpload.push(ident);
    console.log(`[seed] + ${ident.name}  ${ident.title}  ${ident.builderNumber}  code=${ident.claimCode}  [${ident.stack.join('/')}]`);
  }

  console.log(`[seed] ${toUpload.length} builders to upload (${keepersToCreate.length} keeper(s) + ${FAKE_MEMBERS.length} fake members)`);

  // --- apply ----------------------------------------------------------------
  if (DRY) {
    console.log('\n[seed] dry-run complete — nothing changed.');
    process.exit(0);
  }

  let deleted = 0;
  for (const b of toDelete) {
    await db.collection('builders').doc(b.id).delete();
    deleted++;
    const owned = codeByUid.get(b.id) || [];
    for (const c of owned) await db.collection('codes').doc(c).delete();
    if (users.includes(b.id)) await db.collection('users').doc(b.id).delete();
  }

  // Ensure kept builders have a valid, uniquely-mapped claim code.
  for (const b of keep) {
    const ownedCodes = codeByUid.get(b.id) || [];
    const candidate = String(b.claimCode || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const code =
      candidate.length === 12 && (ownedCodes.includes(candidate) || !usedCodes.has(candidate))
        ? candidate
        : uniqueClaimCode(usedCodes);

    if (code !== candidate) {
      usedCodes.add(code);
      await db.collection('builders').doc(b.id).update({ claimCode: code });
    } else {
      usedCodes.add(code);
    }

    const ref = db.collection('codes').doc(code);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({ uid: b.id, createdAt: new Date().toISOString() });
    }
    console.log(`[seed] kept ${b.name} -> code ${code}`);
  }

  const batch = db.batch();
  for (const f of toUpload) {
    batch.set(db.collection('builders').doc(f.id), f);
    batch.set(db.collection('codes').doc(f.claimCode), { uid: f.id, createdAt: f.createdAt });
  }
  await batch.commit();

  console.log(`\n[seed] done. deleted=${deleted}  kept=${keep.length}  uploaded=${toUpload.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] FAILED:', err);
  process.exit(1);
});
