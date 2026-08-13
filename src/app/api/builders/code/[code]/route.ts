import { NextRequest, NextResponse } from 'next/server';
import { getBuilderByCode } from '@/lib/registry';
import { isAdminConfigured } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Builder registry unavailable' }, { status: 503 });
  }

  const builder = await getBuilderByCode(code);
  if (!builder) {
    return NextResponse.json({ error: 'Builder not found for this code' }, { status: 404 });
  }

  return NextResponse.json({ builder });
}
