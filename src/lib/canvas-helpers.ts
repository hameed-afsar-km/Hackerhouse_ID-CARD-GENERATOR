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
const F_DEVA       = '"Noto Sans Devanagari", "Nirmala UI", sans-serif';
const F_MONO       = '"Geist Mono", "Courier New", monospace';

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

  // ── 0. Ambient backdrop ───────────────────────────────────────────────────
  _drawBg(ctx, W, H, builder.photoSettings?.cardBackground || 'NIGHT');

  // ── Card Surface Margins ───────────────────────────────────────────────────
  const CX = 54, CY = 54, CW = W - 108, CH = H - 108;

  const cardTheme = builder.photoSettings?.cardTheme || 'TROPICAL';
  const frameStyle = builder.photoSettings?.frameStyle || (cardTheme === 'SUNSET' ? 'SUNBURST' : cardTheme === 'CYBER' ? 'CIRCUIT' : cardTheme === 'OBSIDIAN' ? 'OBSIDIAN' : cardTheme === 'HOLOGRAPHIC' ? 'HOLO' : cardTheme === 'MINIMAL' ? 'MINIMAL' : 'WREATH');

  // Theme palettes with pure Tropical Goa emerald-gold as prime design
  let surfGradCols = ['#042213', '#094225', '#02180C'];
  let bandGradCols = ['#021F0F', '#0B6B3A', '#137F46'];
  let footGradCols = ['#137F46', '#0B6B3A', '#021F0F'];
  let borderCol = '#FFE600';
  let innerBorderCol = '#FFB84D';
  let nameCol = '#FFFFFF';
  let pillColor = '#FF007A';
  let pillTextColor = '#FFFFFF';
  let chipBg = '#05331B';
  let chipBorder = '#FFE600';
  let chipTextColor = '#FBF6E9';
  let plateBg = '#02190D';
  let plateBorder = '#FFE600';
  let plateCodeColor = '#FFE600';
  let ringCols = ['#2EC4B6', '#FFE600', '#FF007A'];
  let topPillBg = 'rgba(255,230,0,0.18)';
  let topPillBorder = '#FFE600';
  let topPillText = '#FFE600';
  let isDarkSurface = true;

  if (cardTheme === 'SUNSET') {
    surfGradCols = ['#1F0D24', '#2E1139', '#15061B'];
    bandGradCols = ['#FF6A3D', '#FF2E63', '#9C3FE4'];
    footGradCols = ['#9C3FE4', '#FF2E63', '#FF6A3D'];
    borderCol = '#FF9E54';
    innerBorderCol = '#FF2E63';
    pillColor = '#FF5E3A';
    chipBg = '#2A0E35';
    chipBorder = '#FF6A3D';
    chipTextColor = '#FFE7CE';
    plateBg = '#190820';
    plateBorder = '#FF6A3D';
    plateCodeColor = '#FF9E54';
    ringCols = ['#FF6A3D', '#FF2E63', '#9C3FE4'];
    topPillBg = 'rgba(255,110,61,0.2)';
    topPillBorder = '#FF9E54';
    topPillText = '#FF9E54';
  } else if (cardTheme === 'CYBER') {
    surfGradCols = ['#080E24', '#0F1D45', '#050917'];
    bandGradCols = ['#00E5FF', '#7A5CFF', '#FF2E88'];
    footGradCols = ['#FF2E88', '#7A5CFF', '#00E5FF'];
    borderCol = '#00E5FF';
    innerBorderCol = '#FF2E88';
    pillColor = '#FF2E88';
    chipBg = '#0E1E3D';
    chipBorder = '#00E5FF';
    chipTextColor = '#00E5FF';
    plateBg = '#071020';
    plateBorder = '#00E5FF';
    plateCodeColor = '#00E5FF';
    ringCols = ['#00E5FF', '#7A5CFF', '#FF2E88'];
    topPillBg = 'rgba(0,229,255,0.18)';
    topPillBorder = '#00E5FF';
    topPillText = '#00E5FF';
  } else if (cardTheme === 'OBSIDIAN') {
    surfGradCols = ['#0D0F12', '#181C24', '#08090C'];
    bandGradCols = ['#1E222B', '#2C3240', '#14171E'];
    footGradCols = ['#2C3240', '#1E222B', '#14171E'];
    borderCol = '#FFD700';
    innerBorderCol = '#E6A817';
    pillColor = '#D4AF37';
    pillTextColor = '#0D0F12';
    chipBg = '#14171E';
    chipBorder = '#FFD700';
    chipTextColor = '#FFD700';
    plateBg = '#090A0D';
    plateBorder = '#FFD700';
    plateCodeColor = '#FFD700';
    ringCols = ['#FFFFFF', '#FFD700', '#E6A817'];
    topPillBg = 'rgba(255,215,0,0.18)';
    topPillBorder = '#FFD700';
    topPillText = '#FFD700';
  } else if (cardTheme === 'HOLOGRAPHIC') {
    surfGradCols = ['#0C1028', '#1A163B', '#090C1F'];
    bandGradCols = ['#00FFFF', '#FF00FF', '#FFFF00'];
    footGradCols = ['#FFFF00', '#FF00FF', '#00FFFF'];
    borderCol = '#00FFFF';
    innerBorderCol = '#FF00FF';
    pillColor = '#FF00FF';
    chipBg = '#121430';
    chipBorder = '#00FFFF';
    chipTextColor = '#00FFFF';
    plateBg = '#080B1C';
    plateBorder = '#00FFFF';
    plateCodeColor = '#00FFFF';
    ringCols = ['#00FFFF', '#FF00FF', '#FFFF00'];
    topPillBg = 'rgba(0,255,255,0.2)';
    topPillBorder = '#00FFFF';
    topPillText = '#00FFFF';
  } else if (cardTheme === 'MINIMAL') {
    surfGradCols = ['#FFFBF2', '#FFF6E5', '#FFEED6'];
    bandGradCols = ['#8A5A2B', '#6B4A2E', '#4A3418'];
    footGradCols = ['#4A3418', '#6B4A2E', '#8A5A2B'];
    borderCol = '#4A3418';
    innerBorderCol = '#8A5A2B';
    nameCol = '#4A2418';
    pillColor = '#6B4A2E';
    chipBg = '#FFE7CE';
    chipBorder = '#4A3418';
    chipTextColor = '#4A3418';
    plateBg = '#FFFDF8';
    plateBorder = '#6B4A2E';
    plateCodeColor = '#4A2418';
    ringCols = ['#8A5A2B', '#6B4A2E', '#4A3418'];
    topPillBg = 'rgba(74,36,24,0.1)';
    topPillBorder = '#4A3418';
    topPillText = '#4A3418';
    isDarkSurface = false;
  }

  // Soft offset drop shadow for realistic ID card elevation
  ctx.save();
  ctx.shadowColor   = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur    = 64;
  ctx.shadowOffsetY = 32;
  ctx.fillStyle = '#062B17';
  rrect(ctx, CX, CY, CW, CH, 36, true, false);
  ctx.restore();

  // Surface fill — rich tropical emerald gradient
  const surfGrad = ctx.createLinearGradient(CX, CY, CX, CY + CH);
  surfGrad.addColorStop(0, surfGradCols[0]);
  surfGrad.addColorStop(0.5, surfGradCols[1]);
  surfGrad.addColorStop(1, surfGradCols[2]);
  ctx.fillStyle = surfGrad;
  rrect(ctx, CX, CY, CW, CH, 36, true, false);

  // Dappled ambient sunlight on tropical canopy
  ctx.save();
  const sunBeam = ctx.createRadialGradient(W / 2, CY + 480, 50, W / 2, CY + 480, CW * 0.65);
  sunBeam.addColorStop(0, isDarkSurface ? 'rgba(255,230,0,0.18)' : 'rgba(255,255,255,0.45)');
  sunBeam.addColorStop(0.5, isDarkSurface ? 'rgba(46,196,182,0.10)' : 'rgba(255,249,234,0.20)');
  sunBeam.addColorStop(1, 'transparent');
  ctx.fillStyle = sunBeam;
  rrect(ctx, CX, CY, CW, CH, 36, true, false);
  ctx.restore();

  // Draw rich botanical foliage and theme-responsive background vector art
  _drawCardBodyThemeArt(ctx, CX, CY, CW, CH, cardTheme, W, H, isDarkSurface);
  if (cardTheme === 'TROPICAL') {
    _drawCardFoliageFrame(ctx, CX, CY, CW, CH);
  }

  // Pure 24K Gold Double Border with corner flourishes
  ctx.strokeStyle = borderCol;
  ctx.lineWidth   = 4.5;
  rrect(ctx, CX, CY, CW, CH, 36, false, true);
  ctx.strokeStyle = innerBorderCol;
  ctx.lineWidth   = 2;
  rrect(ctx, CX + 12, CY + 12, CW - 24, CH - 24, 28, false, true);

  // Corner gold star rivets
  [
    [CX + 28, CY + 28],
    [CX + CW - 28, CY + 28],
    [CX + 28, CY + CH - 28],
    [CX + CW - 28, CY + CH - 28],
  ].forEach(([rx, ry]) => {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    _circle(ctx, rx, ry, 7, true);
    ctx.fillStyle = borderCol;
    _circle(ctx, rx, ry, 4, true);
  });

  // ── Layout Geometry Heights ────────────────────────────────────────────────
  const FOOTER_H = 185;
  const FBOT = CY + CH;
  const FTOP = FBOT - FOOTER_H;
  const PLATE_H = 185;
  const PLATE_W = CW - 90;
  const plateTop = FTOP - PLATE_H - 24;
  const chipBottomMax = plateTop - 22;

  // ── 1 & 2. HEADER: TOP BADGE + HACKER HOUSE TITLE + LOCATION/DATE ───────────
  const BH = 215; // Header Height

  // Tropical header band
  const bandGrad = ctx.createLinearGradient(CX, CY, CX, CY + BH);
  bandGrad.addColorStop(0,    bandGradCols[0]);
  bandGrad.addColorStop(0.55, bandGradCols[1]);
  bandGrad.addColorStop(1,    bandGradCols[2]);
  ctx.fillStyle = bandGrad;
  rrect(ctx, CX, CY, CW, BH, 36, true, false);
  ctx.fillRect(CX, CY + BH - 24, CW, 24);

  // Top Credential Pill: OFFICIAL BUILDER ID
  const RW = 340, RH = 34;
  ctx.fillStyle = topPillBg;
  rrect(ctx, W / 2 - RW / 2, CY + 22, RW, RH, RH / 2, true, false);
  ctx.strokeStyle = topPillBorder;
  ctx.lineWidth = 1.5;
  rrect(ctx, W / 2 - RW / 2, CY + 22, RW, RH, RH / 2, false, true);
  ctx.fillStyle = topPillText;
  ctx.font = `800 13px ${F_MONO}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('✦ OFFICIAL BUILDER ID  ·  HH GOA 2026 ✦', W / 2, CY + 44);

  // Flanking retro sunburst accents
  _retroSun(ctx, CX + 92, CY + 112, 32, 14, isDarkSurface ? 'rgba(255,230,0,0.70)' : 'rgba(255,249,234,0.40)');
  _retroSun(ctx, CX + CW - 92, CY + 112, 32, 14, isDarkSurface ? 'rgba(255,230,0,0.90)' : 'rgba(255,249,234,0.90)');

  // 1. HACKER HOUSE Title (Monumental Display Typography)
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle    = isDarkSurface ? '#FFE600' : C_WHITE;
  ctx.font         = `900 74px ${F_DISPLAY}`;
  ctx.shadowColor  = isDarkSurface ? 'rgba(255,230,0,0.45)' : 'rgba(0,0,0,0.25)';
  ctx.shadowBlur   = 16;
  ctx.shadowOffsetY = 2;
  ctx.fillText('HACKER HOUSE', W / 2, CY + 124);
  ctx.shadowColor  = 'transparent';
  ctx.shadowBlur   = 0;
  ctx.shadowOffsetY = 0;

  // 2. Location and Date Line
  ctx.fillStyle = isDarkSurface ? '#FFFFFF' : 'rgba(255,249,234,0.95)';
  ctx.textAlign = 'left';
  ctx.font      = `700 24px ${F_DEVA}`;
  const goaStr = 'गोवा';
  const goaW   = ctx.measureText(goaStr).width;
  ctx.font = `700 22px ${F_MONO}`;
  const restStr = '  ·  GOA, INDIA  ·  28 – 31 OCT 2026';
  const restW   = ctx.measureText(restStr).width;
  const TAG_GAP = 18;
  let tagX = W / 2 - (goaW + TAG_GAP + restW) / 2;
  ctx.font = `700 24px ${F_DEVA}`;
  ctx.fillText(goaStr, tagX, CY + 175);
  tagX += goaW + TAG_GAP;
  ctx.font = `700 22px ${F_MONO}`;
  ctx.fillText(restStr, tagX, CY + 175);

  // Wavy coastal divider
  _waveStrip(ctx, CX, CY + BH - 8, CW, 32, bandGradCols[1]);
  _waveStrip(ctx, CX, CY + BH + 10, CW, 20, isDarkSurface ? 'rgba(255,230,0,0.50)' : 'rgba(255,184,77,0.55)');

  // ── 3. CIRCLE IMAGE FRAME (LARGE WITH BORDER GRADIENT) ────────────────────
  const PR   = 210; // Large photo radius (diameter = 420px)
  const PCXV = W / 2;
  const PCYV = CY + BH + 70 + PR;

  // Ambient emerald-gold halo behind the avatar
  ctx.fillStyle = isDarkSurface ? 'rgba(46,196,182,0.32)' : 'rgba(255,184,77,0.38)';
  _circle(ctx, PCXV, PCYV, PR + 48, true);

  // Multi-stop gradient halo ring
  drawGradientRing(ctx, PCXV, PCYV, PR + 6, PR + 30, ringCols[0], ringCols[1], ringCols[2]);

  // Crisp inner rim
  ctx.strokeStyle = isDarkSurface ? '#FFE600' : C_WHITE;
  ctx.lineWidth   = 5;
  _circle(ctx, PCXV, PCYV, PR - 4, false, true);

  // Draw user photo or avatar monogram
  await _drawPhoto(ctx, builder, PCXV, PCYV, PR);

  // Dynamic Theme Frame Overlay
  if (frameStyle === 'SUNBURST' || cardTheme === 'SUNSET') {
    _drawProfileSunburstFrame(ctx, PCXV, PCYV, PR, PR + 30);
  } else if (frameStyle === 'CIRCUIT' || cardTheme === 'CYBER') {
    _drawProfileCircuitFrame(ctx, PCXV, PCYV, PR, PR + 30);
  } else if (frameStyle === 'NEON') {
    _drawProfileNeonFrame(ctx, PCXV, PCYV, PR, PR + 30);
  } else if (frameStyle === 'OBSIDIAN' || cardTheme === 'OBSIDIAN') {
    _drawProfileObsidianFrame(ctx, PCXV, PCYV, PR, PR + 30);
  } else if (frameStyle === 'HOLO' || cardTheme === 'HOLOGRAPHIC') {
    _drawProfileHoloFrame(ctx, PCXV, PCYV, PR, PR + 30);
  } else if (frameStyle === 'MINIMAL' || cardTheme === 'MINIMAL') {
    _drawProfileMinimalFrame(ctx, PCXV, PCYV, PR, PR + 30);
  } else {
    _drawProfileFoliageFrame(ctx, PCXV, PCYV, PR, PR + 30);
  }

  // ── 4. NAME (BOLD CENTERED DISPLAY TYPOGRAPHY) ────────────────────────────
  let y = PCYV + PR + 56;

  ctx.fillStyle    = nameCol;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  const nameStr  = (builder.name || 'BUILDER').toUpperCase();
  let nameFS = 64;
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
    if (isDarkSurface) {
      ctx.shadowColor = 'rgba(0,0,0,0.65)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
    }
    ctx.fillText(line, W / 2, y + i * Math.round(nameFS * 1.02));
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  });
  y += nameLines.length * Math.round(nameFS * 1.02) + 16;

  // ── 5. ROLE (STYLIZED TROPICAL ROLE CAPSULE - ENLARGED) ───────────────────
  const titleStr = `✦ ${(builder.title || 'BUILDER').toUpperCase()} ✦`;
  let titleFS = 46;
  ctx.font = `800 ${titleFS}px ${F_DISPLAY}`;
  while (titleFS > 24 && ctx.measureText(titleStr).width > CW - 140) {
    titleFS -= 2;
    ctx.font = `800 ${titleFS}px ${F_DISPLAY}`;
  }
  const pillH = 68;
  const tW = Math.min(CW - 80, ctx.measureText(titleStr).width + 80);
  ctx.save();
  ctx.translate(W / 2, y + pillH / 2);
  ctx.rotate(-0.02);
  ctx.fillStyle = pillColor;
  rrect(ctx, -tW / 2, -pillH / 2, tW, pillH, pillH / 2, true, false);
  ctx.strokeStyle = isDarkSurface ? '#FFE600' : C_CREAM;
  ctx.lineWidth   = 4;
  rrect(ctx, -tW / 2, -pillH / 2, tW, pillH, pillH / 2, false, true);
  ctx.fillStyle = pillTextColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(titleStr, 0, 1);
  ctx.restore();
  y += pillH + 20;

  // ── 6. SKILL STACK (LABEL + CENTERED TECH TAGS - ENLARGED) ────────────────
  const stack = builder.stack || [];
  if (stack.length > 0) {
    const PAD = 32, GAP = 14, BADH = 58, chipFS = 26;
    ctx.font = `800 ${chipFS}px ${F_MONO}`;

    const rows: string[][] = [[]];
    let rowW = 0;
    let leftOver = 0;
    stack.forEach((s) => {
      const w = ctx.measureText(s).width + PAD * 2;
      if (leftOver > 0) { leftOver += 1; return; }
      if (rowW + w + GAP > CW - 80 && rows[rows.length - 1].length > 0) {
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

    let nRowsFit = 0;
    let ry = y;
    while (nRowsFit < 2 && ry + BADH <= chipBottomMax) {
      nRowsFit += 1;
      ry += BADH + 10;
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
        ctx.fillStyle = chipBg;
        ctx.strokeStyle = chipBorder;
        ctx.lineWidth   = 3.5;
        rrect(ctx, sx, y, ws[i], BADH, BADH / 2, true, true);
        ctx.fillStyle = chipTextColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s, sx + ws[i] / 2, y + BADH / 2 + 1);
        sx += ws[i] + GAP;
      });
      y += BADH + 10;
    });
  }

  // ── 7. 12 CHARACTER CODE IN THE CENTER, VERY BIG ─────────────────────────
  const code = formatClaimCode(resolveClaimCode(builder.claimCode, builder.builderNumber));
  ctx.save();
  ctx.translate(W / 2, plateTop + PLATE_H / 2);
  ctx.rotate(-0.012);

  // Soft plate drop shadow
  ctx.shadowColor   = 'rgba(0,0,0,0.40)';
  ctx.shadowBlur    = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = plateBg;
  rrect(ctx, -PLATE_W / 2, -PLATE_H / 2, PLATE_W, PLATE_H, 24, true, false);
  ctx.shadowColor = 'transparent';

  // High security ticket borders & tech corner ticks
  ctx.strokeStyle = plateBorder;
  ctx.lineWidth   = 3.5;
  rrect(ctx, -PLATE_W / 2, -PLATE_H / 2, PLATE_W, PLATE_H, 24, false, true);
  ctx.strokeStyle = innerBorderCol;
  ctx.lineWidth   = 1.5;
  rrect(ctx, -PLATE_W / 2 + 8, -PLATE_H / 2 + 8, PLATE_W - 16, PLATE_H - 16, 18, false, true);

  // Security micro-lines / barcode ticks on the right & left of the plate
  const tickY = -PLATE_H / 2 + 30;
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = i % 2 === 0 ? plateBorder : innerBorderCol;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-PLATE_W / 2 + 18 + i * 8, tickY);
    ctx.lineTo(-PLATE_W / 2 + 18 + i * 8, tickY + 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(PLATE_W / 2 - 18 - i * 8, tickY);
    ctx.lineTo(PLATE_W / 2 - 18 - i * 8, tickY + 20);
    ctx.stroke();
  }

  // Label: ◆ 12-CHARACTER ACCESS CODE ◆
  ctx.textAlign = 'center';
  ctx.fillStyle = isDarkSurface ? 'rgba(255,230,0,0.90)' : 'rgba(74,36,24,0.65)';
  ctx.font      = `800 15px ${F_MONO}`;
  ctx.fillText('◆ 12-CHARACTER ACCESS CODE ◆', 0, -PLATE_H / 2 + 42);

  // Very big 12-character code
  let codeFS = 90;
  ctx.font = `900 ${codeFS}px ${F_MONO}`;
  while (codeFS > 46 && ctx.measureText(code).width > PLATE_W - 56) {
    codeFS -= 2;
    ctx.font = `900 ${codeFS}px ${F_MONO}`;
  }
  ctx.fillStyle = plateCodeColor;
  ctx.fillText(code, 0, PLATE_H / 2 - 58);
  ctx.restore();

  // ── 8. FOOTER: #FrameInGoa IN CENTER BIG ──────────────────────────────────
  const footGrad = ctx.createLinearGradient(CX, FTOP, CX, CY + CH);
  footGrad.addColorStop(0,   footGradCols[0]);
  footGrad.addColorStop(0.5, footGradCols[1]);
  footGrad.addColorStop(1,   footGradCols[2]);
  ctx.fillStyle = footGrad;
  rrect(ctx, CX, FTOP, CW, FOOTER_H, 36, true, false);
  ctx.fillRect(CX, FTOP, CW, 16);

  // Retro sun accents on footer sides
  _retroSun(ctx, CX + 84, FTOP + 76, 26, 12, isDarkSurface ? 'rgba(255,230,0,0.60)' : 'rgba(255,249,234,0.30)');
  _retroSun(ctx, CX + CW - 84, FTOP + 76, 26, 12, isDarkSurface ? 'rgba(255,230,0,0.60)' : 'rgba(255,249,234,0.30)');

  // Waves lapping the top edge of the footer
  _waveStrip(ctx, CX, FTOP - 14, CW, 28, isDarkSurface ? '#042213' : '#FFEED6');

  // #FrameInGoa — big, bold, centered in footer
  ctx.textAlign = 'center';
  ctx.font      = `900 70px ${F_DISPLAY}`;
  ctx.strokeStyle = isDarkSurface ? 'rgba(0,0,0,0.65)' : 'rgba(74,36,24,0.6)';
  ctx.lineWidth   = 8;
  ctx.lineJoin    = 'round';
  ctx.strokeText('#FrameInGoa', W / 2, FTOP + 92);
  ctx.fillStyle = isDarkSurface ? '#FFFFFF' : C_WHITE;
  ctx.fillText('#FrameInGoa', W / 2, FTOP + 92);

  ctx.fillStyle = isDarkSurface ? '#FFE600' : 'rgba(255,249,234,0.92)';
  ctx.font      = `700 16px ${F_MONO}`;
  ctx.fillText('HACKER HOUSE GOA 2026  ·  VERIFIED BUILDER ID', W / 2, FTOP + 144);
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
  _drawBg(ctx, S, S, builder.photoSettings?.cardBackground || 'NIGHT');

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
  } else if (frameStyle === 'CIRCUIT') {
    _drawProfileCircuitFrame(ctx, CX, CY_CIRCLE, R, RO);
  } else if (frameStyle === 'HOLO') {
    _drawProfileHoloFrame(ctx, CX, CY_CIRCLE, R, RO);
  } else if (frameStyle === 'OBSIDIAN') {
    _drawProfileObsidianFrame(ctx, CX, CY_CIRCLE, R, RO);
  } else if (frameStyle === 'MINIMAL') {
    _drawProfileMinimalFrame(ctx, CX, CY_CIRCLE, R, RO);
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
 * Obsidian Gold Luxury Frame Style —
 * 24K liquid gold beveled luxury multi-ring with 8 diamond star markers and gold sparkle flares.
 */
function _drawProfileObsidianFrame(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, ro: number
) {
  ctx.save();
  // Beveled outer liquid gold metallic ring
  const goldGrad = ctx.createLinearGradient(cx - ro, cy - ro, cx + ro, cy + ro);
  goldGrad.addColorStop(0, '#FFF3A8');
  goldGrad.addColorStop(0.25, '#D4AF37');
  goldGrad.addColorStop(0.5, '#AA7C11');
  goldGrad.addColorStop(0.75, '#FFDF73');
  goldGrad.addColorStop(1, '#996515');

  ctx.shadowColor = 'rgba(212, 175, 55, 0.65)';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 5.5;
  _circle(ctx, cx, cy, ro + 12, false, true);

  // Thin outer dashed precision ring
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
  ctx.lineWidth = 1.5;
  _circle(ctx, cx, cy, ro + 24, false, true);

  // 8 Diamond faceted gold nodes at 45 degree intervals
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const px = cx + Math.cos(a) * (ro + 12);
    const py = cy + Math.sin(a) * (ro + 12);
    ctx.fillStyle = '#FFE066';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(px, py - 6);
    ctx.lineTo(px + 6, py);
    ctx.lineTo(px, py + 6);
    ctx.lineTo(px - 6, py);
    ctx.closePath();
    ctx.fill();
  }

  // Corner Gold Sparkles
  [
    [cx - ro * 0.76, cy - ro * 0.76],
    [cx + ro * 0.76, cy - ro * 0.76],
    [cx - ro * 0.76, cy + ro * 0.76],
    [cx + ro * 0.76, cy + ro * 0.76],
  ].forEach(([sx, sy]) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 12;
    _circle(ctx, sx, sy, 3.5, true);
    ctx.strokeStyle = 'rgba(255, 223, 115, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx - 8, sy); ctx.lineTo(sx + 8, sy);
    ctx.moveTo(sx, sy - 8); ctx.lineTo(sx, sy + 8);
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Minimal Precision Editorial Frame Style —
 * Clean double ring with cardinal coordinate tick marks and precision calipers.
 */
function _drawProfileMinimalFrame(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, ro: number
) {
  ctx.save();
  ctx.strokeStyle = '#4A3418';
  ctx.lineWidth = 3.5;
  _circle(ctx, cx, cy, ro + 10, false, true);

  ctx.strokeStyle = 'rgba(74, 52, 24, 0.35)';
  ctx.lineWidth = 1.5;
  _circle(ctx, cx, cy, ro + 20, false, true);

  // Precision cardinal tick marks around the ring (every 15 degrees)
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const isMajor = i % 6 === 0;
    const len = isMajor ? 14 : 7;
    ctx.strokeStyle = isMajor ? '#4A3418' : 'rgba(74, 52, 24, 0.4)';
    ctx.lineWidth = isMajor ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (ro + 20), cy + Math.sin(a) * (ro + 20));
    ctx.lineTo(cx + Math.cos(a) * (ro + 20 + len), cy + Math.sin(a) * (ro + 20 + len));
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Cyber Circuit Frame Style —
 * Glowing cybernetic corner HUD brackets and neon circuit ticks.
 */
function _drawProfileCircuitFrame(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, ro: number
) {
  ctx.save();
  const bLen = 52;
  const rad = ro + 14;
  const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  corners.forEach(([dx, dy]) => {
    const px = cx + dx * rad * 0.72;
    const py = cy + dy * rad * 0.72;
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(px + dx * bLen, py);
    ctx.lineTo(px, py);
    ctx.lineTo(px, py + dy * bLen);
    ctx.stroke();

    // Corner tech node
    ctx.fillStyle = '#FF2E88';
    ctx.shadowColor = '#FF2E88';
    _circle(ctx, px, py, 4.5, true);
  });

  // Circuit tick lines
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.65)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (ro + 4), cy + Math.sin(a) * (ro + 4));
    ctx.lineTo(cx + Math.cos(a) * (ro + 20), cy + Math.sin(a) * (ro + 20));
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Holographic Shimmer Frame Style —
 * Prismatic iridescent double ring with 4-point sparkle stars.
 */
function _drawProfileHoloFrame(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, ro: number
) {
  ctx.save();
  const g = ctx.createLinearGradient(cx - ro, cy - ro, cx + ro, cy + ro);
  g.addColorStop(0, '#00FFFF');
  g.addColorStop(0.25, '#FF00FF');
  g.addColorStop(0.5, '#FFFF00');
  g.addColorStop(0.75, '#00FF00');
  g.addColorStop(1, '#00FFFF');

  ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
  ctx.shadowBlur = 24;
  ctx.strokeStyle = g;
  ctx.lineWidth = 6;
  _circle(ctx, cx, cy, ro + 14, false, true);

  // Sparkle stars
  [
    [cx - ro * 0.82, cy - ro * 0.52],
    [cx + ro * 0.85, cy - ro * 0.32],
    [cx - ro * 0.62, cy + ro * 0.72],
    [cx + ro * 0.72, cy + ro * 0.65],
  ].forEach(([sx, sy]) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 14;
    _circle(ctx, sx, sy, 4, true);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - 11, sy); ctx.lineTo(sx + 11, sy);
    ctx.moveTo(sx, sy - 11); ctx.lineTo(sx, sy + 11);
    ctx.stroke();
  });
  ctx.restore();
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
  ctx.rotate(-Math.PI * 0.28);
  _singleFrond(ctx, 0, 0, 130, 0, 0.28, C_LEAF_LT, C_LEAF_DK, 0.96);
  _monsteraLeaf(ctx, -18, 22, 60, Math.PI * 0.18, C_LEAF_DK, 0.92);
  _hibiscus(ctx, 24, -12, 22, C_PINK, C_YELLOW);
  ctx.restore();

  // Top-right diagonal of outer ring
  ctx.save();
  ctx.translate(cx + ro * 0.72, cy - ro * 0.72);
  ctx.rotate(Math.PI * 0.28);
  _singleFrond(ctx, 0, 0, 130, 0, 0.28, C_LEAF_LT, C_LEAF_DK, 0.96);
  _monsteraLeaf(ctx, 18, 22, 60, -Math.PI * 0.18, C_LEAF_DK, 0.92);
  _hibiscus(ctx, -24, -12, 22, C_PINK, C_YELLOW);
  ctx.restore();

  // Mid-left frond flourish
  ctx.save();
  ctx.translate(cx - ro - 8, cy);
  ctx.rotate(-Math.PI * 0.05);
  _singleFrond(ctx, 0, 0, 110, 0, 0.22, C_LEAF_LT, C_LEAF_DK, 0.90);
  _monsteraLeaf(ctx, -14, 18, 50, Math.PI * 0.1, C_LEAF_DK, 0.86);
  ctx.restore();

  // Mid-right frond flourish
  ctx.save();
  ctx.translate(cx + ro + 8, cy);
  ctx.rotate(Math.PI * 0.05);
  _singleFrond(ctx, 0, 0, 110, 0, 0.22, C_LEAF_LT, C_LEAF_DK, 0.90);
  _monsteraLeaf(ctx, 14, 18, 50, -Math.PI * 0.1, C_LEAF_DK, 0.86);
  ctx.restore();

  // Bottom-left diagonal of outer ring
  ctx.save();
  ctx.translate(cx - ro * 0.76, cy + ro * 0.65);
  ctx.rotate(-Math.PI * 0.75);
  _singleFrond(ctx, 0, 0, 125, 0, 0.32, C_LEAF_LT, C_LEAF_DK, 0.92);
  _monsteraLeaf(ctx, -12, 26, 62, 0, C_LEAF_DK, 0.90);
  _hibiscus(ctx, -20, 12, 18, '#FF5E99', C_YELLOW);
  ctx.restore();

  // Bottom-right diagonal of outer ring
  ctx.save();
  ctx.translate(cx + ro * 0.76, cy + ro * 0.65);
  ctx.rotate(Math.PI * 0.75);
  _singleFrond(ctx, 0, 0, 125, 0, 0.32, C_LEAF_LT, C_LEAF_DK, 0.92);
  _monsteraLeaf(ctx, 12, 26, 62, 0, C_LEAF_DK, 0.90);
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
 * Render theme-responsive vector background art inside the card body
 * (behind the avatar, name, badges, and code plate).
 */
function _drawCardBodyThemeArt(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, cw: number, ch: number,
  theme: string,
  W: number, H: number,
  isDarkSurface: boolean
) {
  ctx.save();

  // Clip all background vector artwork to inside the card boundary
  ctx.beginPath();
  rrect(ctx, cx, cy, cw, ch, 36, false, false);
  ctx.clip();

  if (theme === 'TROPICAL') {
    // 1. Large sweeping tropical palm fronds on mid-left & mid-right margins
    ctx.save();
    // Mid-left arching palm frond
    _drawSweepingPalm(ctx, cx - 20, cy + ch * 0.46, 290, Math.PI * 0.12, 0.45, 'rgba(26,122,66,0.60)', 'rgba(10,74,37,0.85)', 'rgba(255,230,0,0.35)');
    // Mid-right arching palm frond (mirrored)
    _drawSweepingPalm(ctx, cx + cw + 20, cy + ch * 0.52, 290, -Math.PI * 0.88, 0.45, 'rgba(26,122,66,0.60)', 'rgba(10,74,37,0.85)', 'rgba(255,230,0,0.35)');
    
    // Lower sweeping fronds
    _drawSweepingPalm(ctx, cx - 15, cy + ch * 0.72, 250, -Math.PI * 0.1, 0.4, 'rgba(10,74,37,0.50)', 'rgba(6,78,41,0.75)', 'rgba(255,230,0,0.25)');
    _drawSweepingPalm(ctx, cx + cw + 15, cy + ch * 0.32, 250, Math.PI * 0.9, 0.4, 'rgba(10,74,37,0.50)', 'rgba(6,78,41,0.75)', 'rgba(255,230,0,0.25)');

    // Large Monstera leaf silhouettes at side flanks
    _monsteraLeaf(ctx, cx + 55, cy + ch * 0.62, 115, Math.PI * 0.25, 'rgba(6,78,41,0.65)', 0.88);
    _monsteraLeaf(ctx, cx + cw - 55, cy + ch * 0.40, 105, -Math.PI * 0.35, 'rgba(6,78,41,0.65)', 0.88);

    // Floating hibiscus blossoms
    _hibiscus(ctx, cx + 65, cy + ch * 0.36, 26, 'rgba(255,0,122,0.75)', 'rgba(255,230,0,0.9)');
    _hibiscus(ctx, cx + cw - 65, cy + ch * 0.68, 24, 'rgba(255,0,122,0.75)', 'rgba(255,230,0,0.9)');

    // Ambient floating golden pollen / fireflies in backdrop
    for (let i = 0; i < 30; i++) {
      const fx = cx + cw * _j(i, 43);
      const fy = cy + ch * (0.18 + _j(i, 57) * 0.68);
      ctx.fillStyle = `rgba(255,230,0,${(0.2 + _j(i, 61) * 0.45).toFixed(2)})`;
      _circle(ctx, fx, fy, 1.8 + _j(i, 67) * 2.6, true);
    }
    ctx.restore();

  } else if (theme === 'SUNSET') {
    // Sunset solar flares and coconut frond silhouettes
    ctx.save();
    _drawSweepingPalm(ctx, cx - 20, cy + ch * 0.45, 280, Math.PI * 0.15, 0.4, 'rgba(255,94,58,0.55)', 'rgba(46,17,57,0.85)', 'rgba(255,230,0,0.4)');
    _drawSweepingPalm(ctx, cx + cw + 20, cy + ch * 0.58, 280, -Math.PI * 0.85, 0.4, 'rgba(255,46,99,0.55)', 'rgba(46,17,57,0.85)', 'rgba(255,230,0,0.4)');
    
    // Radiant sun rays across background
    ctx.strokeStyle = 'rgba(255,110,61,0.14)';
    ctx.lineWidth = 3.5;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(W / 2, cy + 300);
      ctx.lineTo(W / 2 + Math.cos(a) * 850, cy + 300 + Math.sin(a) * 850);
      ctx.stroke();
    }
    ctx.restore();

  } else if (theme === 'CYBER') {
    // Cyber matrix HUD grid and circuit bus traces
    ctx.save();
    ctx.strokeStyle = 'rgba(0,229,255,0.18)';
    ctx.lineWidth = 1.5;
    // Diagonal tech grid lines
    for (let x = cx - 200; x <= cx + cw + 200; x += 55) {
      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.lineTo(x + ch * 0.35, cy + ch);
      ctx.stroke();
    }
    // Circuit traces flanking sides
    _drawCircuitTraces(ctx, cx + 45, cy + ch * 0.35, 190, '#00E5FF', '#FF2E88');
    _drawCircuitTraces(ctx, cx + cw - 45, cy + ch * 0.55, -190, '#00E5FF', '#FF2E88');
    ctx.restore();

  } else if (theme === 'OBSIDIAN') {
    // Obsidian gold art-deco geometric lines and diamond stars
    ctx.save();
    ctx.strokeStyle = 'rgba(255,215,0,0.22)';
    ctx.lineWidth = 2.5;
    // Diamond chevron lattice
    for (let dy = cy + 220; dy <= cy + ch - 220; dy += 120) {
      ctx.beginPath();
      ctx.moveTo(cx + 25, dy);
      ctx.lineTo(cx + 95, dy + 60);
      ctx.lineTo(cx + 25, dy + 120);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + cw - 25, dy);
      ctx.lineTo(cx + cw - 95, dy + 60);
      ctx.lineTo(cx + cw - 25, dy + 120);
      ctx.stroke();
    }
    // Gold diamond star sparkles
    [
      [cx + 80, cy + ch * 0.40],
      [cx + cw - 80, cy + ch * 0.46],
      [cx + 70, cy + ch * 0.65],
      [cx + cw - 70, cy + ch * 0.62],
    ].forEach(([sx, sy]) => {
      ctx.fillStyle = '#FFE066';
      _circle(ctx, sx, sy, 3.5, true);
      ctx.strokeStyle = 'rgba(255,215,0,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - 14, sy); ctx.lineTo(sx + 14, sy);
      ctx.moveTo(sx, sy - 14); ctx.lineTo(sx, sy + 14);
      ctx.stroke();
    });
    ctx.restore();

  } else if (theme === 'HOLOGRAPHIC') {
    // Holographic iridescent diagonal light rays and prism starbursts
    ctx.save();
    const holoGrad = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
    holoGrad.addColorStop(0, 'rgba(0,255,255,0.10)');
    holoGrad.addColorStop(0.33, 'rgba(255,0,255,0.10)');
    holoGrad.addColorStop(0.66, 'rgba(255,255,0,0.10)');
    holoGrad.addColorStop(1, 'rgba(0,255,255,0.10)');
    ctx.fillStyle = holoGrad;
    ctx.fillRect(cx, cy, cw, ch);

    // Prismatic 8-point stars
    [
      [cx + 85, cy + ch * 0.44],
      [cx + cw - 85, cy + ch * 0.40],
      [cx + 75, cy + ch * 0.66],
      [cx + cw - 75, cy + ch * 0.64],
    ].forEach(([sx, sy]) => {
      ctx.strokeStyle = 'rgba(0,255,255,0.75)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx - 18, sy); ctx.lineTo(sx + 18, sy);
      ctx.moveTo(sx, sy - 18); ctx.lineTo(sx, sy + 18);
      ctx.moveTo(sx - 11, sy - 11); ctx.lineTo(sx + 11, sy + 11);
      ctx.moveTo(sx - 11, sy + 11); ctx.lineTo(sx + 11, sy - 11);
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      _circle(ctx, sx, sy, 3.5, true);
    });
    ctx.restore();

  } else if (theme === 'MINIMAL') {
    // Minimal Swiss botanical line engraving & precision coordinates
    ctx.save();
    ctx.strokeStyle = 'rgba(74,52,24,0.22)';
    ctx.lineWidth = 1.5;
    // Architectural coordinate lines
    ctx.beginPath();
    ctx.moveTo(cx + 45, cy + 180); ctx.lineTo(cx + 45, cy + ch - 180);
    ctx.moveTo(cx + cw - 45, cy + 180); ctx.lineTo(cx + cw - 45, cy + ch - 180);
    ctx.stroke();
    // Fine-line botanical fronds in margins
    _drawSweepingPalm(ctx, cx - 10, cy + ch * 0.48, 240, Math.PI * 0.12, 0.35, 'rgba(74,52,24,0.25)', 'rgba(74,52,24,0.35)', 'rgba(74,52,24,0.18)');
    _drawSweepingPalm(ctx, cx + cw + 10, cy + ch * 0.52, 240, -Math.PI * 0.88, 0.35, 'rgba(74,52,24,0.25)', 'rgba(74,52,24,0.35)', 'rgba(74,52,24,0.18)');
    ctx.restore();
  }

  ctx.restore();
}

/** Sweeping curved palm frond with individual leaflets and highlight. */
function _drawSweepingPalm(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  length: number,
  angle: number,
  curvature: number,
  leafCol: string,
  stemCol: string,
  highlightCol: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const endX = length;
  const endY = length * curvature;

  // Main curved rachis
  ctx.strokeStyle = stemCol;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.5, endY * 0.25, endX, endY);
  ctx.stroke();

  // Pinnae leaflets
  const count = 18;
  for (let i = 2; i <= count; i++) {
    const t = i / count;
    const px = endX * t;
    const py = endY * t * t;
    const len = (1 - t * 0.35) * 65;

    // Upward leaflet
    ctx.strokeStyle = leafCol;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px - 10, py - len * 0.6, px - 18, py - len);
    ctx.stroke();

    // Downward leaflet
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + 10, py - len * 0.5, px + 20, py - len * 0.85);
    ctx.stroke();

    // Leaflet gold highlight on alternate leaves
    if (i % 2 === 0) {
      ctx.strokeStyle = highlightCol;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - 14, py - len * 0.8);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/** Cyber circuit traces flanking card sides. */
function _drawCircuitTraces(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  dir: number,
  color1: string,
  color2: string
) {
  ctx.save();
  ctx.strokeStyle = color1;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = color1;
  ctx.shadowBlur = 8;

  // Trace 1
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dir * 0.4, y);
  ctx.lineTo(x + dir * 0.6, y + 40);
  ctx.lineTo(x + dir, y + 40);
  ctx.stroke();
  ctx.fillStyle = color2;
  _circle(ctx, x + dir, y + 40, 4.5, true);

  // Trace 2
  ctx.beginPath();
  ctx.moveTo(x, y + 50);
  ctx.lineTo(x + dir * 0.3, y + 50);
  ctx.lineTo(x + dir * 0.5, y + 80);
  ctx.lineTo(x + dir * 0.8, y + 80);
  ctx.stroke();
  ctx.fillStyle = color1;
  _circle(ctx, x + dir * 0.8, y + 80, 4, true);

  ctx.restore();
}

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

/** Ambient backdrop behind the card. Four styles: NIGHT (default), SUNSET, FOREST, CYBER. */
function _drawBg(ctx: CanvasRenderingContext2D, w: number, h: number, bg: string = 'NIGHT') {
  // ── SUNSET ────────────────────────────────────────────────────────────────
  if (bg === 'SUNSET') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2A0E33');
    g.addColorStop(0.4, '#8E1E4E');
    g.addColorStop(0.7, '#FF5E3A');
    g.addColorStop(1, '#FF9E54');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Glowing sun disc
    const SX = w * 0.32, SY = h * 0.38, SR = Math.min(w, h) * 0.09;
    const sun = ctx.createRadialGradient(SX, SY, 0, SX, SY, SR * 2.4);
    sun.addColorStop(0, 'rgba(255,235,140,0.95)');
    sun.addColorStop(0.4, 'rgba(255,180,90,0.7)');
    sun.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.fillStyle = sun;
    _circle(ctx, SX, SY, SR * 2.4, true);

    // Distant birds
    ctx.strokeStyle = 'rgba(45,10,30,0.55)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const bx = w * (0.5 + _j(i, 3) * 0.4);
      const by = h * (0.1 + _j(i, 9) * 0.12);
      ctx.beginPath();
      ctx.arc(bx, by, 4.5, Math.PI, 0);
      ctx.arc(bx + 8, by - 2.5, 4.5, Math.PI, 0);
      ctx.stroke();
    }
    return;
  }

  // ── FOREST ────────────────────────────────────────────────────────────────
  if (bg === 'FOREST') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#02130A');
    g.addColorStop(0.55, '#06341C');
    g.addColorStop(1, '#0B6B3A');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Jungle silhouettes rising from the base
    ctx.fillStyle = 'rgba(1,12,6,0.6)';
    for (let i = 0; i < 9; i++) {
      const tx = w * _j(i, 5) - w * 0.05;
      const tw = w * (0.12 + _j(i, 11) * 0.08);
      const th = h * (0.15 + _j(i, 17) * 0.12);
      ctx.beginPath();
      ctx.moveTo(tx, h);
      ctx.lineTo(tx + tw / 2, h - th);
      ctx.lineTo(tx + tw, h);
      ctx.closePath();
      ctx.fill();
    }

    // Fireflies
    for (let i = 0; i < 24; i++) {
      const fx = w * _j(i, 23);
      const fy = h * (0.25 + _j(i, 29) * 0.6);
      ctx.fillStyle = `rgba(255,230,0,${(0.15 + _j(i, 31) * 0.4).toFixed(2)})`;
      _circle(ctx, fx, fy, 0.8 + _j(i, 37) * 1.4, true);
    }
    return;
  }

  // ── CYBER ─────────────────────────────────────────────────────────────────
  if (bg === 'CYBER') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#04050D');
    g.addColorStop(0.6, '#080F22');
    g.addColorStop(1, '#120A24');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Neon grid
    ctx.strokeStyle = 'rgba(0,229,255,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 42) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += 42) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Glowing horizon line
    ctx.strokeStyle = 'rgba(0,229,255,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.82);
    ctx.lineTo(w, h * 0.82);
    ctx.stroke();

    // Neon data dots
    for (let i = 0; i < 14; i++) {
      const dx = w * _j(i, 41);
      const dy = h * (0.2 + _j(i, 43) * 0.6);
      ctx.fillStyle = `rgba(255,46,136,${(0.2 + _j(i, 47) * 0.5).toFixed(2)})`;
      _circle(ctx, dx, dy, 1.2 + _j(i, 53) * 1.8, true);
    }
    return;
  }

  // ── NIGHT (default) ───────────────────────────────────────────────────────
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



