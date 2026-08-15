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

// ─── Palette (matches canvas-helpers) ────────────────────────────────────────
const C_BG       = '#0B6B3A';
const C_CREAM    = '#FBF6E9';
const C_WHITE    = '#FFFFFF';
const C_YELLOW   = '#FFE600';
const C_PINK     = '#FF007A';
const C_INK      = '#1A2E22';
const C_SEA      = '#2EC4B6';
const C_DARK_GRN = '#064E29';
const C_LEAF_LT  = '#1A7A42';
const C_LEAF_DK  = '#0A4A25';

// ─── Fonts ────────────────────────────────────────────────────────────────────
const F_DISPLAY = '"Imbue", "Playfair Display", serif';
const F_DEVA    = '"Rozha One", "Noto Serif Devanagari", serif';
const F_MONO    = '"Courier New", monospace';

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

    // ── Canvas size ───────────────────────────────────────────────────────────
    const W = 1200;
    const H = 1600;
    canvas.width  = W;
    canvas.height = H;

    const seedStr     = teamName + members.map(m => m.id).join('-');
    const teamSeed    = fnv1aHash(seedStr);
    const passNumber  = generateTeamPassNumber(teamSeed);

    // ── Background: night sky ────────────────────────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0,    '#0D1F35');
    bgGrad.addColorStop(0.30, '#0C3530');
    bgGrad.addColorStop(0.65, '#0B6B3A');
    bgGrad.addColorStop(1,    '#041A0E');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 40; i++) {
      const sx  = _j(i, 7)  * W;
      const sy  = _j(i, 13) * H * 0.45;
      const al  = 0.12 + _j(i, 31) * 0.55;
      const sr  = 0.8 + _j(i, 19) * 2.2;
      ctx.fillStyle = `rgba(255,255,255,${al.toFixed(2)})`;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
    }

    // Moon
    ctx.save();
    ctx.shadowColor = 'rgba(255,200,0,0.45)';
    ctx.shadowBlur  = 60;
    ctx.fillStyle   = C_YELLOW;
    ctx.beginPath(); ctx.arc(W * 0.76, 80, 50, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── Card surface ─────────────────────────────────────────────────────────
    const CX = 60, CY = 60, CW = W - 120, CH = H - 120;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
    ctx.fillStyle = C_CREAM;
    rrect(ctx, CX, CY, CW, CH, 30, true, false);
    ctx.restore();

    ctx.fillStyle = C_CREAM;
    rrect(ctx, CX, CY, CW, CH, 30, true, false);
    ctx.strokeStyle = C_INK; ctx.lineWidth = 3;
    rrect(ctx, CX, CY, CW, CH, 30, false, true);
    ctx.strokeStyle = 'rgba(26,46,34,0.06)'; ctx.lineWidth = 1.5;
    rrect(ctx, CX + 10, CY + 10, CW - 20, CH - 20, 22, false, true);

    // ── Tropical foliage corners (inside card) ────────────────────────────────
    _cardFoliage(ctx, CX, CY, CW, CH);

    // ── Header band ──────────────────────────────────────────────────────────
    const BH = 160;
    const hGrad = ctx.createLinearGradient(CX, 0, CX + CW, 0);
    hGrad.addColorStop(0, '#8E0040'); hGrad.addColorStop(0.5, C_PINK); hGrad.addColorStop(1, '#C5005C');
    ctx.fillStyle = hGrad;
    rrect(ctx, CX, CY, CW, BH, 30, true, false);
    ctx.fillRect(CX, CY + BH - 20, CW, 20); // square off bottom of band

    // Header text — centred, NO left-align drift
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle    = C_WHITE;
    ctx.font         = `900 50px ${F_DISPLAY}`;
    ctx.fillText('HACKER HOUSE', W / 2, CY + 68);

    ctx.font      = `700 21px ${F_MONO}`;
    ctx.fillStyle = 'rgba(255,255,255,0.80)';
    ctx.fillText('गोवा  ·  GOA, INDIA  ·  28 – 31 OCT 2026', W / 2, CY + 124);

    // Yellow accent line
    ctx.strokeStyle = C_YELLOW; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CX + 28, CY + BH); ctx.lineTo(CX + CW - 28, CY + BH);
    ctx.stroke();

    // ── Team name section ─────────────────────────────────────────────────────
    let curY = CY + BH + 36;

    // Pass number label
    ctx.fillStyle = 'rgba(26,46,34,0.50)';
    ctx.font      = `700 18px ${F_MONO}`;
    ctx.fillText(`TEAM PASS  #${passNumber}`, W / 2, curY);
    curY += 34;

    // Team name pill — dynamically sized
    const nm = teamName.toUpperCase();
    let nmFS = 64;
    ctx.font = `900 ${nmFS}px ${F_DISPLAY}`;
    while (nmFS > 32 && ctx.measureText(nm).width > CW - 120) {
      nmFS -= 2; ctx.font = `900 ${nmFS}px ${F_DISPLAY}`;
    }
    const nmW = ctx.measureText(nm).width + 64;
    ctx.fillStyle = C_PINK;
    rrect(ctx, W / 2 - nmW / 2, curY, nmW, 80, 24, true, false);
    ctx.fillStyle = C_WHITE;
    ctx.fillText(nm, W / 2, curY + 56);
    curY += 100;

    // Thin divider
    ctx.strokeStyle = 'rgba(26,46,34,0.10)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(CX + 48, curY); ctx.lineTo(CX + CW - 48, curY); ctx.stroke();
    curY += 24;

    // ── Member photo cards ────────────────────────────────────────────────────
    const count   = members.length;
    // Scale box size based on member count so cards always fit
    const BOX     = Math.min(240, Math.floor((CW - 80 - 28 * (count - 1)) / count));
    const GAP     = 28;
    const totalMW = count * BOX + (count - 1) * GAP;
    const mStartX = (W - totalMW) / 2;

    members.forEach((m, idx) => {
      const bx = mStartX + idx * (BOX + GAP);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      rrect(ctx, bx + 4, curY + 6, BOX, BOX, 20, true, false);

      // Card
      ctx.fillStyle = C_WHITE;
      rrect(ctx, bx, curY, BOX, BOX, 20, true, false);
      ctx.strokeStyle = C_DARK_GRN; ctx.lineWidth = 2.5;
      rrect(ctx, bx, curY, BOX, BOX, 20, false, true);

      // Circular photo area
      const pcx = bx + BOX / 2;
      const pcy = curY + BOX / 2;
      const pr  = BOX / 2 - 16;

      ctx.fillStyle = C_BG;
      ctx.beginPath(); ctx.arc(pcx, pcy, pr, 0, Math.PI * 2); ctx.fill();

      // Gradient ring
      const rg = ctx.createLinearGradient(pcx - pr, pcy - pr, pcx + pr, pcy + pr);
      rg.addColorStop(0, C_PINK); rg.addColorStop(0.5, C_YELLOW); rg.addColorStop(1, C_SEA);
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(pcx, pcy, pr + 3,  0, Math.PI * 2);
      ctx.arc(pcx, pcy, pr,      0, Math.PI * 2, true);
      ctx.fill();

      if (m.photoUrl) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          ctx.save();
          ctx.beginPath(); ctx.arc(pcx, pcy, pr, 0, Math.PI * 2); ctx.clip();
          const ir = img.width / img.height;
          let dw = pr * 2, dh = pr * 2;
          if (ir > 1) dw = pr * 2 * ir; else dh = (pr * 2) / ir;
          ctx.drawImage(img, pcx - dw / 2, pcy - dh / 2, dw, dh);
          ctx.restore();
        };
        img.src = m.photoUrl;
      }
    });

    curY += BOX + 20;

    // Member name & title — sized per box width
    members.forEach((m, idx) => {
      const cx = mStartX + idx * (BOX + GAP) + BOX / 2;

      const nm2 = m.name.toUpperCase();
      let nFS = 22;
      ctx.font = `800 ${nFS}px ${F_DISPLAY}`;
      while (nFS > 13 && ctx.measureText(nm2).width > BOX + 16) {
        nFS -= 1; ctx.font = `800 ${nFS}px ${F_DISPLAY}`;
      }
      ctx.fillStyle = C_INK;
      ctx.textAlign = 'center';
      ctx.fillText(nm2, cx, curY);

      ctx.font      = `700 13px ${F_MONO}`;
      ctx.fillStyle = C_PINK;
      const titleTrunc = m.title.length > 22 ? m.title.substring(0, 20) + '…' : m.title;
      ctx.fillText(titleTrunc, cx, curY + 18);
    });

    curY += 46;

    // Divider
    ctx.strokeStyle = 'rgba(26,46,34,0.08)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(CX + 48, curY); ctx.lineTo(CX + CW - 48, curY); ctx.stroke();
    curY += 20;

    // ── Combined stack chips ──────────────────────────────────────────────────
    const allStacks = Array.from(new Set(members.flatMap(m => m.stack)));
    if (allStacks.length > 0) {
      const PAD = 20, GAP2 = 8, BH2 = 36;
      ctx.font = `700 16px ${F_MONO}`;

      // Group into rows
      const rows: string[][] = [[]];
      let rowW = 0;
      allStacks.forEach(s => {
        const w = ctx.measureText(s).width + PAD * 2;
        if (rowW + w + GAP2 > CW - 80 && rows[rows.length - 1].length > 0) {
          rows.push([]); rowW = 0;
        }
        rows[rows.length - 1].push(s);
        rowW += w + GAP2;
      });

      rows.forEach(row => {
        if (!row.length) return;
        const ws  = row.map(s => ctx.measureText(s).width + PAD * 2);
        const tot = ws.reduce((a, b) => a + b, 0) + GAP2 * (row.length - 1);
        let sx = W / 2 - tot / 2;
        row.forEach((s, i) => {
          ctx.fillStyle = C_DARK_GRN;
          rrect(ctx, sx, curY, ws[i], BH2, BH2 / 2, true, false);
          ctx.fillStyle = C_YELLOW;
          ctx.textAlign = 'center';
          ctx.fillText(s, sx + ws[i] / 2, curY + 24);
          sx += ws[i] + GAP2;
        });
        curY += BH2 + 8;
      });
    }

    // ── Footer band (anchored to card bottom) ─────────────────────────────────
    const FH   = 110;
    const FBOT = CY + CH;
    const FTOP = FBOT - FH;

    ctx.fillStyle = C_DARK_GRN;
    rrect(ctx, CX, FTOP, CW, FH, 30, true, false);
    ctx.fillRect(CX, FTOP, CW, 16); // square top edge

    // Accent strips
    ctx.fillStyle = C_YELLOW; ctx.fillRect(CX + 28, FTOP, 80, 3);
    ctx.fillStyle = C_SEA;    ctx.fillRect(CX + 112, FTOP, 60, 3);

    // Left: hashtag
    ctx.textAlign = 'left';
    ctx.fillStyle = C_YELLOW;
    ctx.font      = `900 38px ${F_DISPLAY}`;
    ctx.fillText('#FrameInGoa', CX + 28, FTOP + 56);

    ctx.fillStyle = 'rgba(251,246,233,0.5)';
    ctx.font      = `700 14px ${F_MONO}`;
    ctx.fillText('OFFICIAL HH GOA 2026 TEAM PASS', CX + 28, FTOP + 86);

    // Right: event dates
    ctx.textAlign = 'right';
    ctx.fillStyle = C_WHITE;
    ctx.font      = `700 22px ${F_MONO}`;
    ctx.fillText('GOA, INDIA', CX + CW - 28, FTOP + 48);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font      = `700 16px ${F_MONO}`;
    ctx.fillText('28 – 31 OCT 2026', CX + CW - 28, FTOP + 70);

    // Badge
    ctx.fillStyle = C_PINK;
    rrect(ctx, CX + CW - 28 - 120, FTOP + 78, 120, 32, 16, true, false);
    ctx.fillStyle = C_WHITE;
    ctx.font      = `700 12px ${F_MONO}`;
    ctx.textAlign = 'center';
    ctx.fillText('HH GOA 2026', CX + CW - 28 - 60, FTOP + 98);

    if (onCanvasReady) onCanvasReady(canvas);
  }, [teamName, members, onCanvasReady]);

  return (
    <div className="relative max-w-full overflow-hidden hh-card">
      <canvas ref={canvasRef} className="w-full h-auto block rounded-2xl" />
    </div>
  );
};

/* ─── Tropical foliage (same logic as canvas-helpers, self-contained) ─────── */

function _cardFoliage(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, cw: number, ch: number
) {
  // Top-left
  ctx.save(); ctx.translate(cx, cy);
  _palmCluster(ctx, 0, 0, 65, 55);
  _monsteraLeaf(ctx, 20, 52, 48, Math.PI * 0.18, C_LEAF_DK, 0.90);
  _hibiscus(ctx, 56, 32, 18, C_PINK, C_YELLOW);
  ctx.restore();

  // Top-right (mirror)
  ctx.save(); ctx.translate(cx + cw, cy); ctx.scale(-1, 1);
  _palmCluster(ctx, 0, 0, 65, 55);
  _monsteraLeaf(ctx, 20, 52, 48, Math.PI * 0.18, C_LEAF_DK, 0.90);
  _hibiscus(ctx, 56, 32, 18, C_PINK, C_YELLOW);
  ctx.restore();

  // Bottom-left (mirror vertically)
  ctx.save(); ctx.translate(cx, cy + ch); ctx.scale(1, -1);
  _palmCluster(ctx, 0, 0, 80, 65);
  _monsteraLeaf(ctx, 26, 58, 56, Math.PI * 0.22, C_LEAF_LT, 0.85);
  ctx.restore();

  // Bottom-right (mirror both)
  ctx.save(); ctx.translate(cx + cw, cy + ch); ctx.scale(-1, -1);
  _palmCluster(ctx, 0, 0, 80, 65);
  _monsteraLeaf(ctx, 26, 58, 56, Math.PI * 0.22, C_LEAF_LT, 0.85);
  _hibiscus(ctx, 60, 36, 16, '#FF4499', C_YELLOW);
  ctx.restore();
}

function _palmCluster(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  _frond(ctx, x, y, w,         Math.PI * 0.08,  0.70, C_LEAF_LT, C_LEAF_DK, 0.90);
  _frond(ctx, x, y, w * 0.80,  Math.PI * 0.26,  0.45, C_LEAF_DK, C_LEAF_DK, 0.80);
  _frond(ctx, x, y, h * 0.85,  Math.PI * -0.10, 0.60, C_LEAF_LT, C_LEAF_DK, 0.75);
}

function _frond(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  length: number, angle: number, curvature: number,
  leafCol: string, stemCol: string, opacity: number
) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha = opacity;

  const ex = length, ey = length * curvature;

  ctx.strokeStyle = stemCol; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(ex * 0.45, ey * 0.3, ex, ey); ctx.stroke();

  ctx.strokeStyle = leafCol; ctx.lineWidth = 2.5;
  for (let i = 2; i <= 13; i++) {
    const t = i / 13;
    const px = ex * t, py = ey * t * t;
    const ll = (1 - t * 0.4) * 38;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 10, py - ll); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 10, py - ll); ctx.stroke();
  }
  ctx.restore();
}

function _monsteraLeaf(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  angle: number, color: string, opacity: number
) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0,  size * 0.5);
  ctx.bezierCurveTo(-size * 0.45,  size * 0.2, -size * 0.5, -size * 0.25, 0, -size * 0.5);
  ctx.bezierCurveTo( size * 0.45, -size * 0.25,  size * 0.5,  size * 0.2, 0,  size * 0.5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,230,0,0.50)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, size * 0.45); ctx.lineTo(0, -size * 0.4); ctx.stroke();
  ctx.restore();
}

function _hibiscus(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  petalCol: string, stamenCol: string
) {
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < 5; i++) {
    ctx.save(); ctx.rotate((i / 5) * Math.PI * 2);
    ctx.fillStyle = petalCol;
    ctx.beginPath(); ctx.ellipse(0, -r * 0.65, r * 0.42, r * 0.52, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = stamenCol;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* ─── Tiny utilities ─────────────────────────────────────────────────────── */

function rrect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
  fill: boolean, stroke: boolean
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
  if (fill)   ctx.fill();
  if (stroke) ctx.stroke();
}

function _j(i: number, salt: number): number {
  return ((i * 2654435761 + salt * 40503) % 100000) / 100000;
}
