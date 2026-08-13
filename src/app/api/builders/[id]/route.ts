import { NextRequest, NextResponse } from 'next/server';
import { getBuilderById } from '@/lib/registry';
import { isAdminConfigured } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, ctx: RouteContext<'/api/builders/[id]'>) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing builder id' }, { status: 400 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Builder registry unavailable' }, { status: 503 });
  }

  const builder = await getBuilderById(id);
  if (!builder) {
    return NextResponse.json({ error: 'Builder not found' }, { status: 404 });
  }

  return NextResponse.json({ builder });
}
