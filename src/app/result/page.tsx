'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Download, Share2, RefreshCw, Radio, ShieldCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BuilderIdentity } from '@/types/dna';
import { DNAIdentityCanvas } from '@/components/canvas/DNAIdentityCanvas';
import { SAMPLE_BUILDERS } from '@/lib/demo-builders';

function ResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [builder, setBuilder] = useState<BuilderIdentity | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem(`builder_${id}`);
      if (stored) {
        try {
          setBuilder(JSON.parse(stored));
          return;
        } catch (e) {
          console.warn('Failed to parse builder from localStorage', e);
        }
      }
    }

    const latest = localStorage.getItem('latest_builder');
    if (latest) {
      try {
        setBuilder(JSON.parse(latest));
        return;
      } catch (e) {
        console.warn('Failed to parse latest builder', e);
      }
    }

    setBuilder(SAMPLE_BUILDERS[0]);
  }, [id]);

  if (!builder) {
    return (
      <div className="min-h-screen bg-[#050506] text-white flex items-center justify-center p-4 font-mono">
        <div className="text-center space-y-4">
          <div className="animate-pulse text-[#00FF66]">DECODING BUILDER IDENTITY...</div>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    if (!canvasElementRef.current) {
      alert('Graphic rendering in progress, please wait a moment...');
      return;
    }

    setDownloading(true);

    canvasElementRef.current.toBlob((blob) => {
      if (!blob) {
        alert('Failed to generate image file.');
        setDownloading(false);
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `builder-dna-${builder.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, 'image/png');
  };

  const handleShareToX = () => {
    const stackStr = builder.stack.join(' × ');
    const text = `Just decoded my Builder DNA.

${builder.title}
${stackStr}

${builder.dnaHash}

Less noise. More signal.

#FrameInGoa @HackerHouseGoa`;

    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyCaption = () => {
    const text = `Just decoded my Builder DNA for Hacker House Goa 2026!
Title: ${builder.title}
DNA: ${builder.dnaHash}
#FrameInGoa`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative min-h-screen bg-[#050506] text-white flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <main className="max-w-4xl mx-auto w-full space-y-8">
        {/* Signal Lock Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#00FF66]/10 border border-[#00FF66] px-4 py-1.5 font-mono text-xs text-[#00FF66] font-extrabold uppercase tracking-widest shadow-[4px_4px_0px_0px_#00FF66]">
            <ShieldCheck className="w-4 h-4" />
            SIGNAL LOCKED // BUILDER IDENTITY VERIFIED
          </div>

          <h1 className="font-mono text-3xl sm:text-5xl font-extrabold uppercase text-white tracking-tight">
            {builder.name}
          </h1>

          <p className="font-mono text-xs sm:text-sm text-zinc-400">
            {builder.title} · {builder.dnaHash} · GOA, INDIA · 28—31 OCT 2026
          </p>
        </div>

        {/* Poster Canvas Preview Container */}
        <div className="max-w-xl mx-auto shadow-[0_0_50px_rgba(0,255,102,0.15)] border-2 border-zinc-800 bg-black">
          <DNAIdentityCanvas
            builder={builder}
            onCanvasReady={(cv) => {
              canvasElementRef.current = cv;
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="max-w-xl mx-auto space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              size="lg"
              variant="primary"
              onClick={handleDownload}
              disabled={downloading}
              className="w-full"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'GENERATING PNG...' : 'DOWNLOAD IMAGE'}
            </Button>

            <Button
              size="lg"
              variant="accent"
              onClick={handleShareToX}
              className="w-full"
            >
              <Share2 className="w-4 h-4" />
              SHARE TO X (#FrameInGoa)
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link href="/create" className="w-full">
              <Button size="md" variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4" />
                CREATE ANOTHER
              </Button>
            </Link>

            <Link href="/radar" className="w-full">
              <Button size="md" variant="outline" className="w-full">
                <Radio className="w-4 h-4 text-[#00FF66]" />
                VIEW ON RADAR
              </Button>
            </Link>
          </div>

          {/* Copy Caption Bar */}
          <div className="bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs flex items-center justify-between">
            <div className="text-zinc-400">
              <span className="text-[#00FF66] font-bold">#FrameInGoa</span> MANDATORY HASHTAG
            </div>
            <button
              onClick={handleCopyCaption}
              className="text-xs font-bold text-white hover:text-[#00FF66] flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-[#00FF66]" /> : null}
              {copied ? 'COPIED TO CLIPBOARD' : 'COPY CAPTION'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050506] text-white flex items-center justify-center font-mono">
          <div className="text-[#00FF66] font-bold animate-pulse">LOADING SIGNAL...</div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
