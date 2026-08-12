'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Radio, Users, Cpu, Terminal, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GenerativeBackground } from '@/components/canvas/GenerativeBackground';
import { SAMPLE_BUILDERS } from '@/lib/demo-builders';
import { DNAIdentityCanvas } from '@/components/canvas/DNAIdentityCanvas';

export default function Home() {
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const sample = SAMPLE_BUILDERS[activeSampleIndex];

  return (
    <div className="relative min-h-screen bg-[#050506] text-white flex flex-col justify-between overflow-x-hidden selection:bg-[#00FF66] selection:text-black">
      {/* Generative Interactive Canvas Background */}
      <GenerativeBackground density={50} />

      {/* Main Hero Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 flex-1 flex flex-col justify-center">
        {/* Top Announcement Bar */}
        <div className="inline-flex items-center gap-3 bg-zinc-950/90 border border-zinc-800 px-4 py-2 self-start mb-8 font-mono text-xs shadow-[4px_4px_0px_0px_#00FF66]">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
          <span className="text-zinc-400 font-bold">HH GOA 2026 OFFICIAL BUILDER ID ENGINE</span>
          <span className="text-zinc-600">|</span>
          <span className="text-[#00FF66] font-bold">#FrameInGoa</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Bold Editorial Typography */}
          <div className="lg:col-span-7 space-y-8">
            <div className="font-mono text-xs font-bold text-[#00FF66] tracking-widest uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              LESS NOISE. MORE SIGNAL.
            </div>

            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-extrabold font-mono tracking-tighter leading-[0.88] uppercase text-white">
              BUILD <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF66] via-white to-[#00E5FF]">
                YOUR
              </span> <br />
              DNA<span className="text-[#00FF66]">.</span>
            </h1>

            <p className="font-mono text-lg sm:text-xl text-zinc-300 max-w-xl leading-relaxed border-l-2 border-[#00FF66] pl-4">
              Your stack. <br />
              Your instincts. <br />
              Your signal. <br />
              <span className="text-zinc-400 text-base">
                Turn yourself into a Hacker House Goa 2026 builder identity.
              </span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link href="/create">
                <Button size="xl" variant="primary" className="w-full sm:w-auto">
                  START BUILDING →
                </Button>
              </Link>

              <Link href="/radar">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  <Radio className="w-5 h-5 text-[#00FF66]" />
                  EXPLORE RADAR
                </Button>
              </Link>
            </div>

            {/* Sub-text event tag */}
            <div className="pt-6 font-mono text-xs text-zinc-500 flex items-center gap-6">
              <div>
                <span className="text-zinc-400 font-bold block">HH GOA 2026</span>
                <span>GOA, INDIA · 28—31 OCT</span>
              </div>
              <div className="h-6 w-[1px] bg-zinc-800" />
              <div>
                <span className="text-[#00FF66] font-bold block">NO LOGIN REQUIRED</span>
                <span>Instant 100% Client-Side Generation</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Generative Identity Poster Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs text-zinc-400 border-b border-zinc-800 pb-2">
              <span className="flex items-center gap-2 text-[#00FF66] font-bold">
                <Zap className="w-4 h-4" /> LIVE DEMO BUILDER SPOTLIGHT
              </span>
              <span className="text-zinc-500">SAMPLE 0{activeSampleIndex + 1} / 04</span>
            </div>

            <div className="transform hover:scale-[1.01] transition-transform duration-300">
              <DNAIdentityCanvas builder={sample} />
            </div>

            {/* Switch sample builder buttons */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {SAMPLE_BUILDERS.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => setActiveSampleIndex(idx)}
                  className={`py-2 px-1 font-mono text-[11px] font-bold border transition-all text-center ${
                    activeSampleIndex === idx
                      ? 'bg-[#00FF66] text-black border-[#00FF66]'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {b.name.split(' ')[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section className="mt-28 pt-16 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-950 border border-zinc-800 p-8 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,255,102,0.15)] group hover:border-[#00FF66] transition-colors">
            <div className="w-12 h-12 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/40 flex items-center justify-center font-mono font-bold text-xl">
              01
            </div>
            <h3 className="font-mono text-xl font-extrabold text-white tracking-wide">
              DETERMINISTIC GENERATIVE ENGINE
            </h3>
            <p className="font-mono text-xs text-zinc-400 leading-relaxed">
              Your photo, stack, build mode, and energy hash into a unique DNA seed (`DNA // 7F-29-A1-C4`) driving particle density, geometry, and visual reticles.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-8 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,229,255,0.15)] group hover:border-[#00E5FF] transition-colors">
            <div className="w-12 h-12 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/40 flex items-center justify-center font-mono font-bold text-xl">
              02
            </div>
            <h3 className="font-mono text-xl font-extrabold text-white tracking-wide">
              BUILDER CONSTELLATION RADAR
            </h3>
            <p className="font-mono text-xs text-zinc-400 leading-relaxed">
              Discover 247+ builders clustered by tech stack similarity in an interactive 2D constellation map. Click any node to inspect their DNA profile.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-8 space-y-4 shadow-[4px_4px_0px_0px_rgba(255,214,0,0.15)] group hover:border-[#FFD600] transition-colors">
            <div className="w-12 h-12 bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/40 flex items-center justify-center font-mono font-bold text-xl">
              03
            </div>
            <h3 className="font-mono text-xl font-extrabold text-white tracking-wide">
              TEAM DNA COMBINER & SHARE
            </h3>
            <p className="font-mono text-xs text-zinc-400 leading-relaxed">
              Combine 2–3 team members into a unified Team DNA poster. Download 1200x1600 PNGs and share directly to X with mandatory `#FrameInGoa` hashtag.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
