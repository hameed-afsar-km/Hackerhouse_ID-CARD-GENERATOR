import { BuilderInput, BuilderIdentity, BuilderStats, StackCategory } from '@/types/builder';

// FNV-1a Hashing function to turn a string input into a 32-bit unsigned integer
export function fnv1aHash(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

// Mulberry32 Pseudo-Random Number Generator based on seed
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fun randomized builder titles — rolled fresh on every generation
export const BUILDER_TITLES: string[] = [
  'PROMPT WHISPERER',
  'PIXEL WIZARD',
  'API ARCHITECT',
  'MERGE MASTER',
  'STACK SAMURAI',
  'FRONTEND NINJA',
  'BACKEND BEAST',
  'CHAOS ENGINEER',
  'TERMINAL NOMAD',
  'CLOUD RIDER',
  'AI EXPLORER',
  'MIDNIGHT BUILDER',
  'CODE SURFER',
  'DEPLOY CAPTAIN',
  'LOCALHOST LEGEND',
  'SCHEMA SORCERER',
  'RED EYE RIDER',
  'CACHE COWBOY',
  'GIT COMMANDER',
  'SPRINT SLICER',
];

// Playful hack modes for the stats strip
export const HACK_MODES: string[] = [
  'SOLO SHIP',
  'PAIR MODE',
  'WEEKEND WARRIOR',
  'RED EYE',
  'VIM ENTHUSIAST',
  'RABBIT HOLE',
  'DOCS DETECTIVE',
  'LEGACY HACKER',
];

export function generateBuilderTitle(seed: number): string {
  const prng = createPRNG(seed);
  const index = Math.floor(prng() * BUILDER_TITLES.length);
  return BUILDER_TITLES[index];
}

// Generate random playful builder stats (purely visual)
export function generateBuilderStats(seed: number): BuilderStats {
  const prng = createPRNG(seed);
  const int = (min: number, max: number) => Math.floor(min + prng() * (max - min + 1));

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

// Generate a builder number like HH-2026-7F3A
export function generateBuilderNumber(seed: number): string {
  const hex = seed.toString(16).toUpperCase().padStart(4, '0').slice(-4);
  return `HH-2026-${hex}`;
}

// Unique 12-char public code printed on the card in place of a QR code.
// No ambiguous characters (0/O, 1/I/L) so it is easy to read out loud.
// Always a random alphanumeric mix — every code contains both letters and digits.
const CLAIM_CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const CLAIM_CODE_DIGITS = '23456789';

export function generateClaimCode(length = 12): string {
  const bytes = new Uint8Array(length * 2);
  crypto.getRandomValues(bytes);

  const letterOf = (n: number) => CLAIM_CODE_LETTERS[n % CLAIM_CODE_LETTERS.length];
  const digitOf = (n: number) => CLAIM_CODE_DIGITS[n % CLAIM_CODE_DIGITS.length];

  // Place 3-5 digits at random positions so every code is a mixed alphanumeric combo.
  const digitCount = 3 + (bytes[0] % 3);
  const positions = Array.from({ length }, (_, i) => i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = bytes[i + 1] % (i + 1);
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  const isDigit = new Set(positions.slice(0, digitCount));

  let code = '';
  for (let i = 0; i < length; i++) {
    code += isDigit.has(i) ? digitOf(bytes[length + i]) : letterOf(bytes[i + 1]);
  }
  return code;
}

// Display grouping: 7F3A9X2CKQ4M -> "7F3A 9X2C KQ4M"
export function formatClaimCode(code: string): string {
  return code.replace(/\s+/g, '').toUpperCase().match(/.{1,4}/g)?.join(' ') ?? code;
}

// Backwards-compatible fallback so older stored builders always show a code.
export function resolveClaimCode(code: string | undefined, fallback = ''): string {
  const source = code || fallback;
  const cleaned = source.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (cleaned.length === 12) return cleaned;
  return (cleaned + 'ABCDEFGHJKLMNPQ').slice(0, 12);
}

// Main function to build a complete HH Goa Builder Identity
export function createBuilderIdentity(input: BuilderInput): BuilderIdentity {
  const seed =
    input.seed ??
    fnv1aHash(
      `${input.name.trim().toUpperCase()}-${input.stack.sort().join('-')}-${Date.now()}`
    );

  const title = generateBuilderTitle(seed);
  const stats = generateBuilderStats(seed);
  const builderNumber = generateBuilderNumber(seed);
  const id = `builder_${seed.toString(16)}`;

  return {
    id,
    name: input.name.trim(),
    photoUrl: input.photoUrl,
    stack: input.stack,
    xUsername: input.xUsername ? input.xUsername.replace(/^@/, '').trim() : undefined,
    photoSettings: input.photoSettings || { zoom: 1, panX: 0, panY: 0, preset: 'RAW' },
    builderNumber,
    claimCode: generateClaimCode(),
    title,
    stats,
    createdAt: new Date().toISOString(),
  };
}

// Combine members into a deterministic team pass number (used by team frames)
export function generateTeamPassNumber(seed: number): string {
  const hex = seed.toString(16).toUpperCase().padStart(4, '0').slice(-4);
  return `TP-2026-${hex}`;
}

export type { StackCategory };
