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
const F_DEVA       = '"Rozha One", "Noto Serif Devanagari", serif';
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

  // Shadow
  ctx.save();
  ctx.shadowColor   = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur    = 56;
  ctx.shadowOffsetY = 22;
  ctx.fillStyle = C_CREAM;
  rrect(ctx, CX, CY, CW, CH, 32, true, false);
  ctx.restore();

  // Cream fill
  ctx.fillStyle = C_CREAM;
  rrect(ctx, CX, CY, CW, CH, 32, true, false);

  // Outer border
  ctx.strokeStyle = C_INK;
  ctx.lineWidth = 3;
  rrect(ctx, CX, CY, CW, CH, 32, false, true);

  // Fine inner border
  ctx.strokeStyle = 'rgba(26,46,34,0.07)';
  ctx.lineWidth = 1.5;
  rrect(ctx, CX + 10, CY + 10, CW - 20, CH - 20, 24, false, true);

  // ── TROPICAL FOLIAGE FRAME (drawn ON the card, inside it) ────────────────
  _drawCardFoliageFrame(ctx, CX, CY, CW, CH);

  // ── Header band ──────────────────────────────────────────────────────────
  const BH = 168; // band height
  const grad = ctx.createLinearGradient(CX, CY, CX + CW, CY);
  grad.addColorStop(0,   '#C5005C');
  grad.addColorStop(0.5, C_PINK);
  grad.addColorStop(1,   '#8E0040');
  ctx.fillStyle = grad;
  rrect(ctx, CX, CY, CW, BH, 32, true, false);
  // Fill bottom 24 px of band square so it merges cleanly
  ctx.fillRect(CX, CY + BH - 24, CW, 24);

  // Pin dots
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  _circle(ctx, CX + 28, CY + 28, 7, true);
  _circle(ctx, CX + CW - 28, CY + 28, 7, true);

  // HACKER HOUSE wordmark
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle    = C_WHITE;
  ctx.font         = `900 56px ${F_DISPLAY}`;
  ctx.fillText('HACKER HOUSE', W / 2, CY + 74);

  // Sub-tagline row: गोवा · GOA, INDIA · 28 – 31 OCT 2026
  // Render as one centred string (mixed scripts still look fine at 22 px)
  ctx.font      = `700 22px ${F_MONO}`;
  ctx.fillStyle = 'rgba(251,246,233,0.88)';
  ctx.fillText('गोवा  ·  GOA, INDIA  ·  28 – 31 OCT 2026', W / 2, CY + 130);

  // Yellow accent line
  ctx.strokeStyle = C_YELLOW;
  ctx.lineWidth   = 3;
  ctx.beginPath();
  ctx.moveTo(CX + 28, CY + BH);
  ctx.lineTo(CX + CW - 28, CY + BH);
  ctx.stroke();

  // ── Avatar photo ──────────────────────────────────────────────────────────
  const PR    = 148; // photo radius
  const PCXV  = W / 2;
  const PCYV  = CY + BH + 24 + PR; // top of photo zone + radius

  drawGradientRing(ctx, PCXV, PCYV, PR + 3, PR + 19, C_PINK, C_YELLOW, C_SEA);
  ctx.strokeStyle = C_WHITE;
  ctx.lineWidth   = 4;
  _circle(ctx, PCXV, PCYV, PR - 3, false, true);

  await _drawPhoto(ctx, builder, PCXV, PCYV, PR);

  // ── Identity ──────────────────────────────────────────────────────────────
  // Start below photo with a 36 px gap
  let y = PCYV + PR + 44;

  // Name (scaled to fit)
  ctx.fillStyle    = C_INK;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  const nameStr  = builder.name.toUpperCase();
  let nameFS = 62;
  ctx.font = `900 ${nameFS}px ${F_DISPLAY}`;
  while (nameFS > 34 && ctx.measureText(nameStr).width > CW - 80) {
    nameFS -= 2;
    ctx.font = `900 ${nameFS}px ${F_DISPLAY}`;
  }
  ctx.fillText(nameStr, W / 2, y);
  y += Math.round(nameFS * 0.42) + 14;

  // Title pill
  const titleStr = builder.title.toUpperCase();
  let titleFS = 36;
  ctx.font = `700 ${titleFS}px ${F_DISPLAY}`;
  while (titleFS > 22 && ctx.measureText(titleStr).width > CW - 160) {
    titleFS -= 2;
    ctx.font = `700 ${titleFS}px ${F_DISPLAY}`;
  }
  const tW = ctx.measureText(titleStr).width + 56;
  ctx.fillStyle = C_PINK;
  rrect(ctx, W / 2 - tW / 2, y, tW, 52, 26, true, false);
  ctx.fillStyle = C_WHITE;
  ctx.fillText(titleStr, W / 2, y + 36);
  y += 68;

  // Handle · Builder # line
  const handlePart = builder.xUsername ? `@${builder.xUsername}  ·  ` : '';
  const metaStr    = `${handlePart}BUILDER #${builder.builderNumber}`;
  ctx.font      = `700 21px ${F_MONO}`;
  ctx.fillStyle = 'rgba(26,46,34,0.65)';
  ctx.fillText(metaStr, W / 2, y);
  y += 38;

  // Divider
  ctx.strokeStyle = 'rgba(26,46,34,0.10)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(CX + 48, y);
  ctx.lineTo(CX + CW - 48, y);
  ctx.stroke();
  y += 20;

  // ── Tech stack chips ──────────────────────────────────────────────────────
  const stack = builder.stack || [];
  if (stack.length > 0) {
    const PAD  = 24;
    const GAP  = 10;
    const BADH = 40;
    let chipFS = 19;
    ctx.font = `700 ${chipFS}px ${F_MONO}`;

    // Two-row wrapping
    const rows: string[][] = [[]];
    let rowW = 0;
    stack.forEach(s => {
      const w = ctx.measureText(s).width + PAD * 2;
      if (rowW + w + GAP > CW - 80 && rows[rows.length - 1].length > 0) {
        rows.push([]);
        rowW = 0;
      }
      rows[rows.length - 1].push(s);
      rowW += w + GAP;
    });

    rows.forEach(row => {
      if (row.length === 0) return;
      const ws  = row.map(s => ctx.measureText(s).width + PAD * 2);
      const tot = ws.reduce((a, b) => a + b, 0) + GAP * (row.length - 1);
      let sx = W / 2 - tot / 2;
      row.forEach((s, i) => {
        ctx.fillStyle = C_DARK_GRN;
        rrect(ctx, sx, y, ws[i], BADH, BADH / 2, true, false);
        ctx.fillStyle = C_YELLOW;
        ctx.textAlign = 'center';
        ctx.fillText(s, sx + ws[i] / 2, y + 27);
        sx += ws[i] + GAP;
      });
      y += BADH + 10;
    });
    y += 8;
  }

  // ── Stats row ─────────────────────────────────────────────────────────────
  // 4 stats in a single row, capped to card width
  const stats = [
    { l: 'COMMITS',  v: fmtN(builder.stats.commitCount) },
    { l: 'SHIP',     v: `${builder.stats.shipConfidence}` },
    { l: 'ENERGY',   v: `${builder.stats.energy}` },
    { l: 'CHAOS',    v: `${builder.stats.chaosIndex}` },
  ];
  const STAT_GAP = 12;
  const STAT_H   = 60;
  const STAT_W   = Math.floor((CW - 80 - STAT_GAP * (stats.length - 1)) / stats.length);
  let sx2 = CX + 40;

  stats.forEach((st, i) => {
    const bg = i % 2 === 0 ? C_YELLOW : C_PINK;
    ctx.fillStyle = bg;
    rrect(ctx, sx2, y, STAT_W, STAT_H, 14, true, false);

    ctx.font      = `800 28px ${F_DISPLAY}`;
    ctx.fillStyle = i % 2 === 0 ? C_INK : C_WHITE;
    ctx.textAlign = 'center';
    ctx.fillText(st.v, sx2 + STAT_W / 2, y + 34);

    ctx.font      = `700 11px ${F_MONO}`;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(26,46,34,0.65)' : 'rgba(255,255,255,0.78)';
    ctx.fillText(st.l, sx2 + STAT_W / 2, y + 52);

    sx2 += STAT_W + STAT_GAP;
  });
  y += STAT_H + 16;

  // ── Footer band ───────────────────────────────────────────────────────────
  const FH     = 130;
  const FBOT   = CY + CH;       // bottom of card
  const FTOP   = FBOT - FH;

  // Ensure footer doesn't crash into stats — push down if needed
  // (footer is anchored to card bottom, not curY)

  ctx.fillStyle = C_DARK_GRN;
  rrect(ctx, CX, FTOP, CW, FH, 32, true, false);
  // Square off the top corners so it merges with card body
  ctx.fillRect(CX, FTOP, CW, 16);

  // Accent strips
  ctx.fillStyle = C_YELLOW; ctx.fillRect(CX + 28, FTOP, 90, 3);
  ctx.fillStyle = C_SEA;    ctx.fillRect(CX + 124, FTOP, 70, 3);

  // Left: claim code
  const code = formatClaimCode(resolveClaimCode(builder.claimCode, builder.builderNumber));
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(251,246,233,0.5)';
  ctx.font      = `700 12px ${F_MONO}`;
  ctx.fillText('UNIQUE CODE', CX + 28, FTOP + 30);
  ctx.fillStyle = C_YELLOW;
  ctx.font      = `900 38px ${F_MONO}`;
  ctx.fillText(code, CX + 28, FTOP + 74);
  ctx.fillStyle = 'rgba(251,246,233,0.4)';
  ctx.font      = `700 11px ${F_MONO}`;
  ctx.fillText('HH GOA 2026 BUILDER PASS', CX + 28, FTOP + 104);

  // Right: hashtag + badge
  ctx.textAlign = 'right';
  ctx.fillStyle = C_WHITE;
  ctx.font      = `900 32px ${F_DISPLAY}`;
  ctx.fillText('#FrameInGoa', CX + CW - 28, FTOP + 48);

  const BADGEW = 130;
  ctx.fillStyle = C_PINK;
  rrect(ctx, CX + CW - 28 - BADGEW, FTOP + 62, BADGEW, 38, 19, true, false);
  ctx.fillStyle = C_WHITE;
  ctx.font      = `700 13px ${F_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('HH GOA 2026', CX + CW - 28 - BADGEW / 2, FTOP + 86);
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
  const R  = 355; // photo radius
  const RO = 378; // outer ring radius

  // Background
  _drawBg(ctx, S, S);

  // ── Photo ─────────────────────────────────────────────────────────────────
  await _drawPhoto(ctx, builder, CX, CX, R);

  // Gradient ring over photo edge
  drawGradientRing(ctx, CX, CX, R + 2, RO, C_PINK, C_YELLOW, C_SEA);
  ctx.strokeStyle = C_WHITE;
  ctx.lineWidth   = 4;
  _circle(ctx, CX, CX, R - 6, false, true);

  // ── Tropical foliage frame (drawn around circle) ──────────────────────────
  _drawProfileFoliage(ctx, CX, R);

  // ── Corner viewfinder brackets ────────────────────────────────────────────
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

  // ── Top banner ────────────────────────────────────────────────────────────
  const BW = 420, BH = 62, BX = CX - BW / 2, BY = 24;
  ctx.fillStyle = C_YELLOW;
  rrect(ctx, BX, BY, BW, BH, 31, true, false);
  ctx.strokeStyle = C_PINK;
  ctx.lineWidth   = 3;
  rrect(ctx, BX, BY, BW, BH, 31, false, true);
  ctx.fillStyle    = C_INK;
  ctx.font         = `800 28px ${F_DISPLAY}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('HACKER HOUSE  ·  GOA 2026', CX, BY + 42);

  // ── Bottom badge stack (3 items, each clearly separated) ─────────────────
  // Fixed positions from bottom: hashtag at bottom, code above, title above that
  const BOTTOM = S - 20;

  // 1. Hashtag badge (lowest)
  const HBH = 58, HBW = 340;
  const HBY = BOTTOM - HBH;
  ctx.fillStyle = C_PINK;
  rrect(ctx, CX - HBW / 2, HBY, HBW, HBH, HBH / 2, true, false);
  ctx.strokeStyle = C_YELLOW;
  ctx.lineWidth   = 3;
  rrect(ctx, CX - HBW / 2, HBY, HBW, HBH, HBH / 2, false, true);
  ctx.fillStyle = C_WHITE;
  ctx.font      = `800 30px ${F_DISPLAY}`;
  ctx.fillText('#FrameInGoa', CX, HBY + 38);

  // 2. Claim code (above hashtag, gap 10)
  const CCH = 44, CCW = 260;
  const CCY = HBY - 10 - CCH;
  ctx.fillStyle = C_DARK_GRN;
  rrect(ctx, CX - CCW / 2, CCY, CCW, CCH, CCH / 2, true, false);
  ctx.fillStyle = C_YELLOW;
  ctx.font      = `700 19px ${F_MONO}`;
  const code2 = formatClaimCode(resolveClaimCode(builder.claimCode, builder.builderNumber));
  ctx.fillText(code2, CX, CCY + 29);

  // 3. Title pill (above code, gap 10)
  const titleStr = builder.title.toUpperCase();
  let tFS = 26;
  ctx.font = `700 ${tFS}px ${F_DISPLAY}`;
  while (tFS > 16 && ctx.measureText(titleStr).width > 540) {
    tFS -= 2;
    ctx.font = `700 ${tFS}px ${F_DISPLAY}`;
  }
  const TW = Math.min(560, ctx.measureText(titleStr).width + 56);
  const TPH = 50;
  const TPY = CCY - 10 - TPH;
  ctx.fillStyle   = C_CREAM;
  rrect(ctx, CX - TW / 2, TPY, TW, TPH, TPH / 2, true, false);
  ctx.strokeStyle = C_INK;
  ctx.lineWidth   = 2;
  rrect(ctx, CX - TW / 2, TPY, TW, TPH, TPH / 2, false, true);
  ctx.fillStyle = C_INK;
  ctx.fillText(titleStr, CX, TPY + 34);
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
  _palmCluster(ctx,   0,   0,  70,  60, 1);  // angled right-down
  _monsteraLeaf(ctx, 22,  54, 52, Math.PI * 0.18, C_LEAF_DK, 0.92);
  _hibiscus(ctx, 60,  34, 20, C_PINK, C_YELLOW);
  ctx.restore();

  // ── Top-right cluster ─────────────────────────────────────────────────────
  ctx.save();
  ctx.translate(cx + cw, cy);
  ctx.scale(-1, 1); // mirror horizontally
  _palmCluster(ctx,   0,   0,  70,  60, 1);
  _monsteraLeaf(ctx, 22,  54, 52, Math.PI * 0.18, C_LEAF_DK, 0.92);
  _hibiscus(ctx, 60,  34, 20, C_PINK, C_YELLOW);
  ctx.restore();

  // ── Bottom-left cluster ───────────────────────────────────────────────────
  ctx.save();
  ctx.translate(cx, cy + ch);
  ctx.scale(1, -1); // mirror vertically
  _palmCluster(ctx,   0,   0,  90,  70, 1);
  _monsteraLeaf(ctx, 28,  60, 62, Math.PI * 0.22, C_LEAF_LT, 0.88);
  ctx.restore();

  // ── Bottom-right cluster ──────────────────────────────────────────────────
  ctx.save();
  ctx.translate(cx + cw, cy + ch);
  ctx.scale(-1, -1); // mirror both
  _palmCluster(ctx,   0,   0,  90,  70, 1);
  _monsteraLeaf(ctx, 28,  60, 62, Math.PI * 0.22, C_LEAF_LT, 0.88);
  _hibiscus(ctx, 64,  38, 18, '#FF4499', C_YELLOW);
  ctx.restore();
}

/**
 * Tropical foliage around the circular profile frame — fronds emerge from
 * outside the ring at the four diagonal corners.
 */
function _drawProfileFoliage(ctx: CanvasRenderingContext2D, center: number, r: number) {
  const D45 = r * Math.cos(Math.PI / 4); // ~0.707 * r offset per axis

  // Positions at 45° diagonals (NW, NE, SW, SE)
  const clusters: [number, number, number][] = [
    [center - D45, center - D45, -Math.PI * 0.15],  // top-left
    [center + D45, center - D45,  Math.PI * 0.15],  // top-right
    [center - D45, center + D45, -Math.PI * 0.85],  // bottom-left
    [center + D45, center + D45,  Math.PI * 0.85],  // bottom-right
  ];

  clusters.forEach(([ox, oy, angle], i) => {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(angle);

    // Frond pointing outward
    _singleFrond(ctx, 0, 0, 110, 0, 0.22, C_LEAF_LT, C_LEAF_DK, 0.92);

    // Monstera leaf at alternating corners
    if (i % 2 === 0) {
      _monsteraLeaf(ctx, -16, 10, 44, 0.3, C_LEAF_DK, 0.88);
    } else {
      _hibiscus(ctx, 8, -8, 18, C_PINK, C_YELLOW);
    }

    ctx.restore();
  });
}

// ── Botanical primitives ──────────────────────────────────────────────────────

/** Multi-frond palm crown emerging from a corner. */
function _palmCluster(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  _scale: number
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
      const s  = builder.photoSettings || { zoom: 1, panX: 0, panY: 0, preset: 'RAW' };
      const zm = s.zoom || 1;
      const d  = r * 2;
      const px = ((s.panX || 0) / 100) * d;
      const py = ((s.panY || 0) / 100) * d;
      const ir = img.width / img.height;
      let dw = d * zm, dh = d * zm;
      if (ir > 1) dw = d * ir * zm; else dh = (d / ir) * zm;
      ctx.drawImage(img, cx - dw / 2 + px, cy - dh / 2 + py, dw, dh);
      ctx.restore();
      return;
    } catch { /* fall through to placeholder */ }
  }
  ctx.fillStyle = C_BG;
  _circle(ctx, cx, cy, r, true);
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
    img.crossOrigin = 'Anonymous';
    img.onload  = () => resolve(img);
    img.onerror = e  => reject(e);
    img.src = url;
  });
}

function fmtN(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return `${n}`;
}

/** Deterministic jitter [0,1). */
function _j(i: number, salt: number): number {
  return ((i * 2654435761 + salt * 40503) % 100000) / 100000;
}



