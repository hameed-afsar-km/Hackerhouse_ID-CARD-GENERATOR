import { BuilderIdentity, StackCategory, BuildMode, BuildEnergy } from '@/types/dna';
import { createBuilderIdentity } from './dna-engine';

const DEMO_NAMES = [
  'Mohammed Aadil',
  'Aarav Sharma',
  'Ananya Iyer',
  'Rohan Mehta',
  'Priya Nair',
  'Vikram Patel',
  'Tara Deshmukh',
  'Siddharth Rao',
  'Kavya Joshi',
  'AdITYA Kumar',
  'Diya Banerjee',
  'Neerav Sen',
  'Ishaan Verma',
  'Zoya Khan',
  'Kabir Sengupta',
  'Rhea Pillai',
  'Arjun Kulkarni',
  'Meera Menon',
  'Suryanansh Gupta',
  'Tanvi Hegde',
  'Devansh Bhat',
  'Simran Malhotra',
  'Pranav Sundaram',
  'Nisha Agarwal',
  'Yash Vardhan',
  'Avani Saxena',
  'Harsh Raghunath',
  'Sanika Nambiar',
  'Rahul Kapoor',
  'Pooja Choudhury',
  'Farhan Qureshi',
  'Kirti Trivedi',
  'Karan Johar',
  'Shruti Pandey',
  'Samarth Nanda',
  'Natasha Roy',
  'Gaurav Shetty',
  'Sonakshi Dave',
  'Utkarsh Mishra',
  'Shreya Dutta',
];

const STACK_GROUPS: StackCategory[][] = [
  ['AI', 'ROBOTICS'],
  ['AI', 'DATA'],
  ['FRONTEND', 'DESIGN'],
  ['BACKEND', 'CLOUD'],
  ['HARDWARE', 'ROBOTICS'],
  ['CRYPTO', 'CYBERSECURITY'],
  ['PRODUCT', 'FRONTEND'],
  ['FULL STACK', 'AI'],
  ['CLOUD', 'BACKEND'],
  ['DESIGN', 'PRODUCT'],
];

const MODES: BuildMode[] = ['SHIP', 'BREAK', 'EXPLORE', 'DESIGN', 'AUTOMATE', 'SCALE'];
const ENERGIES: BuildEnergy[] = ['FAST', 'DEEP', 'WEIRD', 'RELENTLESS', 'EXPERIMENTAL'];

// SVG default avatar generator (data URL) so demo builders render clean graphics if no photo uploaded
export function createSampleAvatarSvg(name: string, colorHex: string): string {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#0A0A0B"/>
    <circle cx="200" cy="200" r="180" fill="none" stroke="${colorHex}" stroke-width="2" stroke-dasharray="10 6"/>
    <circle cx="200" cy="200" r="120" fill="${colorHex}" fill-opacity="0.1" stroke="${colorHex}" stroke-width="1.5"/>
    <text x="200" y="220" font-family="monospace" font-weight="bold" font-size="72" fill="#FFFFFF" text-anchor="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateDemoBuilders(count = 247): BuilderIdentity[] {
  const list: BuilderIdentity[] = [];
  const accentColors = ['#00FF66', '#00E5FF', '#FFD600', '#FF2E63', '#A855F7'];

  for (let i = 0; i < count; i++) {
    const name = DEMO_NAMES[i % DEMO_NAMES.length] + (i >= DEMO_NAMES.length ? ` #${i + 1}` : '');
    const stack = STACK_GROUPS[i % STACK_GROUPS.length];
    const mode = MODES[i % MODES.length];
    const energy = ENERGIES[i % ENERGIES.length];
    const color = accentColors[i % accentColors.length];

    const identity = createBuilderIdentity({
      name,
      photoUrl: createSampleAvatarSvg(name, color),
      stack,
      buildMode: mode,
      buildEnergy: energy,
      photoSettings: { zoom: 1, panX: 0, panY: 0, preset: 'RAW' },
    });

    // Calculate cluster position on constellation (radar)
    // Cluster by primary stack category angle
    let angle = 0;
    const primaryStack = stack[0];
    switch (primaryStack) {
      case 'AI':
      case 'DATA':
        angle = Math.PI * 0.15;
        break;
      case 'ROBOTICS':
      case 'HARDWARE':
        angle = Math.PI * 0.65;
        break;
      case 'FRONTEND':
      case 'DESIGN':
        angle = Math.PI * 1.15;
        break;
      case 'BACKEND':
      case 'CLOUD':
        angle = Math.PI * 1.65;
        break;
      default:
        angle = (i / count) * Math.PI * 2;
    }

    const radiusOffset = 80 + (i % 18) * 16 + (Math.sin(i * 3.7) * 40);
    const spreadAngle = angle + (Math.cos(i * 1.3) * 0.45);
    const x = Math.cos(spreadAngle) * radiusOffset;
    const y = Math.sin(spreadAngle) * radiusOffset;

    identity.clusterPos = { x, y };
    list.push(identity);
  }

  return list;
}

export const SAMPLE_BUILDERS: BuilderIdentity[] = [
  createBuilderIdentity({
    name: 'Mohammed Aadil',
    photoUrl: createSampleAvatarSvg('Mohammed Aadil', '#00FF66'),
    stack: ['AI', 'ROBOTICS', 'FULL STACK'],
    buildMode: 'SHIP',
    buildEnergy: 'EXPERIMENTAL',
    photoSettings: { zoom: 1, panX: 0, panY: 0, preset: 'MATRIX' },
  }),
  createBuilderIdentity({
    name: 'Ananya Iyer',
    photoUrl: createSampleAvatarSvg('Ananya Iyer', '#00E5FF'),
    stack: ['FRONTEND', 'DESIGN', 'PRODUCT'],
    buildMode: 'DESIGN',
    buildEnergy: 'FAST',
    photoSettings: { zoom: 1, panX: 0, panY: 0, preset: 'DUOTONE' },
  }),
  createBuilderIdentity({
    name: 'Vikram Patel',
    photoUrl: createSampleAvatarSvg('Vikram Patel', '#FFD600'),
    stack: ['HARDWARE', 'ROBOTICS'],
    buildMode: 'BREAK',
    buildEnergy: 'RELENTLESS',
    photoSettings: { zoom: 1, panX: 0, panY: 0, preset: 'RAW' },
  }),
  createBuilderIdentity({
    name: 'Siddharth Rao',
    photoUrl: createSampleAvatarSvg('Siddharth Rao', '#FF2E63'),
    stack: ['BACKEND', 'CLOUD', 'CYBERSECURITY'],
    buildMode: 'AUTOMATE',
    buildEnergy: 'DEEP',
    photoSettings: { zoom: 1, panX: 0, panY: 0, preset: 'SIGNAL' },
  }),
];
