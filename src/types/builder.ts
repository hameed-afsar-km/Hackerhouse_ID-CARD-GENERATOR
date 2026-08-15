export type StackCategory =
  | 'AI'
  | 'FULL STACK'
  | 'FRONTEND'
  | 'BACKEND'
  | 'ROBOTICS'
  | 'HARDWARE'
  | 'DESIGN'
  | 'DATA'
  | 'CYBERSECURITY'
  | 'CLOUD'
  | 'CRYPTO'
  | 'PRODUCT'
  | 'OTHER';

export type PhotoPreset = 'RAW' | 'VIVID' | 'DARK' | 'WARM';
export type CardTheme = 'TROPICAL' | 'SUNSET' | 'CYBER' | 'OBSIDIAN' | 'HOLOGRAPHIC' | 'MINIMAL';
export type FrameStyle = 'WREATH' | 'SUNBURST' | 'NEON' | 'CIRCUIT' | 'HOLO' | 'OBSIDIAN' | 'MINIMAL';
export type CardBackground = 'NIGHT' | 'SUNSET' | 'FOREST' | 'CYBER';

export interface PhotoFilterSettings {
  zoom: number; // 1 to 2
  panX: number; // -50 to 50
  panY: number; // -50 to 50
  preset: PhotoPreset;
  cardTheme?: CardTheme;
  frameStyle?: FrameStyle;
  cardBackground?: CardBackground;
}

export interface BuilderInput {
  name: string;
  photoUrl: string; // Base64, data URL, or object URL
  stack: StackCategory[];
  xUsername?: string; // optional @handle
  photoSettings: PhotoFilterSettings;
  seed?: number; // optional seed for deterministic generation
  title?: string; // optional title override; otherwise rolled from the seed
}

export interface BuilderStats {
  energy: number; // BUILDER ENERGY
  coffeeLevel: number; // COFFEE LEVEL
  chaosIndex: number; // CHAOS INDEX
  commitCount: number; // COMMIT COUNT
  sleepDebt: number; // SLEEP DEBT (hours)
  hackMode: string; // HACK MODE
  shipConfidence: number; // SHIP CONFIDENCE
}

export interface BuilderIdentity {
  id: string;
  name: string;
  photoUrl: string;
  stack: StackCategory[];
  xUsername?: string;
  photoSettings: PhotoFilterSettings;
  builderNumber: string; // e.g. HH-2026-7F3A
  claimCode: string; // unique 12-char public code (printed on the card instead of a QR)
  title: string; // e.g. PROMPT WHISPERER
  stats: BuilderStats;
  createdAt: string;
  clusterPos?: { x: number; y: number };
}

// Public profile stored in Firestore and readable by anyone.
// Excludes private/derived fields like clusterPos. photoSettings is kept
// (non-sensitive crop framing) so public pages render identically.
export interface PublicBuilder {
  id: string;
  name: string;
  photoUrl: string;
  stack: StackCategory[];
  xUsername?: string;
  photoSettings: PhotoFilterSettings;
  builderNumber: string;
  claimCode: string; // unique 12-char public code (searchable from the gallery)
  title: string;
  stats: BuilderStats;
  createdAt: string;
}

export interface TeamIdentity {
  id: string;
  teamName: string;
  members: BuilderIdentity[];
  teamTitle: string; // e.g. THE FULL-STACK COLLECTIVE
  teamPassNumber: string; // e.g. TP-2026-9C21
  combinedStack: StackCategory[];
  createdAt: string;
}
