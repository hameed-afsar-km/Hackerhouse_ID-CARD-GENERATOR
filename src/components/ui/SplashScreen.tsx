'use client';

import { useEffect, useState } from 'react';
import { motion, MotionConfig, type Variants } from 'framer-motion';
import { GoaBadge } from './GoaBadge';

const wordContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.2 } },
};

const letterVariant: Variants = {
  hidden: { opacity: 0, y: 40, rotateX: 90, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: 'blur(0px)',
    transformPerspective: 600,
    transition: { type: 'spring', stiffness: 220, damping: 18 },
  },
};

const SplashWord = ({ text }: { text: string }) => (
  <motion.span variants={wordContainer} initial="hidden" animate="show" className="inline-block">
    {text.split('').map((ch, i) => (
      <motion.span key={i} variants={letterVariant} className="inline-block">
        {ch}
      </motion.span>
    ))}
  </motion.span>
);

const SunRays = () => (
  <svg className="w-full h-full" viewBox="0 0 200 200" aria-hidden="true">
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

const Palm = ({ flip = false }: { flip?: boolean }) => (
  <svg
    className={`w-full h-full ${flip ? '-scale-x-100' : ''}`}
    viewBox="0 0 100 100"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M45 100 Q50 60 40 20 L45 20 Q55 60 55 100 Z" />
    <path d="M42 25 Q20 30 10 50 Q25 45 42 25 Z" />
    <path d="M45 20 Q30 10 20 0 Q35 15 45 20 Z" />
    <path d="M48 22 Q60 5 80 10 Q65 20 48 22 Z" />
    <path d="M45 25 Q70 40 90 60 Q70 50 45 25 Z" />
  </svg>
);

const WaveShape = ({ color = '#064E29' }: { color?: string }) => (
  <svg className="w-full h-full shrink-0" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0,40 C180,90 360,0 540,40 C720,90 900,0 1080,40 C1260,90 1440,40 1440,40 L1440,100 L0,100 Z" fill={color} />
  </svg>
);

export const SplashScreen = () => {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'done'>('visible');

  useEffect(() => {
    const fade = setTimeout(() => setPhase('fading'), 1850);
    const done = setTimeout(() => setPhase('done'), 2400);
    return () => {
      clearTimeout(fade);
      clearTimeout(done);
    };
  }, []);

  const skip = () => {
    if (phase === 'visible') setPhase('fading');
  };

  if (phase === 'done') return null;

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={`fixed inset-0 z-[100] bg-[#0B6B3A] flex items-center justify-center overflow-hidden cursor-pointer transition-opacity duration-500 ${
          phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-hidden="true"
        onClick={skip}
      >
        {/* Tropical sun */}
        <div className="absolute -top-24 -right-20 w-[420px] h-[420px] opacity-90 pointer-events-none animate-hh-spin-slow" style={{ animationDuration: '45s' }}>
          <SunRays />
        </div>

        {/* Drifting aurora blobs */}
        <div className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-[#FFE600]/10 blur-3xl animate-hh-drift pointer-events-none" />
        <div className="absolute -bottom-24 -right-16 w-[440px] h-[440px] rounded-full bg-[#2EC4B6]/10 blur-3xl animate-hh-drift pointer-events-none" style={{ animationDelay: '6s' }} />

        {/* Swaying palms */}
        <div className="absolute bottom-0 -left-6 w-60 h-60 text-white opacity-25 pointer-events-none animate-hh-sway">
          <Palm />
        </div>
        <div className="absolute bottom-0 -right-6 w-72 h-72 text-white opacity-25 pointer-events-none animate-hh-sway" style={{ animationDelay: '1.4s' }}>
          <Palm flip />
        </div>

        {/* Center poster — HACKER / गोवा / HOUSE */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 text-center">
          {/* Eyebrow pill */}
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="mb-8 sm:mb-12 inline-flex items-center gap-2.5 bg-[#FFE600] text-[#1A2E22] px-4 py-2 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider shadow-md"
          >
            <span className="h-2 w-2 rounded-full bg-[#FF007A]" />
            HH GOA 2026 · ID & FRAME GENERATOR
          </motion.div>

          {/* Poster */}
          <div className="relative flex flex-col items-center">
            {/* HACKER — assembles above the line */}
            <div className="text-5xl sm:text-7xl font-display font-black uppercase leading-none tracking-tight text-[#FFE600]">
              <SplashWord text="HACKER" />
            </div>

            {/* Wavy divider line */}
            <div className="w-[130%] my-5 sm:my-8 opacity-25 pointer-events-none">
              <WaveShape color="#FBF6E9" />
            </div>

            {/* HOUSE — assembles below the line */}
            <div className="text-5xl sm:text-7xl font-display font-black uppercase leading-none tracking-tight text-[#FFE600]">
              <SplashWord text="HOUSE" />
            </div>

            {/* गोवा stamps in on the line */}
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -18 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 13, delay: 0.55 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
            >
              {/* Pink impact ring */}
              <motion.span
                initial={{ opacity: 0.8, scale: 0.35 }}
                animate={{ opacity: 0, scale: 1.6 }}
                transition={{ delay: 0.55, duration: 0.7, ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square rounded-full border-2 border-[#FF007A]/70 pointer-events-none"
              />
              {/* Yellow accent line under गोवा */}
              <motion.span
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 1.05, duration: 0.35, ease: 'easeOut' }}
                className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 w-56 sm:w-80 h-1.5 bg-[#FFE600] rounded-full origin-center pointer-events-none"
              />
              <GoaBadge size="4xl" />
            </motion.div>
          </div>

          {/* Bottom mono line */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.45 }}
            className="mt-10 sm:mt-14 font-mono text-xs sm:text-sm text-[#FFE600] font-bold tracking-widest"
          >
            THE ISLAND · GOA, INDIA · 28 – 31 OCT 2026
          </motion.div>
        </div>

        {/* Waves lapping at the base */}
        <div className="absolute bottom-0 inset-x-0 h-16 opacity-70 pointer-events-none">
          <div className="flex w-[200%] h-full animate-hh-wave">
            <WaveShape />
            <WaveShape />
          </div>
        </div>
      </motion.div>
    </MotionConfig>
  );
};
