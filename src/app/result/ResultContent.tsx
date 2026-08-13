'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Download, Share2, RefreshCw, Radio, ShieldCheck, Check, Sparkles, Layers, Image as ImageIcon, AtSign, Camera, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BuilderIdentity, PublicBuilder } from '@/types/builder';
import { BuilderCardCanvas } from '@/components/canvas/BuilderCardCanvas';
import { ProfileFrameCanvas } from '@/components/canvas/ProfileFrameCanvas';
import { SAMPLE_BUILDERS } from '@/lib/demo-builders';

const SHARE_LINK = 'https://hhgoa.com/result';

export default function ResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const code = searchParams.get('code');

  const [activeTab, setActiveTab] = useState<'card' | 'frame'>('card');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [builder, setBuilder] = useState<BuilderIdentity | null>(null);

  const passCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Resolve from the public registry first (by uid or unique code), then the
  // local cache, then demo data.
  useEffect(() => {
    let cancelled = false;

    const readLocal = (): BuilderIdentity | null => {
      if (typeof window === 'undefined') return null;

      if (id) {
        const stored = localStorage.getItem(`builder_${id}`);
        if (stored) {
          try {
            return JSON.parse(stored) as BuilderIdentity;
          } catch (e) {
            console.warn('Failed to parse builder from localStorage', e);
          }
        }
      }

      const latest = localStorage.getItem('latest_builder');
      if (latest) {
        try {
          return JSON.parse(latest) as BuilderIdentity;
        } catch (e) {
          console.warn('Failed to parse latest builder', e);
        }
      }

      return null;
    };

    const load = async () => {
      const endpoint = id
        ? `/api/builders/${encodeURIComponent(id)}`
        : code
        ? `/api/builders/code/${encodeURIComponent(code)}`
        : null;

      if (endpoint) {
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            const data = (await res.json()) as { builder?: PublicBuilder };
            if (!cancelled && data.builder) {
              setBuilder(data.builder as BuilderIdentity);
              return;
            }
          }
        } catch (e) {
          console.warn('Failed to fetch builder from registry', e);
        }
      }

      if (!cancelled) {
        setBuilder(readLocal() ?? SAMPLE_BUILDERS[0]);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id, code]);

  if (!builder) {
    return (
      <div className="min-h-screen bg-[#0B6B3A] text-[#FBF6E9] flex items-center justify-center p-4 font-mono">
        <div className="text-center space-y-4">
          <div className="text-[#FF007A] font-extrabold text-xl animate-pulse pinned-card pin-top-pink p-6 text-[#1A2E22]">
            STAMPING BUILDER IDENTITY...
          </div>
        </div>
      </div>
    );
  }

  const builderLink = `${SHARE_LINK}?id=${builder.id}`;

  const downloadCanvas = (canvas: HTMLCanvasElement | null): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!canvas) {
        resolve(null);
        return;
      }
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  const triggerBlobDownload = (blob: Blob, suffix: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const cleanName = builder.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.href = url;
    link.download = `hhgoa2026-${cleanName}-${suffix}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCard = async () => {
    setDownloading(true);
    const blob = await downloadCanvas(passCanvasRef.current);
    if (blob) triggerBlobDownload(blob, 'builder-pass');
    setDownloading(false);
  };

  const handleDownloadFrame = async () => {
    setDownloading(true);
    const blob = await downloadCanvas(frameCanvasRef.current);
    if (blob) triggerBlobDownload(blob, 'profile-frame');
    setDownloading(false);
  };

  const handleDownloadBoth = async () => {
    setDownloading(true);
    const [passBlob, frameBlob] = await Promise.all([
      downloadCanvas(passCanvasRef.current),
      downloadCanvas(frameCanvasRef.current),
    ]);
    if (passBlob) triggerBlobDownload(passBlob, 'builder-pass');
    await new Promise((r) => setTimeout(r, 500));
    if (frameBlob) triggerBlobDownload(frameBlob, 'profile-frame');
    setDownloading(false);
  };

  const captionFor = () => {
    const stackStr = builder.stack.join(' x ');
    return `Just claimed my official HH Goa 2026 Builder ID & Profile Frame! 🌴☀️

${builder.title} · ${builder.builderNumber}
Stack: ${stackStr}
Unique code: ${builder.claimCode}

See you in Goa — 28-31 Oct 2026.

#FrameInGoa #HHGoa2026 @HackerHouseGoa`;
  };

  // Native share on mobile — attaches the PNG directly to X, WhatsApp, iMessage, etc.
  const handleShareImage = async () => {
    const canvas = activeTab === 'card' ? passCanvasRef.current : frameCanvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    const blob = await downloadCanvas(canvas);
    setDownloading(false);
    if (!blob) return;

    const suffix = activeTab === 'card' ? 'builder-pass' : 'profile-frame';
    const cleanName = builder.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const file = new File([blob], `hhgoa2026-${cleanName}-${suffix}.png`, { type: 'image/png' });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'HH GOA 2026 Builder ID', text: captionFor() });
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }
    triggerBlobDownload(blob, suffix);
  };

  const handleShareToX = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(captionFor())}&url=${encodeURIComponent(builderLink)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareToLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(builderLink)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyCaption = () => {
    const text = `${captionFor()}\n\nLink: ${builderLink}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative min-h-screen bg-[#0B6B3A] text-[#FBF6E9] py-10 px-4 sm:px-6 lg:px-8 font-mono">
      <main className="max-w-4xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#FFE600] text-[#1A2E22] px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
            <ShieldCheck className="w-4 h-4 text-[#FF007A]" />
            BUILDER IDENTITY VERIFIED
          </div>

          <h1 className="font-display font-black text-4xl sm:text-7xl uppercase text-white tracking-tight break-words">
            {builder.name}
          </h1>

          <div className="inline-block bg-[#FF007A] text-white text-xs sm:text-sm font-bold px-5 py-2 rounded-full shadow-md">
            {builder.title} · GOA, INDIA · 28—31 OCT 2026
          </div>

          <div className="font-mono text-xs font-bold text-[#FFE600] pt-1">
            BUILDER #{builder.builderNumber} · CODE {builder.claimCode || '—'} · HACK MODE: {builder.stats.hackMode}
          </div>
        </div>

        {/* Tab Toggle: Builder Pass vs Profile Frame */}
        <div className="flex justify-center">
          <div className="inline-flex bg-[#FBF6E9]/10 p-1.5 rounded-full border border-white/20 shadow-md gap-1">
            <button
              onClick={() => setActiveTab('card')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-mono text-xs font-bold transition-all ${
                activeTab === 'card'
                  ? 'bg-[#FF007A] text-white shadow-md'
                  : 'text-[#FBF6E9] hover:bg-white/10'
              }`}
            >
              <Layers className="w-4 h-4" /> BUILDER PASS (1920x2560)
            </button>
            <button
              onClick={() => setActiveTab('frame')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-mono text-xs font-bold transition-all ${
                activeTab === 'frame'
                  ? 'bg-[#FFE600] text-[#1A2E22] shadow-md'
                  : 'text-[#FBF6E9] hover:bg-white/10'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> PROFILE FRAME (2048x2048)
            </button>
          </div>
        </div>

        {/* Canvas Previews Container */}
        <div className="max-w-lg mx-auto pinned-card pin-top-yellow p-4 shadow-2xl transition-all">
          {/* Builder Pass Canvas */}
          <div className={activeTab === 'card' ? 'block' : 'hidden'}>
            <BuilderCardCanvas
              builder={builder}
              onCanvasReady={(cv) => {
                passCanvasRef.current = cv;
              }}
            />
          </div>

          {/* Profile Frame Canvas */}
          <div className={activeTab === 'frame' ? 'block' : 'hidden'}>
            <ProfileFrameCanvas
              builder={builder}
              onCanvasReady={(cv) => {
                frameCanvasRef.current = cv;
              }}
            />
          </div>
        </div>

        {/* Download + Share Buttons Section */}
        <div className="max-w-xl mx-auto space-y-4 pt-2 font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              size="md"
              variant="primary"
              onClick={handleDownloadCard}
              disabled={downloading}
              className="w-full pink-pill-btn"
            >
              <Download className="w-4 h-4" /> PASS PNG
            </Button>

            <Button
              size="md"
              variant="secondary"
              onClick={handleDownloadFrame}
              disabled={downloading}
              className="w-full yellow-pill-btn"
            >
              <Download className="w-4 h-4" /> FRAME PNG
            </Button>

            <Button
              size="md"
              variant="primary"
              onClick={handleDownloadBoth}
              disabled={downloading}
              className="w-full pink-pill-btn"
            >
              <Sparkles className="w-4 h-4" /> DOWNLOAD BOTH
            </Button>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <Button size="md" variant="ink" onClick={handleShareImage} className="w-full" disabled={downloading}>
              <Send className="w-4 h-4" /> SHARE PNG
            </Button>

            <Button size="md" variant="outline" onClick={handleShareToX} className="w-full border-2 border-white text-white">
              <Share2 className="w-4 h-4" /> SHARE TO X
            </Button>

            <Button size="md" variant="outline" onClick={handleShareToLinkedIn} className="w-full border-2 border-white text-white">
              <AtSign className="w-4 h-4" /> LINKEDIN
            </Button>

            <Button size="md" variant="outline" onClick={handleCopyCaption} className="w-full border-2 border-white text-white">
              <Camera className="w-4 h-4 text-[#FF007A]" />
              {copied ? 'COPIED!' : 'COPY CAPTION'}
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link href="/create" className="w-full">
              <Button size="md" variant="outline" className="w-full border-2 border-white text-white">
                <RefreshCw className="w-4 h-4" /> CREATE ANOTHER
              </Button>
            </Link>

            <Link href="/gallery" className="w-full">
              <Button size="md" variant="outline" className="w-full border-2 border-white text-white">
                <Radio className="w-4 h-4 text-[#FFE600]" /> VIEW IN GALLERY
              </Button>
            </Link>
          </div>

          {/* Hashtag Bar */}
          <div className="pinned-card p-4 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="text-[#1A2E22] font-bold">
              <span className="text-[#FF007A] font-extrabold">#FrameInGoa</span> MANDATORY HASHTAG
            </div>
            <button
              onClick={handleCopyCaption}
              className="text-xs font-bold text-white bg-[#FF007A] hover:bg-[#E0006C] px-5 py-2 rounded-full transition-all shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 inline stroke-[3]" /> : null}
              {copied ? ' COPIED' : 'COPY CAPTION & HASHTAGS'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
