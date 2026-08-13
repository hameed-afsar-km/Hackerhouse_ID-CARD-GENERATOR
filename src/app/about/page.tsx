import React from 'react';
import Link from 'next/link';
import { MapPin, Users, Palette, Download, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#0B6B3A] text-[#FBF6E9] py-10 px-4 sm:px-6 lg:px-8 font-mono">
      <main className="max-w-4xl mx-auto w-full space-y-10">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 space-y-3 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FF007A] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
            <Sparkles className="w-4 h-4" />
            ABOUT THE GENERATOR
          </div>

          <h1 className="font-display font-black uppercase text-5xl sm:text-7xl tracking-tight leading-none text-white">
            HH GOA BUILDER ID<span className="text-[#FFE600]">.</span>
          </h1>

          <p className="font-mono text-sm font-bold text-[#FBF6E9]/80 max-w-2xl mx-auto leading-relaxed">
            The official Hacker House Goa 2026 Builder ID & Profile Frame generator. One upload turns you into an official
            HH Goa 2026 Builder — with a numbered pass, a rolled Builder Title and a frame built for your X profile.
          </p>
        </div>

        {/* How it works */}
        <div className="pinned-card p-6 sm:p-8 space-y-4 shadow-2xl">
          <h2 className="font-display font-black uppercase text-2xl sm:text-3xl text-[#1A2E22] tracking-tight">
            HOW IT WORKS<span className="text-[#FF007A]">.</span>
          </h2>

          <ol className="space-y-3 font-mono text-sm font-bold text-[#1A2E22]">
            <li className="flex items-start gap-3">
              <span className="bg-[#FF007A] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0">1</span>
              <span>Upload any photo — JPG, PNG or HEIC. Your face is auto-framed, no manual cropping.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-[#0B6B3A] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0">2</span>
              <span>Add your name, stack and optional X handle. A Builder Title and playful stats are rolled for you.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-[#FFE600] text-[#1A2E22] w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0">3</span>
              <span>Generate your 1920×2560 Builder ID pass and 2048×2048 Profile Frame in under two seconds.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-[#FF007A] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0">4</span>
              <span>Download high-res PNGs and share to X with <span className="text-[#FF007A]">#FrameInGoa</span> to join the gallery.</span>
            </li>
          </ol>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="pinned-card pin-top-pink p-6 space-y-3 shadow-xl">
            <Palette className="w-6 h-6 text-[#FF007A]" />
            <h3 className="font-display font-bold uppercase text-lg text-[#1A2E22] tracking-tight">Exact HH Goa Styling</h3>
            <p className="font-mono text-xs font-bold text-[#1A2E22]/70 leading-relaxed">
              Tropical green, cream paper, yellow and hot pink — the recognisable HH Goa 2026 identity on every card.
            </p>
          </div>

          <div className="pinned-card pin-top-yellow p-6 space-y-3 shadow-xl">
            <Users className="w-6 h-6 text-[#0B6B3A]" />
            <h3 className="font-display font-bold uppercase text-lg text-[#1A2E22] tracking-tight">Team Frames</h3>
            <p className="font-mono text-xs font-bold text-[#1A2E22]/70 leading-relaxed">
              Combine 2–3 builders into one Team Pass with a single shared team number. Bring your whole squad.
            </p>
          </div>

          <div className="pinned-card pin-top-pink p-6 space-y-3 shadow-xl">
            <Share2 className="w-6 h-6 text-[#FF007A]" />
            <h3 className="font-display font-bold uppercase text-lg text-[#1A2E22] tracking-tight">Built For X</h3>
            <p className="font-mono text-xs font-bold text-[#1A2E22]/70 leading-relaxed">
              Square profile frame, one-click share to X, copy-paste captions and a unique 12-char code that links back to your card.
            </p>
          </div>

          <div className="pinned-card pin-top-yellow p-6 space-y-3 shadow-xl">
            <MapPin className="w-6 h-6 text-[#0B6B3A]" />
            <h3 className="font-display font-bold uppercase text-lg text-[#1A2E22] tracking-tight">Goa, India</h3>
            <p className="font-mono text-xs font-bold text-[#1A2E22]/70 leading-relaxed">
              28–31 October 2026. Free accommodation, free meals, 100 hackers, $50K+ in bounties.
            </p>
          </div>

          <div className="pinned-card pin-top-pink p-6 space-y-3 shadow-xl">
            <Download className="w-6 h-6 text-[#FF007A]" />
            <h3 className="font-display font-bold uppercase text-lg text-[#1A2E22] tracking-tight">High-Res PNG</h3>
            <p className="font-mono text-xs font-bold text-[#1A2E22]/70 leading-relaxed">
              Every pass and frame exports as crisp, print-ready PNG — yours to use anywhere.
            </p>
          </div>

          <div className="pinned-card pin-top-yellow p-6 space-y-3 shadow-xl">
            <Sparkles className="w-6 h-6 text-[#0B6B3A]" />
            <h3 className="font-display font-bold uppercase text-lg text-[#1A2E22] tracking-tight">Builder Numbers</h3>
            <p className="font-mono text-xs font-bold text-[#1A2E22]/70 leading-relaxed">
              Every builder gets a unique HH-2026 number. Check yours and find it on the gallery map.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="pinned-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <div className="font-display font-black uppercase text-3xl text-[#1A2E22]">Claim yours now</div>
            <div className="font-mono text-sm font-bold text-[#1A2E22]/80 mt-1">
              It takes less than two minutes.
            </div>
          </div>
          <Link href="/create">
            <Button variant="primary" size="lg" className="pink-pill-btn px-8">
              BUILD YOUR ID CARD
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
