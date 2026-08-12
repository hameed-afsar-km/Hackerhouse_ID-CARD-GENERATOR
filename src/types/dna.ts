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

export type BuildMode = 'SHIP' | 'BREAK' | 'EXPLORE' | 'DESIGN' | 'AUTOMATE' | 'SCALE';

export type BuildEnergy = 'FAST' | 'DEEP' | 'WEIRD' | 'RELENTLESS' | 'EXPERIMENTAL';

export interface PhotoFilterSettings {
  zoom: number; // 1 to 2
  panX: number; // -50 to 50
  panY: number; // -50 to 50
  preset: 'RAW' | 'DUOTONE' | 'MATRIX' | 'NOIR' | 'SIGNAL';
}

export interface BuilderInput {
  name: string;
  photoUrl: string; // Base64 or object URL
  stack: StackCategory[];
  buildMode: BuildMode;
  buildEnergy: BuildEnergy;
  photoSettings: PhotoFilterSettings;
}

export interface BuilderStats {
  ship: number;
  create: number;
  breakScore: number;
  explore: number;
  signal: number;
}

export interface BuilderIdentity {
  id: string;
  name: string;
  photoUrl: string;
  stack: StackCategory[];
  buildMode: BuildMode;
  buildEnergy: BuildEnergy;
  photoSettings: PhotoFilterSettings;
  dnaHash: string; // e.g. DNA // 7F-29-A1-C4
  title: string; // e.g. THE SYSTEM SHIPPER
  stats: BuilderStats;
  createdAt: string;
  clusterPos?: { x: number; y: number };
}

export interface TeamIdentity {
  id: string;
  teamName: string;
  members: BuilderIdentity[];
  teamTitle: string; // e.g. THE FULL-STACK COLLECTIVE
  teamDnaHash: string;
  combinedStack: StackCategory[];
  createdAt: string;
}
