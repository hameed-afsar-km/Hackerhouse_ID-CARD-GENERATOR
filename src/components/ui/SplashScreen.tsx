'use client';

import { useEffect, useState } from 'react';
import { motion, MotionConfig, type Variants } from 'framer-motion';
import { GoaBadge } from './GoaBadge';

const wordContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.15 } },
};

const letterVariant: Variants = {
  hidden: { opacity: 0, y: 32, rotateX: 90, filter: 'blur(6px)' },
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

const WaveShape = () => (
  <svg className="w-full h-full shrink-0" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0,40 C180,90 360,0 540,40 C720,90 900,0 1080,40 C1260,90 1440,40 1440,40 L1440,100 L0,100 Z" fill="#064E29" />
  </svg>
);

export const SplashScreen = () => {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'done'>('visible');

  useEffect(() => {
    const fade = setTimeout(() => setPhase('fading'), 1750);
    const done = setTimeout(() => setPhase('done'), 2300);
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

        {/* Center content — HACKER / गोवा / HOUSE */}
        <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
          <div className="font-display font-black uppercase leading-[0.9] tracking-tight text-[#FFE600]">
            <div className="text-5xl sm:text-7xl">
              <SplashWord text="HACKER" />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.4, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 15, delay: 0.4 }}
              className="my-1 sm:my-2"
            >
              <GoaBadge size="3xl" />
            </motion.div>
            <div className="text-5xl sm:text-7xl">
              <SplashWord text="HOUSE" />
            </div>
          </div>
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
