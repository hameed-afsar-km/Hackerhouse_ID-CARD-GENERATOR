import { BuilderIdentity, StackCategory } from '@/types/builder';
import { createBuilderIdentity, fnv1aHash } from './builder-engine';

const DEMO_NAMES = [
  'Hameed Afsar KM',
  'Mohammed Aadil',
  'Mohamed Shakeel',
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

const ACCENT_COLORS = ['#0B6B3A', '#FFE600', '#FF007A', '#2EC4B6', '#064E29'];

// SVG default avatar generator (data URL) so demo builders render clean graphics if no photo uploaded
export function createSampleAvatarSvg(name: string, colorHex: string): string {
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

export function generateDemoBuilders(count = 247): BuilderIdentity[] {
  const list: BuilderIdentity[] = [];

  for (let i = 0; i < count; i++) {
    const name = DEMO_NAMES[i % DEMO_NAMES.length] + (i >= DEMO_NAMES.length ? ` #${i + 1}` : '');
    const stack = STACK_GROUPS[i % STACK_GROUPS.length];
    const color = ACCENT_COLORS[i % ACCENT_COLORS.length];

    const identity = createBuilderIdentity({
      name,
      photoUrl: createSampleAvatarSvg(name, color),
      stack,
      xUsername: name.split(' ')[0].toLowerCase(),
      photoSettings: { zoom: 1, panX: 0, panY: 0, preset: 'RAW' },
      seed: fnv1aHash(name + stack.join('')),
    });

    // Calculate cluster position on the gallery map (clustered by primary stack)
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

    const radiusOffset = 80 + (i % 18) * 16 + Math.sin(i * 3.7) * 40;
    const spreadAngle = angle + Math.cos(i * 1.3) * 0.45;
    const x = Math.cos(spreadAngle) * radiusOffset;
    const y = Math.sin(spreadAngle) * radiusOffset;

    identity.clusterPos = { x, y };
    list.push(identity);
  }

  return list;
}

export const SAMPLE_BUILDERS: BuilderIdentity[] = [
  createBuilderIdentity({
    name: 'Hameed Afsar KM',
    photoUrl: createSampleAvatarSvg('Hameed Afsar KM', '#FF007A'),
    stack: ['FRONTEND', 'DESIGN', 'PRODUCT'],
    xUsername: 'hameedafsar',
    photoSettings: { zoom: 1, panX: 0, panY: 0, preset: 'WARM' },
    seed: fnv1aHash('Hameed Afsar KM-frontend'),
  }),
  createBuilderIdentity({
    name: 'Mohammed Aadil',
    photoUrl: createSampleAvatarSvg('Mohammed Aadil', '#0B6B3A'),
    stack: ['AI', 'ROBOTICS', 'FULL STACK'],
    xUsername: 'aadil',
    photoSettings: { zoom: 1, panX: 0, panY: 0, preset: 'VIVID' },
    seed: fnv1aHash('Mohammed Aadil-ai'),
  }),
  createBuilderIdentity({
    name: 'Mohamed Shakeel',
    photoUrl: createSampleAvatarSvg('Mohamed Shakeel', '#FFE600'),
    stack: ['BACKEND', 'CLOUD', 'CYBERSECURITY'],
    xUsername: 'shakeel',
    photoSettings: { zoom: 1, panX: 0, panY: 0, preset: 'DARK' },
    seed: fnv1aHash('Mohamed Shakeel-backend'),
  }),
];
