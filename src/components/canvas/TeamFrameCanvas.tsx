'use client';

import React, { useEffect, useRef } from 'react';
import { BuilderIdentity } from '@/types/builder';
import { fnv1aHash, generateTeamPassNumber } from '@/lib/builder-engine';

interface TeamFrameCanvasProps {
  teamName: string;
  members: BuilderIdentity[];
  builder?: BuilderIdentity;
  className?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

const COLOR_PRIMARY_GREEN = '#0D6A3A';
const COLOR_CREAM = '#F7F1E4';
const COLOR_WHITE = '#FFFFFF';
const COLOR_YELLOW = '#FFD62A';
const COLOR_PINK = '#FF2F86';
const COLOR_INK = '#173324';

const DISPLAY_FONT = '"Imbue", var(--font-imbue), "Playfair Display", serif';
const DEVANAGARI_FONT = '"Rozha One", "Noto Serif Devanagari", var(--font-devanagari), serif';
const BODY_FONT = 'Inter, var(--font-inter), sans-serif';
const MONO_FONT = 'monospace';

export const TeamFrameCanvas: React.FC<TeamFrameCanvasProps> = ({
  teamName,
  members,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || members.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200;
    const H = 1600;
    canvas.width = W;
    canvas.height = H;

    const combinedSeedStr = teamName + members.map((m) => m.id).join('-');
    const teamSeed = fnv1aHash(combinedSeedStr);
    const teamPassNumber = generateTeamPassNumber(teamSeed);

    // Background
    ctx.fillStyle = COLOR_CREAM;
    ctx.fillRect(0, 0, W, H);

    // Wave at bottom
    ctx.fillStyle = COLOR_PRIMARY_GREEN;
    ctx.fillRect(0, H - 200, W, 200);
    ctx.beginPath();
    ctx.moveTo(0, H - 200);
    for (let x = 0; x <= W; x += 100) {
      ctx.quadraticCurveTo(x + 50, H - 230, x + 100, H - 200);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.fill();

    // 1. HEADER BAND
    ctx.fillStyle = COLOR_PRIMARY_GREEN;
    roundRect(ctx, 60, 60, W - 120, 160, 24, true, false);

    ctx.fillStyle = COLOR_WHITE;
    ctx.font = `800 48px ${DISPLAY_FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('HACKER HOUSE GOA', 100, 130);

    // Goa Pill Badge
    ctx.fillStyle = COLOR_PINK;
    roundRect(ctx, 580, 90, 150, 52, 26, true, false);
    ctx.fillStyle = COLOR_WHITE;
    ctx.font = `800 28px ${DEVANAGARI_FONT}`;
    ctx.fillText('गोवा 2026', 602, 126);

    ctx.textAlign = 'right';
    ctx.fillStyle = COLOR_YELLOW;
    ctx.font = `800 28px ${DISPLAY_FONT}`;
    ctx.fillText('#FRAMEINGOA', W - 100, 120);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `600 20px ${BODY_FONT}`;
    ctx.fillText('OFFICIAL TEAM COMBINED PASS', W - 100, 155);

    // 2. TEAM NAME & HASH
    let curY = 300;

    ctx.fillStyle = 'rgba(23, 51, 36, 0.7)';
    ctx.font = `700 22px ${MONO_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(`TEAM PASS #${teamPassNumber}`, W / 2, curY);

    curY += 45;

    // Highlight Box for Team Name
    const name = teamName.toUpperCase();
    ctx.font = `800 72px ${DISPLAY_FONT}`;
    let teamNameFont = 72;
    while (teamNameFont > 36 && ctx.measureText(name).width > W - 260) {
      teamNameFont -= 2;
      ctx.font = `800 ${teamNameFont}px ${DISPLAY_FONT}`;
    }
    const nameW = ctx.measureText(name).width + 72;

    ctx.fillStyle = COLOR_PINK;
    roundRect(ctx, W / 2 - nameW / 2, curY, nameW, 90, 24, true, false);

    ctx.fillStyle = COLOR_WHITE;
    ctx.fillText(name, W / 2, curY + 62);

    curY += 130;

    ctx.fillStyle = COLOR_INK;
    ctx.font = `700 22px ${BODY_FONT}`;
    ctx.fillText('THE FULL-STACK COLLECTIVE', W / 2, curY);

    curY += 75;

    // 3. MEMBERS (SQUARE PHOTO CARDS)
    const count = members.length;
    const box = 260;
    const gap = 40;
    const totalW = count * box + (count - 1) * gap;
    const startX = (W - totalW) / 2;
    const boxTop = curY;

    members.forEach((m, idx) => {
      const bx = startX + idx * (box + gap);

      // Card shadow & container
      ctx.fillStyle = 'rgba(23, 51, 36, 0.1)';
      roundRect(ctx, bx + 6, boxTop + 8, box, box, 24, true, false);

      ctx.fillStyle = COLOR_WHITE;
      roundRect(ctx, bx, boxTop, box, box, 24, true, false);
      ctx.strokeStyle = COLOR_PRIMARY_GREEN;
      ctx.lineWidth = 4;
      roundRect(ctx, bx, boxTop, box, box, 24, false, true);

      // Photo inside
      if (m.photoUrl) {
        const img = new Image();
        img.onload = () => {
          const imgRatio = img.width / img.height;
          let dw = box - 20;
          let dh = box - 20;
          if (imgRatio > 1) {
            dw = (box - 20) * imgRatio;
          } else {
            dh = (box - 20) / imgRatio;
          }
          ctx.save();
          ctx.beginPath();
          ctx.arc(bx + box / 2, boxTop + box / 2, box / 2 - 16, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, bx + box / 2 - dw / 2, boxTop + box / 2 - dh / 2, dw, dh);
          ctx.restore();
        };
        img.crossOrigin = 'Anonymous';
        img.src = m.photoUrl;
      }
    });

    curY = boxTop + box + 65;

    // Member Info Text
    members.forEach((m, idx) => {
      const cx = startX + idx * (box + gap) + box / 2;
      ctx.fillStyle = COLOR_INK;
      ctx.font = `800 28px ${DISPLAY_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(m.name.toUpperCase().substring(0, 20), cx, curY);

      ctx.fillStyle = COLOR_PINK;
      ctx.font = `700 18px ${BODY_FONT}`;
      ctx.fillText(m.title, cx, curY + 30);
    });

    curY += 100;

    // 4. COMBINED STACK CHIPS
    const allStacks = Array.from(new Set(members.flatMap((m) => m.stack)));
    ctx.fillStyle = COLOR_INK;
    ctx.font = `800 24px ${BODY_FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('COMBINED TEAM STACK', 80, curY);

    curY += 40;

    ctx.font = `700 20px ${BODY_FONT}`;
    let startX2 = 80;
    allStacks.forEach((st) => {
      const tagW = ctx.measureText(st).width + 36;
      if (startX2 + tagW > W - 80) {
        startX2 = 80;
        curY += 60;
      }
      ctx.fillStyle = COLOR_WHITE;
      roundRect(ctx, startX2, curY, tagW, 48, 24, true, false);
      ctx.strokeStyle = 'rgba(13, 106, 58, 0.2)';
      ctx.lineWidth = 2;
      roundRect(ctx, startX2, curY, tagW, 48, 24, false, true);

      ctx.fillStyle = COLOR_PRIMARY_GREEN;
      ctx.textAlign = 'center';
      ctx.fillText(st, startX2 + tagW / 2, curY + 32);
      startX2 += tagW + 16;
    });

    // 5. FOOTER BAND
    ctx.fillStyle = COLOR_PRIMARY_GREEN;
    ctx.fillRect(0, H - 150, W, 150);

    ctx.fillStyle = COLOR_YELLOW;
    ctx.font = `800 44px ${DISPLAY_FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('#FrameInGoa', 80, H - 65);

    ctx.textAlign = 'right';
    ctx.fillStyle = COLOR_WHITE;
    ctx.font = `700 22px ${BODY_FONT}`;
    ctx.fillText('OFFICIAL HH GOA TEAM PASS', W - 80, H - 85);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('GOA, INDIA · 28—31 OCT 2026', W - 80, H - 55);

    if (onCanvasReady) {
      onCanvasReady(canvas);
    }
  }, [teamName, members, onCanvasReady]);

  return (
    <div className="relative max-w-full overflow-hidden hh-card">
      <canvas
        ref={canvasRef}
        className="w-full h-auto block rounded-2xl"
      />
    </div>
  );
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: boolean,
  stroke: boolean
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
