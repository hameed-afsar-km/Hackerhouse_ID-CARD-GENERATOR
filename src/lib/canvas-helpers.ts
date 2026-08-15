import { BuilderIdentity } from '@/types/builder';
import { formatClaimCode, resolveClaimCode } from '@/lib/builder-engine';

// ─── Canvas dimensions ───────────────────────────────────────────────────────
export const CARD_BASE_WIDTH = 1200;
export const CARD_BASE_HEIGHT = 1600;
export const CARD_SCALE = 1.6;
export const CANVAS_WIDTH  = CARD_BASE_WIDTH  * CARD_SCALE; // 1920
export const CANVAS_HEIGHT = CARD_BASE_HEIGHT * CARD_SCALE; // 2560

export const PROFILE_BASE_SIZE = 1000;
export const PROFILE_SCALE     = 2.048;
export const PROFILE_FRAME_SIZE = Math.round(PROFILE_BASE_SIZE * PROFILE_SCALE); // 2048

// ─── Palette ─────────────────────────────────────────────────────────────────
const C_BG         = '#0B6B3A';
const C_CREAM      = '#FBF6E9';
const C_WHITE      = '#FFFFFF';
const C_YELLOW     = '#FFE600';
const C_PINK       = '#FF007A';
const C_INK        = '#1A2E22';
const C_SEA        = '#2EC4B6';
const C_DARK_GRN   = '#064E29';
const C_LEAF_LT    = '#1A7A42';
const C_LEAF_DK    = '#0A4A25';

// ─── Fonts ───────────────────────────────────────────────────────────────────
const F_DISPLAY    = '"Imbue", "Playfair Display", serif';
const F_DEVA       = '"Nirmala UI", "Noto Sans Devanagari", sans-serif';
const F_MONO       = '"Courier New", monospace';

/* ═══════════════════════════════════════════════════════════════════════════
   1.  BUILDER ID CARD  (1200 × 1600 logical → 1920 × 2560 canvas)
   ═══════════════════════════════════════════════════════════════════════════ */
export async function drawBuilderCard(
  canvas: HTMLCanvasElement,
  builder: BuilderIdentity
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width  = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  ctx.scale(CARD_SCALE, CARD_SCALE);

  const W = CARD_BASE_WIDTH;
  const H = CARD_BASE_HEIGHT;

  // ── Background ──────────────────────────────────────────────────────────
  _drawBg(ctx, W, H);

  // ── Card surface ─────────────────────────────────────────────────────────
  // Leave 80 px margins on left/right, 80 top/bottom
  const CX = 80, CY = 80, CW = W - 160, CH = H - 160;

  const cardTheme = builder.photoSettings?.cardTheme || 'TROPICAL';
  const C_SUN    = '#FFB84D';
  const C_SUNINK = '#4A2418';
  const C_PEACH  = '#FFE7CE';
  let bandGradCols = ['#FFC24B', '#FF7A5C', '#E84A8C'];
  let pillColor = '#FF7A3D';

  if (cardTheme === 'SUNSET') {
    bandGradCols = ['#FF6A3D', '#FF2E63', '#9C3FE4'];
    pillColor = '#FF5E3A';
  } else if (cardTheme === 'CYBER') {
    bandGradCols = ['#00E5FF', '#7A5CFF', '#FF2E88'];
    pillColor = '#FF2E88';
  } else if (cardTheme === 'MINIMAL') {
    bandGradCols = ['#8A5A2B', '#6B4A2E', '#4A3418'];
    pillColor = '#6B4A2E';
  }

  // Soft offset shadow
  ctx.save();
  ctx.shadowColor   = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur    = 46;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = C_CREAM;
  rrect(ctx, CX, CY, CW, CH, 32, true, false);
  ctx.restore();

  // Surface fill — warm cream
  const surfGrad = ctx.createLinearGradient(CX, CY, CX, CY + CH);
  surfGrad.addColorStop(0, '#FFF9EA');
  surfGrad.addColorStop(1, '#FFF1DC');
  ctx.fillStyle = surfGrad;
  rrect(ctx, CX, CY, CW, CH, 32, true, false);

  // Retro double border — warm brown + sun yellow
  ctx.strokeStyle = C_SUNINK;
  ctx.lineWidth   = 4;
  rrect(ctx, CX, CY, CW, CH, 32, false, true);
  ctx.strokeStyle = C_SUN;
  ctx.lineWidth   = 2;
  rrect(ctx, CX + 10, CY + 10, CW - 20, CH - 20, 24, false, true);

  // ── Layout anchors (footer + code plate) ──────────────────────────────────
  const FOOTER_H = 170;
  const FBOT = CY + CH;
  const FTOP = FBOT - FOOTER_H;
  const PLATE_H = 170;
  const PLATE_W = CW - 120;
  const plateTop = FTOP - PLATE_H - 26;
  const chipBottomMax = plateTop - 30;

  // ── Header band — HACKER HOUSE + location & date ──────────────────────────
  const BH = 200; // band height

  // Sunset gradient band
  const bandGrad = ctx.createLinearGradient(CX, CY, CX, CY + BH);
  bandGrad.addColorStop(0,   bandGradCols[0]);
  bandGrad.addColorStop(0.55, bandGradCols[1]);
  bandGrad.addColorStop(1,   bandGradCols[2]);
  ctx.fillStyle = bandGrad;
  rrect(ctx, CX, CY, CW, BH, 32, true, false);
  // Square off the bottom so it merges with the surface
  ctx.fillRect(CX, CY + BH - 24, CW, 24);

  // Retro sun with rays on the right
  _retroSun(ctx, CX + CW - 132, CY + 104, 34, 15, 'rgba(255,249,234,0.92)');

  // Pin dots
  ctx.fillStyle = 'rgba(255,249,234,0.4)';
  _circle(ctx, CX + 30, CY + 30, 7, true);
  _circle(ctx, CX + CW - 30, CY + 30, 7, true);

  // HACKER HOUSE wordmark
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle    = C_WHITE;
  ctx.font         = `900 58px ${F_DISPLAY}`;
  ctx.fillText('HACKER HOUSE', W / 2, CY + 96);

  // Location & date — गोवा (Devanagari) + mono rest, centred on one baseline
  ctx.fillStyle = 'rgba(255,249,234,0.9)';
  ctx.textAlign = 'left';
  ctx.font      = `700 22px ${F_DEVA}`;
  const goaStr = 'गोवा';
  const goaW   = ctx.measureText(goaStr).width;
  ctx.font = `700 22px ${F_MONO}`;
  const restStr = '  ·  GOA, INDIA  ·  28 – 31 OCT 2026';
  const restW   = ctx.measureText(restStr).width;
  const TAG_GAP = 18;
  let tagX = W / 2 - (goaW + TAG_GAP + restW) / 2;
  ctx.font = `700 22px ${F_DEVA}`;
  ctx.fillText(goaStr, tagX, CY + 156);
  tagX += goaW + TAG_GAP;
  ctx.font = `700 22px ${F_MONO}`;
  ctx.fillText(restStr, tagX, CY + 156);

  // Wavy divider spilling onto the surface
  _waveStrip(ctx, CX, CY + BH - 8, CW, 30, bandGradCols[1]);
  _waveStrip(ctx, CX, CY + BH + 10, CW, 18, 'rgba(255,184,77,0.55)');

  // ── Avatar photo — large circle with gradient border ──────────────────────
  const PR   = 200; // photo radius
  const PCXV = W / 2;
  const PCYV = CY + BH + 62 + PR;

  // Warm halo behind the ring
  ctx.fillStyle = 'rgba(255,184,77,0.35)';
  _circle(ctx, PCXV, PCYV, PR + 42, true);

  drawGradientRing(ctx, PCXV, PCYV, PR + 6, PR + 28, bandGradCols[2], bandGradCols[1], bandGradCols[0]);
  ctx.strokeStyle = C_WHITE;
  ctx.lineWidth   = 5;
  _circle(ctx, PCXV, PCYV, PR - 4, false, true);

  await _drawPhoto(ctx, builder, PCXV, PCYV, PR);

  // ── Identity ──────────────────────────────────────────────────────────────
  let y = PCYV + PR + 58;

  // Name (scaled to fit, up to two lines)
  ctx.fillStyle    = C_SUNINK;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  const nameStr  = builder.name.toUpperCase();
  let nameFS = 62;
  ctx.font = `900 ${nameFS}px ${F_DISPLAY}`;
  let nameLines = [nameStr];
  if (ctx.measureText(nameStr).width > CW - 90) {
    const words = nameStr.split(' ');
    let line1 = '';
    let line2 = '';
    for (const wd of words) {
      const t = line1 ? `${line1} ${wd}` : wd;
      if (ctx.measureText(t).width <= CW - 90) line1 = t;
      else line2 = line2 ? `${line2} ${wd}` : wd;
    }
    if (line2) nameLines = [line1, line2];
  }
  while (nameFS > 32 && Math.max(...nameLines.map((l) => ctx.measureText(l).width)) > CW - 90) {
    nameFS -= 2;
    ctx.font = `900 ${nameFS}px ${F_DISPLAY}`;
  }
  nameLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, y + i * Math.round(nameFS * 1.02));
  });
  y += nameLines.length * Math.round(nameFS * 1.02) + 18;

  // ROLE pill
  const titleStr = builder.title.toUpperCase();
  let titleFS = 36;
  ctx.font = `700 ${titleFS}px ${F_DISPLAY}`;
  while (titleFS > 22 && ctx.measureText(titleStr).width > CW - 200) {
    titleFS -= 2;
    ctx.font = `700 ${titleFS}px ${F_DISPLAY}`;
  }
  const pillH = 58;
  const tW = ctx.measureText(titleStr).width + 64;
  ctx.save();
  ctx.translate(W / 2, y + pillH / 2);
  ctx.rotate(-0.03);
  ctx.fillStyle = pillColor;
  rrect(ctx, -tW / 2, -pillH / 2, tW, pillH, pillH / 2, true, false);
  ctx.strokeStyle = C_CREAM;
  ctx.lineWidth   = 3;
  rrect(ctx, -tW / 2, -pillH / 2, tW, pillH, pillH / 2, false, true);
  ctx.fillStyle = C_WHITE;
  ctx.fillText(titleStr, 0, pillH / 2 - 20);
  ctx.restore();
  y += pillH + 30;

  // ── SKILL STACK chips ─────────────────────────────────────────────────────
  const stack = builder.stack || [];
  if (stack.length > 0) {
    ctx.fillStyle = 'rgba(74,36,24,0.55)';
    ctx.font      = `800 15px ${F_MONO}`;
    ctx.fillText('SKILL STACK', W / 2, y);
    y += 26;

    const PAD = 26, GAP = 12, BADH = 44, chipFS = 20;
    ctx.font = `700 ${chipFS}px ${F_MONO}`;

    // Two-row wrapping; anything that can't fit collapses into a "+N MORE" chip
    const rows: string[][] = [[]];
    let rowW = 0;
    let leftOver = 0;
    stack.forEach((s) => {
      const w = ctx.measureText(s).width + PAD * 2;
      if (leftOver > 0) { leftOver += 1; return; }
      if (rowW + w + GAP > CW - 90 && rows[rows.length - 1].length > 0) {
        if (rows.length >= 2) { leftOver = 1; return; }
        rows.push([]);
        rowW = 0;
      }
      rows[rows.length - 1].push(s);
      rowW += w + GAP;
    });
    if (leftOver > 0) {
      rows[1][rows[1].length - 1] = `+${leftOver} MORE`;
    }

    // Draw only as many rows as fit above the code plate
    let nRowsFit = 0;
    let ry = y;
    while (nRowsFit < 2 && ry + BADH <= chipBottomMax) {
      nRowsFit += 1;
      ry += BADH + 12;
    }
    const drawnRows = rows.slice(0, Math.max(1, nRowsFit));
    if (rows.length > drawnRows.length) {
      const extra = rows.slice(drawnRows.length).reduce((a, r) => a + r.length, 0);
      const lastRow = drawnRows[drawnRows.length - 1];
      lastRow[lastRow.length - 1] = `+${extra} MORE`;
    }

    drawnRows.forEach((row) => {
      if (row.length === 0) return;
      const ws  = row.map((s) => ctx.measureText(s).width + PAD * 2);
      const tot = ws.reduce((a, b) => a + b, 0) + GAP * (row.length - 1);
      let sx = W / 2 - tot / 2;
      row.forEach((s, i) => {
        ctx.fillStyle = C_PEACH;
        ctx.strokeStyle = C_SUNINK;
        ctx.lineWidth   = 3;
        rrect(ctx, sx, y, ws[i], BADH, BADH / 2, true, true);
        ctx.fillStyle = C_SUNINK;
        ctx.textAlign = 'center';
        ctx.fillText(s, sx + ws[i] / 2, y + 29);
        sx += ws[i] + GAP;
      });
      y += BADH + 12;
    });
  }

  // ── 12-char code plate — tilted retro label, very big code ────────────────
  const code = formatClaimCode(resolveClaimCode(builder.claimCode, builder.builderNumber));
  ctx.save();
  ctx.translate(W / 2, plateTop + PLATE_H / 2);
  ctx.rotate(-0.02);
  ctx.fillStyle = C_CREAM;
  rrect(ctx, -PLATE_W / 2, -PLATE_H / 2, PLATE_W, PLATE_H, 24, true, false);
  ctx.strokeStyle = pillColor;
  ctx.lineWidth   = 4;
  rrect(ctx, -PLATE_W / 2, -PLATE_H / 2, PLATE_W, PLATE_H, 24, false, true);
  ctx.strokeStyle = C_SUN;
  ctx.lineWidth   = 2;
  rrect(ctx, -PLATE_W / 2 + 9, -PLATE_H / 2 + 9, PLATE_W - 18, PLATE_H - 18, 18, false, true);

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(74,36,24,0.6)';
  ctx.font      = `800 15px ${F_MONO}`;
  ctx.fillText('UNIQUE CODE', 0, -PLATE_H / 2 + 38);

  let codeFS = 84;
  ctx.font = `900 ${codeFS}px ${F_MONO}`;
  while (codeFS > 48 && ctx.measureText(code).width > PLATE_W - 64) {
    codeFS -= 2;
    ctx.font = `900 ${codeFS}px ${F_MONO}`;
  }
  ctx.fillStyle = C_SUNINK;
  ctx.fillText(code, 0, PLATE_H / 2 - 44);
  ctx.restore();

  // ── Footer — #FrameInGoa, big & centred ───────────────────────────────────
  // Sunset gradient band (reversed for depth)
  const footGrad = ctx.createLinearGradient(CX, FTOP, CX, CY + CH);
  footGrad.addColorStop(0,   bandGradCols[2]);
  footGrad.addColorStop(0.5, bandGradCols[1]);
  footGrad.addColorStop(1,   bandGradCols[0]);
  ctx.fillStyle = footGrad;
  rrect(ctx, CX, FTOP, CW, FOOTER_H, 32, true, false);
  // Square off the top corners so it merges with card body
  ctx.fillRect(CX, FTOP, CW, 16);

  // Retro sun on the right
  _retroSun(ctx, CX + CW - 120, FTOP + 68, 26, 12, 'rgba(255,249,234,0.35)');

  // #FrameInGoa — cream with warm outline
  ctx.textAlign = 'center';
  ctx.font      = `900 58px ${F_DISPLAY}`;
  ctx.strokeStyle = 'rgba(74,36,24,0.55)';
  ctx.lineWidth   = 8;
  ctx.lineJoin    = 'round';
  ctx.strokeText('#FrameInGoa', W / 2, FTOP + 84);
  ctx.fillStyle = C_WHITE;
  ctx.fillText('#FrameInGoa', W / 2, FTOP + 84);

  ctx.fillStyle = 'rgba(255,249,234,0.85)';
  ctx.font      = `700 15px ${F_MONO}`;
  ctx.fillText('HH GOA 2026  ·  BUILDER PASS', W / 2, FTOP + 132);

  // Waves lapping the top edge of the footer — sea meets the sunset
  _waveStrip(ctx, CX, FTOP - 14, CW, 26, '#FFF1DC');
}

/* ═══════════════════════════════════════════════════════════════════════════
   2.  PROFILE FRAME  (1000 × 1000 logical → 2048 × 2048 canvas)
   ═══════════════════════════════════════════════════════════════════════════ */
export async function drawProfileFrame(
  canvas: HTMLCanvasElement,
  builder: BuilderIdentity
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width  = PROFILE_FRAME_SIZE;
  canvas.height = PROFILE_FRAME_SIZE;
  ctx.scale(PROFILE_SCALE, PROFILE_SCALE);

  const S  = PROFILE_BASE_SIZE;
  const CX = S / 2;
  const CY_CIRCLE = 435; // Centered vertically in available space
  const R  = 285; // photo radius
  const RO = 305; // outer ring radius
  const frameStyle = builder.photoSettings?.frameStyle || 'WREATH';

  // Background
  _drawBg(ctx, S, S);

  // ── Photo ─────────────────────────────────────────────────────────────────
  await _drawPhoto(ctx, builder, CX, CY_CIRCLE, R);

  // Gradient ring over photo edge
  drawGradientRing(ctx, CX, CY_CIRCLE, R + 2, RO, C_PINK, C_YELLOW, C_SEA);
  ctx.strokeStyle = C_WHITE;
  ctx.lineWidth   = 4;
  _circle(ctx, CX, CY_CIRCLE, R - 6, false, true);

  // ── Frame Style Overlay Selection ──────────────────────────────────────────
  if (frameStyle === 'SUNBURST') {
    _drawProfileSunburstFrame(ctx, CX, CY_CIRCLE, R, RO);
  } else if (frameStyle === 'NEON') {
    _drawProfileNeonFrame(ctx, CX, CY_CIRCLE, R, RO);
  } else {
    _drawProfileFoliageFrame(ctx, CX, CY_CIRCLE, R, RO);
  }

  // ── Corner Viewfinder Brackets ────────────────────────────────────────────
  const BRACK_LEN = 48;
  const BRACK_OFF = 30;
  ([
    [BRACK_OFF, BRACK_OFF,     C_PINK,   1,  1],
    [S - BRACK_OFF, BRACK_OFF,     C_YELLOW, -1,  1],
    [BRACK_OFF, S - BRACK_OFF, C_YELLOW,  1, -1],
    [S - BRACK_OFF, S - BRACK_OFF, C_PINK,  -1, -1],
  ] as [number, number, string, number, number][]).forEach(([bx, by, col, dx, dy]) => {
    ctx.strokeStyle = col;
    ctx.lineWidth   = 5;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(bx + dx * BRACK_LEN, by);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx, by + dy * BRACK_LEN);
    ctx.stroke();
  });

  // ── Top Banner ────────────────────────────────────────────────────────────
  const BW = 440, BH = 58, BX = CX - BW / 2, BY = 26;
  ctx.fillStyle = C_YELLOW;
  rrect(ctx, BX, BY, BW, BH, 29, true, false);
  ctx.strokeStyle = C_PINK;
  ctx.lineWidth   = 3;
  rrect(ctx, BX, BY, BW, BH, 29, false, true);
  ctx.fillStyle    = C_INK;
  ctx.font         = `800 27px ${F_DISPLAY}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('HACKER HOUSE  ·  GOA 2026', CX, BY + 39);

  // ── Bottom Badge Stack (No Overlap) ──────────────────────────────────────
  const BOTTOM = S - 24;

  // 1. Hashtag badge (lowest)
  const HBH = 56, HBW = 340;
  const HBY = BOTTOM - HBH;
  ctx.fillStyle = C_PINK;
  rrect(ctx, CX - HBW / 2, HBY, HBW, HBH, HBH / 2, true, false);
  ctx.strokeStyle = C_YELLOW;
  ctx.lineWidth   = 3;
  rrect(ctx, CX - HBW / 2, HBY, HBW, HBH, HBH / 2, false, true);
  ctx.fillStyle = C_WHITE;
  ctx.font      = `800 29px ${F_DISPLAY}`;
  ctx.fillText('#FrameInGoa', CX, HBY + 37);

  // 2. Claim code (above hashtag, 12px gap)
  const CCH = 42, CCW = 260;
  const CCY = HBY - 12 - CCH;
  ctx.fillStyle = C_DARK_GRN;
  rrect(ctx, CX - CCW / 2, CCY, CCW, CCH, CCH / 2, true, false);
  ctx.fillStyle = C_YELLOW;
  ctx.font      = `700 18px ${F_MONO}`;
  const code2 = formatClaimCode(resolveClaimCode(builder.claimCode, builder.builderNumber));
  ctx.fillText(code2, CX, CCY + 27);

  // 3. Title pill (above code, 12px gap)
  const titleStr = builder.title.toUpperCase();
  let tFS = 25;
  ctx.font = `700 ${tFS}px ${F_DISPLAY}`;
  while (tFS > 16 && ctx.measureText(titleStr).width > 520) {
    tFS -= 2;
    ctx.font = `700 ${tFS}px ${F_DISPLAY}`;
  }
  const TW = Math.min(560, ctx.measureText(titleStr).width + 56);
  const TPH = 48;
  const TPY = CCY - 12 - TPH;
  ctx.fillStyle   = C_CREAM;
  rrect(ctx, CX - TW / 2, TPY, TW, TPH, TPH / 2, true, false);
  ctx.strokeStyle = C_INK;
  ctx.lineWidth   = 2;
  rrect(ctx, CX - TW / 2, TPY, TW, TPH, TPH / 2, false, true);
  ctx.fillStyle = C_INK;
  ctx.fillText(titleStr, CX, TPY + 33);
}

/**
 * Dedicated tropical botanical wreath for the Profile Frame —
 * Fronds, Monstera leaves and Hibiscus blossoms wreathed around the circular avatar frame.
 */
function _drawProfileFoliageFrame(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, ro: number
) {
  // Top-left diagonal of outer ring
  ctx.save();
  ctx.translate(cx - ro * 0.72, cy - ro * 0.72);
  ctx.rotate(-Math.PI * 0.25);
  _singleFrond(ctx, 0, 0, 115, 0, 0.25, C_LEAF_LT, C_LEAF_DK, 0.95);
  _monsteraLeaf(ctx, -15, 20, 52, Math.PI * 0.15, C_LEAF_DK, 0.90);
  _hibiscus(ctx, 20, -10, 18, C_PINK, C_YELLOW);
  ctx.restore();

  // Top-right diagonal of outer ring
  ctx.save();
  ctx.translate(cx + ro * 0.72, cy - ro * 0.72);
  ctx.rotate(Math.PI * 0.25);
  _singleFrond(ctx, 0, 0, 115, 0, 0.25, C_LEAF_LT, C_LEAF_DK, 0.95);
  _monsteraLeaf(ctx, 15, 20, 52, -Math.PI * 0.15, C_LEAF_DK, 0.90);
  _hibiscus(ctx, -20, -10, 18, C_PINK, C_YELLOW);
  ctx.restore();

  // Bottom-left diagonal of outer ring
  ctx.save();
  ctx.translate(cx - ro * 0.76, cy + ro * 0.65);
  ctx.rotate(-Math.PI * 0.75);
  _singleFrond(ctx, 0, 0, 120, 0, 0.3, C_LEAF_LT, C_LEAF_DK, 0.90);
  _monsteraLeaf(ctx, -10, 25, 58, 0, C_LEAF_DK, 0.88);
  ctx.restore();

  // Bottom-right diagonal of outer ring
  ctx.save();
  ctx.translate(cx + ro * 0.76, cy + ro * 0.65);
  ctx.rotate(Math.PI * 0.75);
  _singleFrond(ctx, 0, 0, 120, 0, 0.3, C_LEAF_LT, C_LEAF_DK, 0.90);
  _monsteraLeaf(ctx, 10, 25, 58, 0, C_LEAF_DK, 0.88);
  _hibiscus(ctx, 25, 10, 20, '#FF4499', C_YELLOW);
  ctx.restore();
}

/**
 * Tropical Sunburst Frame Style —
 * Golden sunrays radiant from the top with palm fronds cascading down the sides.
 */
function _drawProfileSunburstFrame(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, ro: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 230, 0, 0.45)' : 'rgba(255, 0, 122, 0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * (ro + 8), Math.sin(angle) * (ro + 8));
    ctx.lineTo(Math.cos(angle) * (ro + 36), Math.sin(angle) * (ro + 36));
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(cx - ro * 0.85, cy);
  ctx.rotate(-Math.PI * 0.4);
  _singleFrond(ctx, 0, 0, 120, 0, 0.3, C_LEAF_LT, C_LEAF_DK, 0.95);
  _hibiscus(ctx, 20, 10, 18, C_PINK, C_YELLOW);
  ctx.restore();

  ctx.save();
  ctx.translate(cx + ro * 0.85, cy);
  ctx.rotate(Math.PI * 0.4);
  _singleFrond(ctx, 0, 0, 120, 0, 0.3, C_LEAF_LT, C_LEAF_DK, 0.95);
  _hibiscus(ctx, -20, 10, 18, C_PINK, C_YELLOW);
  ctx.restore();
}

/**
 * Neon Glow Frame Style —
 * Multi-layer glowing rings with vibrant corner tropical badges.
 */
function _drawProfileNeonFrame(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, ro: number
) {
  ctx.save();
  ctx.shadowColor = C_PINK;
  ctx.shadowBlur = 30;
  ctx.strokeStyle = C_PINK;
  ctx.lineWidth = 6;
  _circle(ctx, cx, cy, ro + 12, false, true);

  ctx.shadowColor = C_SEA;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = C_SEA;
  ctx.lineWidth = 4;
  _circle(ctx, cx, cy, ro + 22, false, true);
  ctx.restore();

  _hibiscus(ctx, cx - ro * 0.72, cy - ro * 0.72, 22, C_PINK, C_YELLOW);
  _hibiscus(ctx, cx + ro * 0.72, cy - ro * 0.72, 22, C_SEA, C_YELLOW);
}

/* ═══════════════════════════════════════════════════════════════════════════
   TROPICAL BOTANICAL OVERLAY
   All foliage is drawn INSIDE the card boundaries so it reads as a frame
   decoration rather than elements floating on the background.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Draw tropical fronds, leaves and flowers in the four inner corners of the
 * card, on top of the cream surface but behind the text content area.
 */
function _drawCardFoliageFrame(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, cw: number, ch: number
) {
  // ── Top-left cluster ──────────────────────────────────────────────────────
  ctx.save();
  ctx.translate(cx, cy);
  _palmCluster(ctx,   0,   0,  70,  60);  // angled right-down
  _monsteraLeaf(ctx, 22,  54, 52, Math.PI * 0.18, C_LEAF_DK, 0.92);
  _hibiscus(ctx, 60,  34, 20, C_PINK, C_YELLOW);
  ctx.restore();

  // ── Top-right cluster ─────────────────────────────────────────────────────
  ctx.save();
  ctx.translate(cx + cw, cy);
  ctx.scale(-1, 1); // mirror horizontally
  _palmCluster(ctx,   0,   0,  70,  60);
  _monsteraLeaf(ctx, 22,  54, 52, Math.PI * 0.18, C_LEAF_DK, 0.92);
  _hibiscus(ctx, 60,  34, 20, C_PINK, C_YELLOW);
  ctx.restore();

  // ── Bottom-left cluster ───────────────────────────────────────────────────
  ctx.save();
  ctx.translate(cx, cy + ch);
  ctx.scale(1, -1); // mirror vertically
  _palmCluster(ctx,   0,   0,  90,  70);
  _monsteraLeaf(ctx, 28,  60, 62, Math.PI * 0.22, C_LEAF_LT, 0.88);
  ctx.restore();

  // ── Bottom-right cluster ──────────────────────────────────────────────────
  ctx.save();
  ctx.translate(cx + cw, cy + ch);
  ctx.scale(-1, -1); // mirror both
  _palmCluster(ctx,   0,   0,  90,  70);
  _monsteraLeaf(ctx, 28,  60, 62, Math.PI * 0.22, C_LEAF_LT, 0.88);
  _hibiscus(ctx, 64,  38, 18, '#FF4499', C_YELLOW);
  ctx.restore();
}



// ── Botanical primitives ──────────────────────────────────────────────────────

/** Multi-frond palm crown emerging from a corner. */
function _palmCluster(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number
) {
  // Three fronds at slightly different angles
  _singleFrond(ctx, x, y, w,        Math.PI * 0.08, 0.7,  C_LEAF_LT, C_LEAF_DK, 0.90);
  _singleFrond(ctx, x, y, w * 0.8,  Math.PI * 0.25, 0.45, C_LEAF_DK, C_LEAF_DK, 0.82);
  _singleFrond(ctx, x, y, h * 0.85, Math.PI * -0.1, 0.6,  C_LEAF_LT, C_LEAF_DK, 0.78);
}

/** Single palm frond (rachis + pinnae). */
function _singleFrond(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  length: number,
  angle: number,
  curvature: number,
  leafCol: string,
  stemCol: string,
  opacity: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = opacity;

  const endX = length;
  const endY = length * curvature;

  // Rachis stem
  ctx.strokeStyle = stemCol;
  ctx.lineWidth   = 3.5;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.45, endY * 0.3, endX, endY);
  ctx.stroke();

  // Pinnae leaflets
  ctx.strokeStyle = leafCol;
  ctx.lineWidth   = 2.5;
  const COUNT = 14;
  for (let i = 2; i <= COUNT; i++) {
    const t  = i / COUNT;
    const px = endX * t;
    const py = endY * t * t;                // quadratic to follow stem curve
    const ll = (1 - t * 0.4) * 42;

    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 11, py - ll); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 11, py - ll); ctx.stroke();
  }

  ctx.restore();
}

/** Monstera leaf (elongated ovoid with mid-vein). */
function _monsteraLeaf(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  angle: number,
  color: string,
  opacity: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = opacity;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.5);
  ctx.bezierCurveTo(-size * 0.45, size * 0.2, -size * 0.5, -size * 0.25,  0, -size * 0.5);
  ctx.bezierCurveTo( size * 0.5, -size * 0.25,  size * 0.45, size * 0.2,  0,  size * 0.5);
  ctx.fill();

  // Mid-vein
  ctx.strokeStyle = 'rgba(255,230,0,0.55)';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.45);
  ctx.lineTo(0, -size * 0.4);
  ctx.stroke();

  ctx.restore();
}

/** Simple 5-petal hibiscus blossom. */
function _hibiscus(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  r: number,
  petalColor: string,
  stamenColor: string
) {
  ctx.save();
  ctx.translate(x, y);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = petalColor;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.65, r * 0.42, r * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = stamenColor;
  _circle(ctx, 0, 0, r * 0.28, true);

  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

/** Night-sky gradient background (navy → forest green → dark). */
function _drawBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0,    '#0D1F35');
  g.addColorStop(0.28, '#0C3530');
  g.addColorStop(0.60, '#0B6B3A');
  g.addColorStop(1,    '#041A0E');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Stars
  for (let i = 0; i < 55; i++) {
    const sx = _j(i, 7)  * w;
    const sy = _j(i, 13) * h * 0.55;
    const al = 0.12 + _j(i, 31) * 0.55;
    const sr = 0.8 + _j(i, 19) * 2.6;
    ctx.fillStyle = `rgba(255,255,255,${al.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Moon
  const MX = w * 0.72, MY = h * 0.08, MR = Math.min(w, h) * 0.07;
  ctx.save();
  ctx.shadowColor = 'rgba(255,200,0,0.45)';
  ctx.shadowBlur  = 60;
  ctx.fillStyle   = C_YELLOW;
  ctx.beginPath();
  ctx.arc(MX, MY, MR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Draw the user photo clipped to a circle. */
async function _drawPhoto(
  ctx: CanvasRenderingContext2D,
  builder: BuilderIdentity,
  cx: number, cy: number, r: number
) {
  if (builder.photoUrl) {
    try {
      const img = await loadImage(builder.photoUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // Background inside clipped circle
      ctx.fillStyle = C_BG;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      const s  = builder.photoSettings || { zoom: 1, panX: 0, panY: 0, preset: 'RAW' };
      const zm = s.zoom || 1;
      const d  = r * 2;
      const px = ((s.panX || 0) / 100) * d;
      const py = ((s.panY || 0) / 100) * d;
      const ir = (img.width || 1) / (img.height || 1);
      let dw = d * zm, dh = d * zm;
      if (ir > 1) dw = d * ir * zm; else dh = (d / ir) * zm;
      ctx.drawImage(img, cx - dw / 2 + px, cy - dh / 2 + py, dw, dh);
      ctx.restore();
      return;
    } catch (err) {
      console.warn('Failed to load image in _drawPhoto, rendering initials fallback:', err);
    }
  }

  // Fallback: render stylized Builder Initials if photo URL is missing or failed to render
  ctx.save();
  ctx.fillStyle = C_DARK_GRN;
  _circle(ctx, cx, cy, r, true);
  ctx.strokeStyle = C_YELLOW;
  ctx.lineWidth = 4;
  _circle(ctx, cx, cy, r - 4, false, true);

  const initials = (builder.name || 'B')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'HH';

  ctx.fillStyle = C_YELLOW;
  ctx.font = `900 ${Math.round(r * 0.7)}px ${F_DISPLAY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, cx, cy + 4);
  ctx.restore();
}

/** Retro sun with triangular rays (70s poster style). */
function _retroSun(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  r: number, rayLen: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const dx = Math.cos(a), dy = Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(dx * r, dy * r);
    ctx.lineTo(dx * (r + rayLen) + dy * 7, dy * (r + rayLen) - dx * 7);
    ctx.lineTo(dx * (r + rayLen) - dy * 7, dy * (r + rayLen) + dx * 7);
    ctx.closePath();
    ctx.fill();
  }
  _circle(ctx, 0, 0, r, true);
  ctx.restore();
}

/** Wavy strip — the top edge oscillates between y and y+h, filled down to y+h. */
function _waveStrip(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  const n = 6;
  const sw = w / n;
  for (let i = 0; i < n; i++) {
    const mid = i % 2 === 0 ? y + h : y;
    ctx.quadraticCurveTo(x + (i + 0.5) * sw, mid, x + (i + 1) * sw, i % 2 === 0 ? y : y + h);
  }
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
}

function drawGradientRing(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  innerR: number, outerR: number,
  c0: string, c1: string, c2: string
) {
  const g = ctx.createLinearGradient(cx - outerR, cy - outerR, cx + outerR, cy + outerR);
  g.addColorStop(0, c0); g.addColorStop(0.5, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
  ctx.fill();
}

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

function _circle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  fill = false, stroke = false
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill)   ctx.fill();
  if (stroke) ctx.stroke();
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // NEVER set crossOrigin on data: URLs or blob: URLs (browsers throw CORS error for data: schemes)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => {
      if (img.crossOrigin) {
        // Fallback retry without crossOrigin if CORS header was rejected by remote server
        const retryImg = new Image();
        retryImg.onload = () => resolve(retryImg);
        retryImg.onerror = (e) => reject(e);
        retryImg.src = url;
      } else {
        reject(new Error(`Failed to load image: ${url.slice(0, 50)}`));
      }
    };
    img.src = url;
  });
}

/** Deterministic jitter [0,1). */
function _j(i: number, salt: number): number {
  return ((i * 2654435761 + salt * 40503) % 100000) / 100000;
}



