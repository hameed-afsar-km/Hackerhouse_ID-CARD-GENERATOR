'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Radio,
  ArrowRight,
  ArrowDown,
  Zap,
  Layers,
  Users,
  Image as ImageIcon,
  Sailboat,
  Palette,
  Share2,
  Search,
} from 'lucide-react';
import { motion, MotionConfig, useMotionValue, useSpring, useTransform, type Variants } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { CountUp } from '@/components/ui/CountUp';
import { GoaBadge } from '@/components/ui/GoaBadge';
import { SAMPLE_BUILDERS } from '@/lib/demo-builders';
import { BuilderCardCanvas } from '@/components/canvas/BuilderCardCanvas';
import { ProfileFrameCanvas } from '@/components/canvas/ProfileFrameCanvas';
import { TeamFrameCanvas } from '@/components/canvas/TeamFrameCanvas';

const TICKER = [
  '#FRAMEINGOA',
  'BUILDER ID',
  'PROFILE FRAME',
  '28–31 OCT 2026',
  'GOA INDIA',
  'FIND BY CODE',
  'AUTO-FRAME PHOTO',
  'ONE UPLOAD = TWO SHARES',
];

const FEATURES = ['AUTO-FRAME PHOTO', 'ROLLED BUILDER TITLE', 'UNIQUE ACCESS CODE', '1-CLICK SHARE → X'];

const STATS = [
  { value: 6800, suffix: '+', label: 'Registrations 2024' },
  { value: 390, suffix: '+', label: 'Hackers' },
  { value: 100, suffix: '', label: 'Projects' },
  { value: 50, prefix: '$', suffix: 'K+', label: 'Bounties 2026' },
];

const JOURNEY = [
  {
    icon: Sailboat,
    num: '01',
    title: 'DOCK',
    body: 'Drop any photo at the dock — auto-framing crops it for you. HEIC, PNG, JPG, all good.',
  },
  {
    icon: Palette,
    num: '02',
    title: 'DECORATE',
    body: 'Name, stack, X handle and a Builder Title rolled just for you.',
  },
  {
    icon: Share2,
    num: '03',
    title: 'SET SAIL',
    body: 'Download your pass, set your frame on X, tag #FrameInGoa.',
  },
];

type ViewId = 'pass' | 'frame' | 'team';

const STORY: Array<{ id: ViewId; num: string; icon: React.ElementType; title: string; tag: string; body: string }> = [
  {
    id: 'pass',
    num: '01',
    icon: Layers,
    title: 'THE BUILDER ID PASS',
    tag: 'PORTRAIT · 1200×1600',
    body: 'Your numbered HH Goa 2026 pass — auto-framed photo, rolled Builder Title, stack, X handle and a unique code searchable from the gallery.',
  },
  {
    id: 'frame',
    num: '02',
    icon: ImageIcon,
    title: 'THE PROFILE FRAME',
    tag: 'SQUARE · 1000×1000',
    body: 'The square frame for X — rings, banner, #FrameInGoa. Cut straight to your photo, ready to post in one tap.',
  },
  {
    id: 'team',
    num: '03',
    icon: Users,
    title: 'THE TEAM PASS',
    tag: 'COMBINED · 2–3 BUILDERS',
    body: 'Bring your squad — combine 2–3 builders into one shared Team Pass with a team number for the house.',
  },
];

/* ---------------------------------------------------------------- */
/* Tropical helpers                                                  */
/* ---------------------------------------------------------------- */

const Palm = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
    <path d="M45 100 Q50 60 40 20 L45 20 Q55 60 55 100 Z" />
    <path d="M42 25 Q20 30 10 50 Q25 45 42 25 Z" />
    <path d="M45 20 Q30 10 20 0 Q35 15 45 20 Z" />
    <path d="M48 22 Q60 5 80 10 Q65 20 48 22 Z" />
    <path d="M45 25 Q70 40 90 60 Q70 50 45 25 Z" />
  </svg>
);

const WaveShape = ({ color }: { color: string }) => (
  <svg className="w-full h-full shrink-0" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0,40 C180,90 360,0 540,40 C720,90 900,0 1080,40 C1260,90 1440,40 1440,40 L1440,100 L0,100 Z" fill={color} />
  </svg>
);

const Waves = ({
  color,
  opacity = 1,
  duration = '16s',
  className = '',
}: {
  color: string;
  opacity?: number;
  duration?: string;
  className?: string;
}) => (
  <div className={`overflow-hidden pointer-events-none ${className}`} style={{ opacity }}>
    <div className="flex w-[200%] h-full animate-hh-wave" style={{ animationDuration: duration }}>
      <WaveShape color={color} />
      <WaveShape color={color} />
    </div>
  </div>
);

/* ---------------------------------------------------------------- */
/* Hero animation variants + helpers                                  */
/* ---------------------------------------------------------------- */

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 160, damping: 20 } },
};

const letterContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
};

const letterVariant: Variants = {
  hidden: { opacity: 0, y: 28, rotateX: 90, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: 'blur(0px)',
    transformPerspective: 600,
    transition: { type: 'spring', stiffness: 220, damping: 16 },
  },
};

const StaggerText = ({ text, className = '' }: { text: string; className?: string }) => (
  <motion.span variants={letterContainer} initial="hidden" animate="show" className={`inline-block ${className}`}>
    {text.split('').map((ch, i) => (
      <motion.span key={i} variants={letterVariant} className="inline-block">
        {ch === ' ' ? '\u00A0' : ch}
      </motion.span>
    ))}
  </motion.span>
);

const SunRays = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r2 = (n: number) => Math.round(n * 100) / 100;
      return (
        <line
          key={i}
          x1={r2(100 + Math.cos(a) * 48)}
          y1={r2(100 + Math.sin(a) * 48)}
          x2={r2(100 + Math.cos(a) * 78)}
          y2={r2(100 + Math.sin(a) * 78)}
          stroke="#FFE600"
          strokeWidth="7"
          strokeLinecap="round"
        />
      );
    })}
    <circle cx="100" cy="100" r="40" fill="#FFE600" />
  </svg>
);

/* ---------------------------------------------------------------- */

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>('pass');
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const demo = SAMPLE_BUILDERS[0];
  const sample = SAMPLE_BUILDERS[activeSampleIndex];
  const blockRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Mouse parallax for the hero stage
  const heroRef = useRef<HTMLElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 120, damping: 18 });
  const smy = useSpring(my, { stiffness: 120, damping: 18 });
  const stageX = useTransform(smx, [-1, 1], [-16, 16]);
  const stageY = useTransform(smy, [-1, 1], [-12, 12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  // 3D tilt for the showcase card
  const cardRx = useMotionValue(0);
  const cardRy = useMotionValue(0);
  const cardSRx = useSpring(cardRx, { stiffness: 150, damping: 15 });
  const cardSRy = useSpring(cardRy, { stiffness: 150, damping: 15 });

  const handleCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cardRy.set(((e.clientX - rect.left) / rect.width - 0.5) * 16);
    cardRx.set(((e.clientY - rect.top) / rect.height - 0.5) * -14);
  };

  const handleCardLeave = () => {
    cardRx.set(0);
    cardRy.set(0);
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 85,
      startVelocity: 42,
      origin: { y: 0.6 },
      colors: ['#FF007A', '#FFE600', '#2EC4B6', '#FBF6E9'],
      zIndex: 999,
    });
  };

  // Scroll-spy: highlight the sticky preview matching the block in view
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-view');
            if (id === 'pass' || id === 'frame' || id === 'team') setActiveView(id);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    blockRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Auto-cycle in the spotlight
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSampleIndex((i) => (i + 1) % SAMPLE_BUILDERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0B6B3A] text-[#FBF6E9] overflow-x-clip">
      {/* Scroll progress bar (scroll-driven) */}
      <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-[#FF007A] via-[#FFE600] to-[#2EC4B6] z-[80] hh-scroll-progress" aria-hidden="true" />

      {/* Ambient background */}
      <div className="absolute top-0 inset-x-0 h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-32 -left-14 w-72 h-72 opacity-20 hh-scroll-parallax">
          <Palm className="w-full h-full text-white animate-hh-sway" />
        </div>
        <div className="absolute top-72 -right-14 w-80 h-80 opacity-20 hh-scroll-parallax" style={{ animationDelay: '1.5s' }}>
          <Palm className="w-full h-full text-white animate-hh-sway" />
        </div>
        <div className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full bg-[#FFE600]/10 blur-3xl animate-hh-drift" />
        <div className="absolute top-[35%] -right-32 w-[460px] h-[460px] rounded-full bg-[#2EC4B6]/10 blur-3xl animate-hh-drift" style={{ animationDelay: '6s' }} />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 space-y-32">

        {/* ============================ HERO ============================ */}
        <MotionConfig reducedMotion="user">
          <section
            ref={heroRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative pt-10 pb-32 lg:pb-40"
          >
            {/* Sun with rotating rays */}
            <div className="absolute -top-16 -right-24 w-44 h-44 opacity-90 pointer-events-none animate-hh-spin-slow sm:-right-16 sm:w-80 sm:h-80" style={{ animationDuration: '70s' }}>
              <SunRays className="w-full h-full" />
            </div>

            {/* Palms framing the beach */}
            <div className="absolute top-24 -left-16 w-48 h-48 opacity-20 pointer-events-none animate-hh-sway">
              <Palm className="w-full h-full text-white" />
            </div>
            <div className="absolute bottom-16 -right-20 w-44 h-44 opacity-20 pointer-events-none animate-hh-sway hidden sm:block" style={{ animationDelay: '1.8s' }}>
              <Palm className="w-full h-full text-white" />
            </div>

            {/* Centered copy */}
            <motion.div
              variants={heroContainer}
              initial="hidden"
              animate="show"
              className="relative z-10 max-w-4xl mx-auto text-center space-y-8"
            >
              <motion.div
                variants={heroItem}
                className="inline-flex items-center gap-2.5 bg-[#FFE600] text-[#1A2E22] px-4 py-2 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider shadow-md"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF007A] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF007A]" />
                </span>
                HH GOA 2026 · ID & FRAME GENERATOR
              </motion.div>

              <div className="flex flex-wrap items-end justify-center gap-x-5 gap-y-2">
                <div className="relative">
                  <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#FFE600] uppercase leading-[0.85]">
                    <StaggerText text="HACKER" />
                    <br />
                    <StaggerText text="HOUSE" />
                  </h1>
                  <span
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[#FF007A] font-devanagari font-black leading-none text-2xl sm:text-3xl lg:text-4xl"
                    style={{ WebkitTextStroke: '3px #FFE600', paintOrder: 'stroke fill' }}
                  >
                    गोवा
                  </span>
                </div>
              </div>

              <motion.div variants={heroItem} className="font-mono text-sm sm:text-base text-[#FFE600] font-bold tracking-widest">
                THE ISLAND · GOA, INDIA · 28 – 31 OCT 2026
              </motion.div>

              <motion.h2
                variants={heroItem}
                className="font-display font-black uppercase tracking-tight leading-[0.95] text-3xl sm:text-5xl text-white"
              >
                Your Builder ID,<br />
                born on <span className="text-[#FFE600]">the island</span><span className="text-[#FF007A]">.</span>
              </motion.h2>

              <motion.p variants={heroItem} className="font-mono text-sm sm:text-base text-[#FBF6E9]/90 leading-relaxed max-w-2xl mx-auto">
                One upload turns you into an official HH Goa 2026 Builder. A numbered pass, a profile frame, and a unique code searchable from the gallery.
              </motion.p>

              <motion.div
                variants={heroItem}
                className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] font-extrabold tracking-wider"
              >
                {FEATURES.map((chip) => (
                  <span
                    key={chip}
                    className="bg-[#FBF6E9]/10 border border-white/15 text-[#FBF6E9]/90 px-3.5 py-1.5 rounded-full backdrop-blur-sm cursor-default transition-all duration-200 hover:bg-[#FFE600] hover:text-[#1A2E22] hover:border-[#FFE600] hover:-translate-y-0.5"
                  >
                    {chip}
                  </span>
                ))}
              </motion.div>

              <motion.div variants={heroItem} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/create" className="group">
                  <Button size="xl" variant="primary" className="pink-pill-btn px-10 shadow-lg" onClick={fireConfetti}>
                    <Sparkles className="w-5 h-5" />
                    BUILD YOUR ID CARD
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button size="xl" variant="outline" className="yellow-pill-btn px-10 shadow-lg">
                    <Radio className="w-5 h-5 text-[#0B6B3A]" />
                    EXPLORE GALLERY
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={heroItem}
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] font-bold text-[#FBF6E9]/70"
              >
                <span>6800+ BUILDERS</span>
                <span className="text-[#FF007A]">✦</span>
                <span>28 – 31 OCT 2026</span>
                <span className="text-[#FF007A]">✦</span>
                <a href="#what-you-get" className="inline-flex items-center gap-1.5 hover:text-[#FFE600] transition-colors">
                  SEE WHAT YOU GET <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                </a>
              </motion.div>
            </motion.div>

            {/* Fanned card strip — the three things you walk away with */}
            <motion.div style={{ x: stageX, y: stageY }} className="relative z-10 mt-16 sm:mt-20 select-none">
              {/* Halo */}
              <div className="absolute inset-0 m-auto w-[64%] h-[64%] rounded-full bg-[#FFE600]/10 blur-3xl" />

              <div className="relative flex items-end justify-center gap-2 sm:gap-6">
                {/* Team frame — left */}
                <motion.div
                  initial={{ opacity: 0, x: -70, y: 30, rotate: 14 }}
                  animate={{ opacity: 1, x: 0, y: 0, rotate: 7 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.55 }}
                  className="hidden sm:block -translate-y-4"
                >
                  <div className="pinned-card p-2.5 w-52 shadow-xl transition-transform duration-300 hover:scale-105 hover:-translate-y-1.5 will-change-transform">
                    <TeamFrameCanvas teamName="HACKER HOUSE" members={SAMPLE_BUILDERS.slice(0, 4)} />
                  </div>
                  <div className="mt-2 text-center font-mono text-[10px] font-bold text-[#2EC4B6] tracking-widest">TEAM FRAME</div>
                </motion.div>

                {/* Builder pass — center */}
                <motion.div
                  initial={{ opacity: 0, y: 60, rotate: -10 }}
                  animate={{ opacity: 1, y: 0, rotate: -2 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.35 }}
                  onMouseMove={handleCardMove}
                  onMouseLeave={handleCardLeave}
                  className="relative z-10 -translate-y-5 sm:-translate-y-7 group"
                >
                  <motion.div style={{ rotateX: cardSRx, rotateY: cardSRy, transformPerspective: 1000 }}>
                    <div className="pinned-card p-3 w-48 sm:w-64 shadow-2xl transition-shadow duration-300 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
                      <BuilderCardCanvas builder={demo} />
                    </div>
                  </motion.div>
                  <div className="mt-2 text-center font-mono text-[10px] font-bold text-[#FFE600] tracking-widest">BUILDER PASS</div>
                </motion.div>

                {/* Profile frame — right */}
                <motion.div
                  initial={{ opacity: 0, x: 70, y: 30, rotate: -14 }}
                  animate={{ opacity: 1, x: 0, y: 0, rotate: -7 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.7 }}
                  className="hidden sm:block -translate-y-4"
                >
                  <div className="pinned-card p-2.5 w-52 shadow-xl transition-transform duration-300 hover:scale-105 hover:-translate-y-1.5 will-change-transform">
                    <ProfileFrameCanvas builder={demo} />
                  </div>
                  <div className="mt-2 text-center font-mono text-[10px] font-bold text-[#FF007A] tracking-widest">PROFILE FRAME</div>
                </motion.div>
              </div>

              {/* Sticker chip — unique code */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 1 }}
                className="absolute -bottom-3 right-6 sm:right-16 bg-[#FF007A] text-white px-3.5 py-1.5 rounded-full shadow-lg font-mono text-[10px] font-black tracking-widest rotate-[-6deg]"
              >
                UNIQUE CODE ✦
              </motion.div>
            </motion.div>

            {/* Waves lapping the shore at the base of the hero */}
            <Waves color="#064E29" opacity={0.55} className="absolute bottom-0 left-0 right-0 h-14 sm:h-20" />
          </section>
        </MotionConfig>

        {/* Marquee ticker */}
        <div className="bg-[#FFE600] text-[#1A2E22] rotate-1 shadow-lg overflow-hidden py-2.5 -mx-4 sm:mx-0">
          <div className="animate-hh-marquee flex whitespace-nowrap w-max font-mono text-xs font-extrabold tracking-widest">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="px-5 inline-flex items-center gap-5">
                <span>{t}</span>
                <span className="text-[#FF007A]">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* ============================ WHAT YOU GET — scroll story ============================ */}
        <section id="what-you-get" className="space-y-12 scroll-mt-28">
          <Reveal>
            <div className="text-center space-y-2">
              <div className="font-mono text-xs font-bold text-[#FFE600] uppercase tracking-widest">ISLAND GOODIES</div>
              <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">
                WHAT YOU GET
              </h2>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Sticky morphing preview — column stretches, inner card sticks */}
            <div className="order-2 lg:order-1">
              <div className="lg:sticky lg:top-36">
                <Reveal>
                  <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[300px]">
                    <div className="absolute -inset-8 rounded-full bg-[#FFE600]/10 blur-3xl" />
                    <div className="absolute -inset-3 rounded-full border border-dashed border-[#2EC4B6]/30 animate-hh-spin-slow" />

                    <div className="relative h-[440px] sm:h-[480px]">
                      {STORY.map((block) => (
                        <div
                          key={block.id}
                          className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                            activeView === block.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                          }`}
                        >
                          <div className="pinned-card p-3 rotate-1 shadow-2xl">
                            {block.id === 'pass' && <BuilderCardCanvas builder={demo} />}
                            {block.id === 'frame' && <ProfileFrameCanvas builder={demo} />}
                            {block.id === 'team' && (
                              <TeamFrameCanvas teamName="HH GOA 2026" members={[demo, SAMPLE_BUILDERS[1], SAMPLE_BUILDERS[2]]} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Progress + label */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                      {STORY.map((block) => (
                        <span
                          key={block.id}
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            activeView === block.id ? 'w-8 bg-[#FF007A]' : 'w-2.5 bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-3 text-center font-mono text-[11px] font-bold text-[#FFE600] tracking-widest">
                      {STORY.find((b) => b.id === activeView)?.tag}
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Scroll story blocks */}
            <div className="space-y-16 lg:space-y-24 order-1 lg:order-2">
              {STORY.map((block, idx) => {
                const Icon = block.icon;
                return (
                  <div
                    key={block.id}
                    data-view={block.id}
                    ref={(el) => {
                      blockRefs.current[idx] = el;
                    }}
                    className={`hh-scroll-reveal lg:min-h-[55vh] flex flex-col justify-center border-l-2 pl-6 sm:pl-10 ${
                      activeView === block.id ? 'border-[#FF007A]' : 'border-white/15'
                    } transition-colors duration-500`}
                  >
                    <div className="flex items-center gap-3 font-mono text-xs font-extrabold text-[#FF007A] tracking-widest">
                      <span className="bg-[#FF007A]/15 border border-[#FF007A]/30 rounded-full px-3 py-1">0{idx + 1}</span>
                      <span className="text-[#FBF6E9]/50">{block.tag}</span>
                    </div>

                    <div className="mt-6 w-14 h-14 rounded-full bg-[#FFE600] text-[#1A2E22] flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-white mt-5">
                      {block.title}
                    </h3>

                    <p className="font-mono text-sm font-bold text-[#FBF6E9]/80 leading-relaxed mt-4 max-w-md">
                      {block.body}
                    </p>

                    <div className="mt-7">
                      <Link href="/create" className="group inline-flex">
                        <Button variant="primary" className="pink-pill-btn">
                          MAKE YOURS
                          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================ THE JOURNEY ============================ */}
        <section className="space-y-12">
          <Reveal>
            <div className="text-center space-y-2">
              <div className="font-mono text-xs font-bold text-[#FFE600] uppercase tracking-widest">THE JOURNEY</div>
              <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">
                THREE STEPS TO <span className="text-[#FF007A]">#FRAMEINGOA</span>
              </h2>
            </div>
          </Reveal>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] border-t-2 border-dashed border-[#FFE600]/30" />

            {JOURNEY.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.num} delay={idx * 120}>
                  <div className="relative text-center p-8 rounded-2xl bg-[#0B6B3A]/60 border border-white/10 backdrop-blur-sm hover:border-[#2EC4B6]/60 hover:-translate-y-2 transition-all duration-300 h-full overflow-hidden">
                    <Waves color="#2EC4B6" opacity={0.15} duration="20s" className="absolute bottom-0 inset-x-0 h-6" />

                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full bg-[#2EC4B6]/15 animate-hh-qr-pulse" />
                      <div className="relative w-20 h-20 rounded-full bg-[#FFE600] text-[#1A2E22] flex items-center justify-center shadow-lg">
                        <Icon className="w-8 h-8" />
                      </div>
                      <span className="absolute -top-1 -right-1 bg-[#FF007A] text-white text-[10px] font-mono font-extrabold w-7 h-7 rounded-full flex items-center justify-center shadow">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-[#FFE600] uppercase tracking-tight">{step.title}</h3>
                    <p className="font-mono text-xs font-bold text-[#FBF6E9]/75 leading-relaxed mt-3">{step.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ============================ STATS ============================ */}
        <Reveal>
          <section className="max-w-5xl mx-auto w-full">
            <div className="grid grid-cols-2 lg:grid-cols-4 rounded-3xl overflow-hidden border-2 border-[#2EC4B6]/40 shadow-2xl">
              {STATS.map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`stat-tile p-8 text-center relative overflow-hidden ${
                    idx % 2 === 0 ? 'bg-[#FFE600] text-[#1A2E22]' : 'bg-[#FF007A] text-white'
                  } ${idx > 0 ? 'border-l border-black/10' : ''}`}
                >
                  <Waves color="#2EC4B6" opacity={0.25} duration="20s" className="absolute bottom-0 inset-x-0 h-5" />
                  <div className="font-display font-black text-4xl sm:text-5xl">
                    <CountUp value={stat.value} prefix={stat.prefix ?? ''} suffix={stat.suffix} />
                  </div>
                  <div className="font-mono text-xs font-bold uppercase mt-2 opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ============================ BUILDER SPOTLIGHT ============================ */}
        <Reveal>
          <section className="max-w-4xl mx-auto w-full space-y-8">
            <div className="text-center space-y-2">
              <div className="font-mono text-xs font-bold text-[#FFE600] uppercase tracking-widest">LIVE DEMO</div>
              <h2 className="font-display font-black text-4xl uppercase tracking-tight text-white">BUILDER SPOTLIGHT</h2>
            </div>

            <div className="pinned-card p-6 sm:p-10 space-y-8 shadow-2xl">
              <div className="flex items-center justify-between font-mono text-xs text-[#1A2E22] border-b border-[#1A2E22]/10 pb-3">
                <span className="flex items-center gap-2 text-[#FF007A] font-bold">
                  <Zap className="w-4 h-4" /> SAMPLE BUILDER 0{activeSampleIndex + 1} / 04
                </span>
                <span className="text-[#1A2E22]/60 font-bold">1200 × 1600 EVENT PASS</span>
              </div>

              <div className="max-w-md mx-auto rounded-2xl overflow-hidden shadow-lg border border-[#1A2E22]/20">
                <BuilderCardCanvas builder={sample} />
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {SAMPLE_BUILDERS.map((b, idx) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveSampleIndex(idx)}
                    className={`px-5 py-2.5 font-mono text-xs font-bold rounded-full transition-all duration-200 ${
                      activeSampleIndex === idx
                        ? 'bg-[#FF007A] text-white shadow-md scale-105'
                        : 'bg-[#0B6B3A]/10 text-[#1A2E22] hover:bg-[#FF007A]/20'
                    }`}
                  >
                    {b.name.split(' ')[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ============================ CTA — SUNSET ============================ */}
        <Reveal>
          <section className="relative overflow-hidden rounded-3xl border-2 border-[#FFE600]/50 bg-gradient-to-br from-[#FF007A] via-[#FF007A]/85 to-[#0B6B3A] p-10 sm:p-16 text-center shadow-2xl">
            <Palm className="absolute bottom-8 left-4 w-32 h-32 text-[#0B6B3A]/60 animate-hh-sway" />
            <Palm className="absolute bottom-8 right-4 w-32 h-32 text-[#0B6B3A]/60 animate-hh-sway" style={{ animationDelay: '1.5s' }} />
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#FFE600]/25 blur-3xl animate-hh-drift" />
            <div className="absolute top-4 right-6 w-24 h-24 rounded-full bg-[#FFE600]/40 animate-hh-qr-pulse" />

            <div className="relative space-y-7">
              <GoaBadge size="lg" tilt className="mx-auto" />

              <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white">
                Ready to build<br />on the island?
              </h2>

              <p className="font-mono text-sm sm:text-base text-white/85 font-bold max-w-xl mx-auto">
                Claim your official HH Goa 2026 identity. Free, fast, and it takes one upload.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/create" className="group">
                  <Button size="xl" variant="primary" className="bg-[#FFE600] text-[#1A2E22] hover:bg-[#FFE600] hover:scale-105 px-10 shadow-xl font-mono font-bold uppercase">
                    BUILD YOUR ID CARD
                    <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/team-frame">
                  <Button size="xl" variant="outline" className="border-2 border-white/70 text-white rounded-full font-mono text-xs font-bold uppercase px-8 py-3.5 hover:bg-white hover:text-[#FF007A] transition-all">
                    TEAM PASS →
                  </Button>
                </Link>
              </div>
            </div>

            <Waves color="#0B6B3A" opacity={0.5} duration="18s" className="absolute bottom-0 inset-x-0 h-10" />
            <Waves color="#2EC4B6" opacity={0.3} duration="12s" className="absolute bottom-6 inset-x-0 h-8" />
          </section>
        </Reveal>

        {/* Find by code CTA strip */}
        <Reveal>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs font-bold text-[#FBF6E9]/70 border border-white/10 rounded-2xl px-6 py-5 text-center">
            <Search className="w-4 h-4 text-[#FFE600]" />
            <span>
              Every pass carries a unique 12-character code — search it to open any builder&apos;s HH Goa 2026 details.
            </span>
            <Link href="/scan" className="text-[#FF007A] hover:underline underline-offset-4">
              SEARCH A CODE →
            </Link>
          </div>
        </Reveal>

      </main>
    </div>
  );
}
