import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { getBuilderById, getBuilderByCode } from '@/lib/registry';
import { PublicBuilder } from '@/types/builder';
import { formatClaimCode, resolveClaimCode } from '@/lib/builder-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const COLOR_BG = '#0B6B3A';
const COLOR_CREAM = '#FBF6E9';
const COLOR_INK = '#1A2E22';
const COLOR_PINK = '#FF007A';
const COLOR_YELLOW = '#FFE600';
const COLOR_WHITE = '#FFFFFF';
const COLOR_DARK_GREEN = '#064E29';

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

async function toDataUrl(url: string): Promise<string | null> {
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const type = res.headers.get('content-type') || 'image/jpeg';
    return `data:${type};base64,${Buffer.from(buf).toString('base64')}`;
  } catch (err) {
    console.error('Failed to fetch photo for OG image', err);
    return null;
  }
}

async function resolveBuilder(request: NextRequest): Promise<PublicBuilder | null> {
  const id = request.nextUrl.searchParams.get('id');
  const code = request.nextUrl.searchParams.get('code');
  if (id) return getBuilderById(id);
  if (code) return getBuilderByCode(code);
  return null;
}

export async function GET(request: NextRequest) {
  const builder = await resolveBuilder(request);

  if (!builder) {
    // Generic branded fallback so shared links never show a blank thumbnail.
    return new ImageResponse(
      (
        <div style={{ width: 1200, height: 630, background: COLOR_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: -140, left: -140, width: 420, height: 420, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', top: 40, right: 60, width: 120, height: 120, borderRadius: 999, background: COLOR_YELLOW }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ color: COLOR_YELLOW, fontSize: 64, fontWeight: 900, letterSpacing: -1 }}>HACKER HOUSE</span>
            <span style={{ background: COLOR_PINK, color: COLOR_WHITE, fontSize: 34, fontWeight: 800, padding: '10px 24px', borderRadius: 999 }}>गोवा</span>
          </div>
          <div style={{ color: COLOR_WHITE, fontSize: 40, fontWeight: 900, marginTop: 24 }}>BUILD YOUR HH GOA 2026 BUILDER ID</div>
          <div style={{ color: '#FBF6E9', fontSize: 24, marginTop: 12 }}>GOA, INDIA · 28—31 OCT 2026</div>
          <div style={{ color: COLOR_PINK, fontSize: 32, fontWeight: 900, marginTop: 24 }}>#FrameInGoa</div>
        </div>
      ),
      size
    );
  }

  const photo = await toDataUrl(builder.photoUrl);
  const code = formatClaimCode(resolveClaimCode(builder.claimCode, builder.builderNumber));

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: COLOR_BG, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Decorative brand motifs */}
        <div style={{ position: 'absolute', top: -160, left: -160, width: 460, height: 460, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -180, right: -180, width: 480, height: 480, borderRadius: 999, background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', top: 36, right: 64, width: 110, height: 110, borderRadius: 999, background: COLOR_YELLOW }} />
        <div style={{ position: 'absolute', top: 56, right: 84, width: 110, height: 110, borderRadius: 999, background: COLOR_BG }} />

        {/* Card */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: COLOR_PINK, padding: 8, borderRadius: 44, display: 'flex' }}>
            <div style={{ width: 1080, height: 490, background: COLOR_CREAM, borderRadius: 36, padding: '36px 44px', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <span style={{ color: COLOR_INK, fontSize: 42, fontWeight: 900, letterSpacing: -0.5 }}>HACKER HOUSE</span>
                  <span style={{ background: COLOR_PINK, color: COLOR_WHITE, fontSize: 26, fontWeight: 800, padding: '8px 20px', borderRadius: 999 }}>गोवा</span>
                </div>
                <span style={{ color: COLOR_PINK, fontSize: 22, fontWeight: 800 }}>HH GOA 2026</span>
              </div>

              {/* Main row */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 34 }}>
                {photo ? (
                  <div style={{ width: 196, height: 196, borderRadius: 999, border: '9px solid ' + COLOR_PINK, backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                ) : (
                  <div style={{ width: 196, height: 196, borderRadius: 999, background: COLOR_BG, color: COLOR_YELLOW, fontSize: 72, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {initialsOf(builder.name)}
                  </div>
                )}

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <span style={{ color: COLOR_INK, fontSize: 46, fontWeight: 900, letterSpacing: -0.5, textTransform: 'uppercase', lineHeight: 1.1 }}>
                    {builder.name}
                  </span>
                  <div style={{ background: COLOR_PINK, color: COLOR_WHITE, fontSize: 24, fontWeight: 800, padding: '10px 22px', borderRadius: 999, alignSelf: 'flex-start' }}>
                    {builder.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {builder.stack.map((s) => (
                      <span key={s} style={{ background: 'rgba(11,107,58,0.12)', color: COLOR_DARK_GREEN, fontSize: 20, fontWeight: 700, padding: '6px 14px', borderRadius: 999 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <span style={{ color: 'rgba(26,46,34,0.65)', fontSize: 20, fontWeight: 700 }}>
                    BUILDER {builder.builderNumber} · {builder.xUsername ? `@${builder.xUsername}` : 'HH GOA BUILDER'}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTop: '3px solid rgba(26,46,34,0.12)', paddingTop: 16 }}>
                <span style={{ color: COLOR_INK, fontSize: 28, fontWeight: 900 }}>#{'FrameInGoa'}</span>
                <span style={{ color: COLOR_DARK_GREEN, fontSize: 22, fontWeight: 900, letterSpacing: 2 }}>{code}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave band */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 46, background: COLOR_DARK_GREEN }} />
        <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, height: 40, background: COLOR_BG, borderTopLeftRadius: 999, borderTopRightRadius: 999 }} />
      </div>
    ),
    {
      ...size,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
}
