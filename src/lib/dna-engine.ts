import { BuilderInput, BuilderIdentity, BuilderStats, StackCategory, BuildMode, BuildEnergy } from '@/types/dna';

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

// Generate human-readable DNA Hash string: DNA // XX-XX-XX-XX
export function generateDNAHash(seed: number): string {
  const hex = seed.toString(16).toUpperCase().padStart(8, '0');
  const p1 = hex.substring(0, 2);
  const p2 = hex.substring(2, 4);
  const p3 = hex.substring(4, 6);
  const p4 = hex.substring(6, 8);
  return `DNA // ${p1}-${p2}-${p3}-${p4}`;
}

// Title Matrix dictionary
const TITLE_RULES: Array<{
  stacks?: StackCategory[];
  modes?: BuildMode[];
  energies?: BuildEnergy[];
  title: string;
}> = [
  { stacks: ['AI', 'ROBOTICS'], title: 'THE MODEL WHISPERER' },
  { stacks: ['AI', 'DATA'], title: 'THE DATA ALCHEMIST' },
  { stacks: ['HARDWARE', 'ROBOTICS'], title: 'THE ROBOT MAKER' },
  { stacks: ['HARDWARE'], title: 'THE HARDWARE HACKER' },
  { stacks: ['FRONTEND', 'DESIGN'], title: 'THE PIXEL HACKER' },
  { stacks: ['PRODUCT', 'DESIGN'], title: 'THE IDEA FORGER' },
  { stacks: ['BACKEND', 'CLOUD'], title: 'THE SYSTEM SHIPPER' },
  { stacks: ['CYBERSECURITY'], title: 'THE CYBER PHANTOM' },
  { stacks: ['CRYPTO'], title: 'THE PROTOCOL ARCHITECT' },
  { stacks: ['FULL STACK'], modes: ['SHIP'], title: 'THE PRODUCT SHIPPER' },
  { stacks: ['FULL STACK'], modes: ['BREAK'], title: 'THE CHAOS ENGINEER' },
  { stacks: ['ROBOTICS'], modes: ['AUTOMATE'], title: 'THE MACHINE MAKER' },
  { modes: ['BREAK'], energies: ['WEIRD'], title: 'THE STACK BREAKER' },
  { modes: ['EXPLORE'], energies: ['EXPERIMENTAL'], title: 'THE CODE CARTOGRAPHER' },
  { modes: ['SHIP'], energies: ['RELENTLESS'], title: 'THE SIGNAL ARCHITECT' },
  { stacks: ['DESIGN'], title: 'THE VISUAL CONDUCTOR' },
  { stacks: ['CLOUD'], title: 'THE INFRASTRUCTURE TITAN' },
];

const FALLBACK_TITLES = [
  'THE SIGNAL ARCHITECT',
  'THE CHAOS ENGINEER',
  'THE SYSTEM SHIPPER',
  'THE CODE CARTOGRAPHER',
  'THE PRODUCT LAUNCHER',
  'THE STACK BREAKER',
  'THE IDEA FORGER',
  'THE CIRCUIT BUILDER',
  'THE PROTOCOL DISRUPTOR',
  'THE SYNTACTIC SHAPER',
];

export function generateBuilderTitle(
  stack: StackCategory[],
  mode: BuildMode,
  energy: BuildEnergy,
  seed: number
): string {
  // Try rule matching
  for (const rule of TITLE_RULES) {
    const stackMatch = !rule.stacks || rule.stacks.some((s) => stack.includes(s));
    const modeMatch = !rule.modes || rule.modes.includes(mode);
    const energyMatch = !rule.energies || rule.energies.includes(energy);

    if (stackMatch && modeMatch && energyMatch) {
      return rule.title;
    }
  }

  // Fallback to deterministic pick from FALLBACK_TITLES
  const prng = createPRNG(seed);
  const index = Math.floor(prng() * FALLBACK_TITLES.length);
  return FALLBACK_TITLES[index];
}

// Generate deterministic stats (60-99)
export function generateBuilderStats(seed: number, mode: BuildMode, energy: BuildEnergy): BuilderStats {
  const prng = createPRNG(seed);

  let shipBonus = 0;
  let createBonus = 0;
  let breakBonus = 0;
  let exploreBonus = 0;
  let signalBonus = 0;

  if (mode === 'SHIP') shipBonus += 10;
  if (mode === 'BREAK') breakBonus += 12;
  if (mode === 'EXPLORE') exploreBonus += 10;
  if (mode === 'DESIGN') createBonus += 10;
  if (mode === 'AUTOMATE') signalBonus += 10;
  if (mode === 'SCALE') shipBonus += 8;

  if (energy === 'FAST') shipBonus += 5;
  if (energy === 'DEEP') signalBonus += 8;
  if (energy === 'WEIRD') breakBonus += 8;
  if (energy === 'RELENTLESS') shipBonus += 8;
  if (energy === 'EXPERIMENTAL') exploreBonus += 10;

  return {
    ship: Math.min(99, Math.max(65, Math.floor(68 + prng() * 22 + shipBonus))),
    create: Math.min(99, Math.max(65, Math.floor(66 + prng() * 23 + createBonus))),
    breakScore: Math.min(99, Math.max(60, Math.floor(62 + prng() * 25 + breakBonus))),
    explore: Math.min(99, Math.max(65, Math.floor(67 + prng() * 22 + exploreBonus))),
    signal: Math.min(99, Math.max(70, Math.floor(72 + prng() * 20 + signalBonus))),
  };
}

// Main function to decode input into complete BuilderIdentity
export function createBuilderIdentity(input: BuilderInput): BuilderIdentity {
  const seedString = `${input.name.toUpperCase().trim()}-${input.stack.sort().join('-')}-${input.buildMode}-${input.buildEnergy}`;
  const seed = fnv1aHash(seedString);
  const dnaHash = generateDNAHash(seed);
  const title = generateBuilderTitle(input.stack, input.buildMode, input.buildEnergy, seed);
  const stats = generateBuilderStats(seed, input.buildMode, input.buildEnergy);
  const id = `builder_${seed.toString(16)}`;

  return {
    id,
    name: input.name.trim(),
    photoUrl: input.photoUrl,
    stack: input.stack,
    buildMode: input.buildMode,
    buildEnergy: input.buildEnergy,
    photoSettings: input.photoSettings || { zoom: 1, panX: 0, panY: 0, preset: 'RAW' },
    dnaHash,
    title,
    stats,
    createdAt: new Date().toISOString(),
  };
}
