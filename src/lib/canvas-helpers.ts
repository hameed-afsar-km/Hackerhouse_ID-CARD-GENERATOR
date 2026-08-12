import { BuilderIdentity } from '@/types/dna';
import { createPRNG, fnv1aHash } from './dna-engine';

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 1600;

export async function drawBuilderDNAIdentity(
  canvas: HTMLCanvasElement,
  builder: BuilderIdentity
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const seed = fnv1aHash(builder.dnaHash + builder.name);
  const prng = createPRNG(seed);

  // 1. BACKGROUND
  ctx.fillStyle = '#050506';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Background Grid Lines
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // Generative background particles & signal connections
  const particleCount = 40 + Math.floor(prng() * 30);
  const particles: Array<{ x: number; y: number; r: number; color: string }> = [];
  const palette = ['#00FF66', '#00E5FF', '#FFD600', '#FF2E63', '#FFFFFF'];

  for (let i = 0; i < particleCount; i++) {
    const x = prng() * CANVAS_WIDTH;
    const y = prng() * CANVAS_HEIGHT;
    const r = 2 + prng() * 4;
    const color = palette[Math.floor(prng() * palette.length)];
    particles.push({ x, y, r, color });

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw signal connection lines between close particles
  ctx.lineWidth = 0.8;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        const opacity = (1 - dist / 180) * 0.25;
        ctx.strokeStyle = `rgba(0, 255, 102, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  // 2. HEADER BLOCK
  // Top Banner Pill
  ctx.fillStyle = '#00FF66';
  ctx.fillRect(80, 70, 16, 48);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 36px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('HACKER HOUSE GOA 2026', 112, 105);

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '500 22px monospace';
  ctx.fillText('GOA, INDIA · 28—31 OCT 2026', 112, 138);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#00FF66';
  ctx.font = '700 22px monospace';
  ctx.fillText('LESS NOISE. MORE SIGNAL.', CANVAS_WIDTH - 80, 105);

  ctx.fillStyle = '#71717A';
  ctx.font = '500 20px monospace';
  ctx.fillText('BUILDER IDENTITY ENGINE', CANVAS_WIDTH - 80, 138);

  // Divider Line
  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 165);
  ctx.lineTo(CANVAS_WIDTH - 80, 165);
  ctx.stroke();

  // 3. PHOTO FRAME & GENERATIVE RETICLE (Center Y: ~440)
  const frameCenterX = CANVAS_WIDTH / 2;
  const frameCenterY = 460;
  const photoSize = 440;

  // Outer Reticle Circles
  ctx.strokeStyle = 'rgba(0, 255, 102, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(frameCenterX, frameCenterY, photoSize / 2 + 30, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
  ctx.setLineDash([8, 12]);
  ctx.beginPath();
  ctx.arc(frameCenterX, frameCenterY, photoSize / 2 + 50, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Technical Corner Marks
  const boxX = frameCenterX - photoSize / 2 - 15;
  const boxY = frameCenterY - photoSize / 2 - 15;
  const boxS = photoSize + 30;
  const markL = 30;

  ctx.strokeStyle = '#00FF66';
  ctx.lineWidth = 3;
  // Top Left
  ctx.beginPath();
  ctx.moveTo(boxX, boxY + markL); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + markL, boxY);
  ctx.stroke();
  // Top Right
  ctx.beginPath();
  ctx.moveTo(boxX + boxS - markL, boxY); ctx.lineTo(boxX + boxS, boxY); ctx.lineTo(boxX + boxS, boxY + markL);
  ctx.stroke();
  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(boxX, boxY + boxS - markL); ctx.lineTo(boxX, boxY + boxS); ctx.lineTo(boxX + markL, boxY + boxS);
  ctx.stroke();
  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(boxX + boxS - markL, boxY + boxS); ctx.lineTo(boxX + boxS, boxY + boxS); ctx.lineTo(boxX + boxS, boxY + boxS - markL);
  ctx.stroke();

  // Load and draw user photo
  if (builder.photoUrl) {
    try {
      const img = await loadImage(builder.photoUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(frameCenterX, frameCenterY, photoSize / 2, 0, Math.PI * 2);
      ctx.clip();

      const settings = builder.photoSettings || { zoom: 1, panX: 0, panY: 0, preset: 'RAW' };
      const zoom = settings.zoom || 1;
      const panX = ((settings.panX || 0) / 100) * photoSize;
      const panY = ((settings.panY || 0) / 100) * photoSize;

      // Smart cover aspect ratio
      const imgRatio = img.width / img.height;
      let drawW = photoSize * zoom;
      let drawH = photoSize * zoom;

      if (imgRatio > 1) {
        drawW = photoSize * imgRatio * zoom;
      } else {
        drawH = (photoSize / imgRatio) * zoom;
      }

      const drawX = frameCenterX - drawW / 2 + panX;
      const drawY = frameCenterY - drawH / 2 + panY;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Apply preset filter overlay
      if (settings.preset === 'MATRIX') {
        ctx.fillStyle = 'rgba(0, 255, 102, 0.25)';
        ctx.globalCompositeOperation = 'color';
        ctx.fillRect(frameCenterX - photoSize / 2, frameCenterY - photoSize / 2, photoSize, photoSize);
      } else if (settings.preset === 'DUOTONE') {
        ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(frameCenterX - photoSize / 2, frameCenterY - photoSize / 2, photoSize, photoSize);
      } else if (settings.preset === 'SIGNAL') {
        ctx.fillStyle = 'rgba(255, 46, 99, 0.2)';
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(frameCenterX - photoSize / 2, frameCenterY - photoSize / 2, photoSize, photoSize);
      }
      ctx.restore();
    } catch (e) {
      console.warn('Failed to load builder photo for canvas render', e);
    }
  }

  // 4. BUILDER DETAILS SECTION (Y: 740+)
  let currentY = 760;

  // DNA Seed Badge
  ctx.fillStyle = '#18181B';
  ctx.fillRect(80, currentY, 320, 44);
  ctx.strokeStyle = '#00FF66';
  ctx.lineWidth = 1;
  ctx.strokeRect(80, currentY, 320, 44);

  ctx.fillStyle = '#00FF66';
  ctx.font = '700 22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(builder.dnaHash, 240, currentY + 30);

  // BUILD MODE & ENERGY TAGS
  ctx.fillStyle = '#0D0D0E';
  ctx.fillRect(CANVAS_WIDTH - 400, currentY, 320, 44);
  ctx.strokeStyle = '#3F3F46';
  ctx.strokeRect(CANVAS_WIDTH - 400, currentY, 320, 44);

  ctx.fillStyle = '#E4E4E7';
  ctx.font = '600 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${builder.buildMode} // ${builder.buildEnergy}`, CANVAS_WIDTH - 240, currentY + 28);

  currentY += 100;

  // BUILDER NAME
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(builder.name.toUpperCase(), CANVAS_WIDTH / 2, currentY);

  currentY += 60;

  // BUILDER TITLE BOX
  const titleText = builder.title.toUpperCase();
  ctx.font = '800 32px monospace';
  const titleWidth = ctx.measureText(titleText).width + 60;

  ctx.fillStyle = '#00FF66';
  ctx.fillRect(CANVAS_WIDTH / 2 - titleWidth / 2, currentY, titleWidth, 54);

  ctx.fillStyle = '#050506';
  ctx.textAlign = 'center';
  ctx.fillText(titleText, CANVAS_WIDTH / 2, currentY + 38);

  currentY += 90;

  // STACK BADGES
  const stackList = builder.stack;
  ctx.font = '700 20px monospace';
  let totalStackWidth = 0;
  const padding = 24;
  const itemWidths: number[] = [];

  stackList.forEach((st) => {
    const w = ctx.measureText(st).width + padding * 2;
    itemWidths.push(w);
    totalStackWidth += w + 16;
  });
  totalStackWidth -= 16;

  let startX = CANVAS_WIDTH / 2 - totalStackWidth / 2;
  stackList.forEach((st, idx) => {
    const w = itemWidths[idx];
    ctx.fillStyle = '#18181B';
    ctx.fillRect(startX, currentY, w, 42);
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, currentY, w, 42);

    ctx.fillStyle = '#00E5FF';
    ctx.textAlign = 'center';
    ctx.fillText(st, startX + w / 2, currentY + 28);
    startX += w + 16;
  });

  currentY += 90;

  // 5. BUILDER STATS MATRIX (Y: 1100+)
  ctx.strokeStyle = '#27272A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, currentY);
  ctx.lineTo(CANVAS_WIDTH - 80, currentY);
  ctx.stroke();

  currentY += 40;

  ctx.fillStyle = '#71717A';
  ctx.font = '700 20px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SIGNAL ATTRIBUTES // BUILD DNA SPECTRUM', 80, currentY);

  currentY += 40;

  const statItems: Array<{ label: string; val: number }> = [
    { label: 'SHIP', val: builder.stats.ship },
    { label: 'CREATE', val: builder.stats.create },
    { label: 'BREAK', val: builder.stats.breakScore },
    { label: 'EXPLORE', val: builder.stats.explore },
    { label: 'SIGNAL', val: builder.stats.signal },
  ];

  const colW = (CANVAS_WIDTH - 160) / 5;
  statItems.forEach((st, idx) => {
    const cx = 80 + idx * colW;
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '700 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(st.label, cx, currentY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px monospace';
    ctx.fillText(`${st.val}`, cx, currentY + 42);

    // Meter Bar
    const meterW = colW - 30;
    const fillW = (st.val / 100) * meterW;

    ctx.fillStyle = '#27272A';
    ctx.fillRect(cx, currentY + 54, meterW, 8);

    ctx.fillStyle = idx % 2 === 0 ? '#00FF66' : '#00E5FF';
    ctx.fillRect(cx, currentY + 54, fillW, 8);
  });

  currentY += 130;

  // 6. FOOTER & HASHTAG #FrameInGoa (Y: 1400+)
  ctx.fillStyle = '#0F0F12';
  ctx.fillRect(80, currentY, CANVAS_WIDTH - 160, 160);
  ctx.strokeStyle = '#00FF66';
  ctx.lineWidth = 2;
  ctx.strokeRect(80, currentY, CANVAS_WIDTH - 160, 160);

  // Left side hashtag
  ctx.fillStyle = '#00FF66';
  ctx.font = '900 52px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('#FrameInGoa', 120, currentY + 95);

  // Right side verification seal
  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 24px monospace';
  ctx.fillText('VERIFIED BUILDER ID', CANVAS_WIDTH - 120, currentY + 70);

  ctx.fillStyle = '#71717A';
  ctx.font = '500 18px monospace';
  ctx.fillText('HACKER HOUSE GOA 2026', CANVAS_WIDTH - 120, currentY + 105);
}

// Utility helper to load an image URL into HTMLImageElement safely
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}
