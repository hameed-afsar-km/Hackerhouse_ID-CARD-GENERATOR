import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getBuilderById, getBuilderByCode } from '@/lib/registry';
import ResultContent from './ResultContent';

export const dynamic = 'force-dynamic';

interface ResultPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const SITE_URL = 'https://hhgoa.com';

export async function generateMetadata({ searchParams }: ResultPageProps): Promise<Metadata> {
  const params = await searchParams;
  const id = typeof params.id === 'string' ? params.id : undefined;
  const code = typeof params.code === 'string' ? params.code : undefined;

  const builder = id ? await getBuilderById(id) : code ? await getBuilderByCode(code) : null;
  const query = id ? `id=${encodeURIComponent(id)}` : code ? `code=${encodeURIComponent(code)}` : '';
  const ogImage = query ? `/api/og?${query}` : '/api/og';
  const ogUrl = query ? `${SITE_URL}/result?${query}` : `${SITE_URL}/result`;

  const title = builder ? `${builder.name} — HH GOA 2026 BUILDER` : 'HH GOA 2026 — Builder ID & Profile Frame';
  const description = builder
    ? `${builder.title} · BUILDER ${builder.builderNumber} · Goa, India 28—31 Oct 2026 · #FrameInGoa`
    : 'Claim your official Hacker House Goa 2026 Builder ID & Profile Frame. #FrameInGoa';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: ogUrl,
      siteName: 'HH GOA 2026',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `HH GOA 2026 Builder — ${builder?.name ?? 'HH GOA'}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B6B3A] text-[#FBF6E9] flex items-center justify-center font-mono">
          <div className="text-[#FF007A] font-extrabold text-xl animate-pulse pinned-card pin-top-pink p-6 text-[#1A2E22]">
            LOADING BUILDER SIGNAL...
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
