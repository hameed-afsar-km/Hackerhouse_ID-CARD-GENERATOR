'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Code,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Camera,
  Palette,
  Layers,
  Zap,
  CheckCircle2,
  Dices,
  RotateCcw,
  Compass,
  Image as ImageIcon,
  ChevronRight,
  Expand,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PhotoUploader } from '@/components/creation/PhotoUploader';
import { StackSelector } from '@/components/creation/StackSelector';
import { GenerationAnimation } from '@/components/animation/GenerationAnimation';
import { AuthPanel } from '@/components/auth/AuthPanel';
import {
  BuilderInput,
  StackCategory,
  PhotoFilterSettings,
  BuilderIdentity,
  CardTheme,
  FrameStyle,
  CardBackground,
} from '@/types/builder';
import { createBuilderIdentity, formatClaimCode, BUILDER_TITLES, rollBuilderTitle } from '@/lib/builder-engine';
import { createSampleAvatarSvg, SAMPLE_BUILDERS } from '@/lib/demo-builders';
import { uploadBuilderPhoto } from '@/lib/photo-upload';
import { getClientAuth } from '@/lib/firebase/client';
import { BuilderCardCanvas } from '@/components/canvas/BuilderCardCanvas';
import { FullscreenCardOverlay } from '@/components/canvas/FullscreenCardOverlay';

type AndroidTab = 'photo' | 'intel' | 'customize' | 'mint';

const STUDIO_TABS: { id: AndroidTab; label: string; icon: React.ElementType }[] = [
  { id: 'photo', label: 'PHOTO', icon: Camera },
  { id: 'intel', label: 'INTEL', icon: Code },
  { id: 'customize', label: 'CUSTOMIZE', icon: Palette },
  { id: 'mint', label: 'MINT', icon: Sparkles },
];

const THEME_OPTIONS: { id: CardTheme; label: string; tag: string; gradient: string; dot: string; desc: string }[] = [
  {
    id: 'TROPICAL',
    label: '🌴 TROPICAL GOA',
    tag: 'ORIGINAL',
    gradient: 'from-[#08381D] via-[#0B6B3A] to-[#FFE600]',
    dot: '#0B6B3A',
    desc: 'Lush emerald green & pure gold borders',
  },
  {
    id: 'SUNSET',
    label: '🌅 GOA SUNSET',
    tag: 'VIBRANT',
    gradient: 'from-[#1F0D24] via-[#FF5E3A] to-[#9C3FE4]',
    dot: '#FF5E3A',
    desc: 'Fiery coral orange & twilight glow',
  },
  {
    id: 'CYBER',
    label: '⚡ CYBER MATRIX',
    tag: 'NEO-TECH',
    gradient: 'from-[#080E24] via-[#00E5FF] to-[#FF2E88]',
    dot: '#00E5FF',
    desc: 'Electric cyan HUD brackets & neon glow',
  },
  {
    id: 'OBSIDIAN',
    label: '🖤 OBSIDIAN GOLD',
    tag: 'LUXURY VIP',
    gradient: 'from-[#0D0F12] via-[#2C3240] to-[#FFD700]',
    dot: '#FFD700',
    desc: 'Stealth matte black & 24K liquid gold finish',
  },
];

const FRAME_OPTIONS: { id: FrameStyle; label: string; icon: string; desc: string }[] = [
  { id: 'WREATH', label: '🌺 BOTANICAL', icon: '🌿', desc: 'Monstera leaves & fronds' },
  { id: 'SUNBURST', label: '☀️ SUNBURST', icon: '✨', desc: '24 golden solar flares' },
  { id: 'NEON', label: '💖 NEON GLOW', icon: '💫', desc: 'Double plasma glowing halos' },
  { id: 'CIRCUIT', label: '⚡ CYBER HUD', icon: '🛰️', desc: 'Tech brackets & calipers' },
];

const BACKGROUND_OPTIONS: { id: CardBackground; label: string; icon: string; desc: string }[] = [
  { id: 'NIGHT', label: '🌙 STARLIT NIGHT', icon: '🌙', desc: 'Navy sky, stars & moon' },
  { id: 'SUNSET', label: '🌅 GOA SUNSET', icon: '🌇', desc: 'Warm orange twilight & birds' },
  { id: 'FOREST', label: '🌴 JUNGLE FIREFLY', icon: '🪲', desc: 'Emerald jungle & fireflies' },
  { id: 'CYBER', label: '⚡ CYBER GRID', icon: '🛰️', desc: 'Neon grid & data dots' },
];

export default function CreatePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AndroidTab>('photo');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [minting, setMinting] = useState<boolean>(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [hasExisting, setHasExisting] = useState<boolean>(false);
  const [fullscreenOpen, setFullscreenOpen] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [xUsername, setXUsername] = useState<string>('');
  const [title, setTitle] = useState<string>(() => rollBuilderTitle());
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [stack, setStack] = useState<StackCategory[]>(['AI', 'FULL STACK']);
  const [photoSettings, setPhotoSettings] = useState<PhotoFilterSettings>({
    zoom: 1,
    panX: 0,
    panY: 0,
    preset: 'RAW',
    cardTheme: 'TROPICAL',
    frameStyle: 'WREATH',
    cardBackground: 'NIGHT',
  });

  // Live Identity preview calculated in real-time
  const liveIdentity: BuilderIdentity = useMemo(() => {
    const activeName = name.trim() || 'BUILDER';
    const activePhoto = photoUrl || createSampleAvatarSvg(activeName, '#0B6B3A');
    const input: BuilderInput = {
      name: activeName,
      photoUrl: activePhoto,
      stack,
      xUsername: xUsername.trim() || undefined,
      photoSettings,
      title: title.trim() || undefined,
    };
    return createBuilderIdentity(input);
  }, [name, photoUrl, stack, xUsername, photoSettings, title]);

  // Readiness Calculation for Android Status
  const readiness = useMemo(() => {
    let score = 0;
    if (photoUrl) score += 25;
    if (name.trim()) score += 35;
    if (stack.length > 0) score += 20;
    if (user) score += 20;
    return score;
  }, [photoUrl, name, stack, user]);

  // Quick Demo Randomizer
  const handleRandomize = () => {
    const randomSample = SAMPLE_BUILDERS[Math.floor(Math.random() * SAMPLE_BUILDERS.length)];
    const randomTheme = THEME_OPTIONS[Math.floor(Math.random() * THEME_OPTIONS.length)].id;
    const randomFrame = FRAME_OPTIONS[Math.floor(Math.random() * FRAME_OPTIONS.length)].id;
    const randomBackground = BACKGROUND_OPTIONS[Math.floor(Math.random() * BACKGROUND_OPTIONS.length)].id;

    setName(randomSample.name);
    setXUsername(randomSample.xUsername || '');
    setTitle(randomSample.title || rollBuilderTitle());
    setPhotoUrl(randomSample.photoUrl);
    setStack(randomSample.stack);
    setPhotoSettings({
      zoom: 1,
      panX: 0,
      panY: 0,
      preset: 'RAW',
      cardTheme: randomTheme,
      frameStyle: randomFrame,
      cardBackground: randomBackground,
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.2 },
      colors: ['#FFE600', '#FF007A', '#2EC4B6', '#0B6B3A'],
    });
  };

  const handleReset = () => {
    setName('');
    setXUsername('');
    setTitle(rollBuilderTitle());
    setPhotoUrl('');
    setStack(['AI', 'FULL STACK']);
    setPhotoSettings({
      zoom: 1,
      panX: 0,
      panY: 0,
      preset: 'RAW',
      cardTheme: 'TROPICAL',
      frameStyle: 'WREATH',
      cardBackground: 'NIGHT',
    });
    setActiveTab('photo');
  };

  // Keep the signed-in user in sync and detect an already-claimed Builder ID.
  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(getClientAuth(), (u) => {
      setUser(u);
      setHasExisting(false);
      if (u) {
        fetch(`/api/builders/${u.uid}`)
          .then((res) => {
            if (!cancelled) setHasExisting(res.ok);
          })
          .catch(() => {
            if (!cancelled) setHasExisting(false);
          });
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const cacheBuilderLocally = (identity: BuilderIdentity) => {
    try {
      localStorage.setItem(`builder_${identity.id}`, JSON.stringify(identity));
      localStorage.setItem('latest_builder', JSON.stringify(identity));

      const savedRadar = localStorage.getItem('custom_builders');
      const customList = savedRadar ? JSON.parse(savedRadar) : [];
      customList.unshift(identity);
      localStorage.setItem('custom_builders', JSON.stringify(customList));
    } catch (e) {
      console.warn('LocalStorage unavailable', e);
    }
  };

  const handleGenerate = () => {
    if (!name.trim()) {
      alert('Please enter your builder name first.');
      setActiveTab('intel');
      return;
    }
    if (!user) {
      alert('Please sign in to mint your Builder ID.');
      setActiveTab('mint');
      return;
    }
    setMintError(null);
    setIsGenerating(true);
  };

  const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
      promise.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });

  const handleAnimationComplete = useCallback(async () => {
    if (!user) return;

    const photo = photoUrl || createSampleAvatarSvg(name || 'Builder', '#0B6B3A');

    try {
      setMinting(true);
      setMintError(null);

      // 1. Authenticate this request on the server
      const idToken = await withTimeout(user.getIdToken(true), 15000, 'Authentication refresh');

      // 2. Upload the photo to Firebase Storage (public), get its download URL
      const photoDownloadUrl = await withTimeout(uploadBuilderPhoto(user.uid, photo), 20000, 'Photo upload');

      // 3. Roll the identity, keyed by the account uid (one ID per account)
      const input: BuilderInput = {
        name: name.trim(),
        photoUrl: photoDownloadUrl,
        stack,
        xUsername: xUsername.trim() || undefined,
        photoSettings,
        title: title.trim() || undefined,
      };
      const identity = createBuilderIdentity(input);
      identity.id = user.uid;

      // 4. Claim it server-side in an atomic transaction (409 = already claimed)
      const controller = new AbortController();
      const claimTimer = setTimeout(() => controller.abort(), 30000);
      const res = await withTimeout(
        fetch('/api/builders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, identity }),
          signal: controller.signal,
        }),
        30000,
        'Claiming your Builder ID'
      ).finally(() => clearTimeout(claimTimer));

      if (!res.ok && res.status !== 409) {
        const detail = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(detail?.error || `Claim failed (${res.status})`);
      }

      // Cache the server-minted identity so the real unique claim code is used
      const minted = res.status === 409 ? null : (((await res.json()) as { builder?: BuilderIdentity }).builder ?? null);
      const saved = minted ? { ...identity, ...minted } : identity;
      cacheBuilderLocally(saved);
      router.push(`/result?id=${user.uid}`);
    } catch (e) {
      console.error('Failed to mint builder', e);
      const isTimeout = e instanceof Error && e.message.includes('timed out');
      setMinting(false);
      setIsGenerating(false);
      setMintError(
        isTimeout
          ? `${e.message}. Check your connection to Firebase (Storage/Auth/Firestore) and try again.`
          : 'Could not save your Builder ID to the registry. Check your connection and try again.'
      );
    }
  }, [user, name, photoUrl, stack, xUsername, photoSettings, title, router]);

  // Tab advance helper
  const handleNextTab = () => {
    if (activeTab === 'photo') setActiveTab('intel');
    else if (activeTab === 'intel') setActiveTab('customize');
    else if (activeTab === 'customize') setActiveTab('mint');
    else handleGenerate();
  };

  return (
    <div className="relative h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] bg-[#072413] text-[#FBF6E9] overflow-hidden flex flex-col selection:bg-[#FF007A] selection:text-white">
      {isGenerating && <GenerationAnimation onComplete={handleAnimationComplete} />}

      <FullscreenCardOverlay
        builder={liveIdentity}
        mode="card"
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
      />

      {/* Ambient background glow elements */}
      <div className="fixed -top-28 -left-28 w-72 h-72 bg-[#0B6B3A]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 -right-28 w-80 h-80 bg-[#FF007A]/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP STUDIO APP BAR (Fixed Top Strip)                                   */}
      {/* ========================================================================= */}
      <header className="shrink-0 z-30 bg-[#072413]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-5 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Left: Brand Pill & Devanagari touch */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white cursor-pointer"
              title="Return Home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <div>
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-display font-black text-sm sm:text-base text-white tracking-tight uppercase">
                  HH GOA 2026<span className="text-[#FF007A]">.</span>
                </span>
                <span className="hidden sm:inline-block font-devanagari text-[9px] text-[#FFE600] font-black bg-white/10 px-1.5 py-0.2 rounded-full">
                  हॅकर हाउस
                </span>
              </div>
              <div className="text-[9px] font-mono text-[#2EC4B6] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2EC4B6] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={handleRandomize}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFE600] text-[#1A2E22] font-black hover:bg-[#FFE600]/90 active:scale-95 transition-all shadow-xs cursor-pointer text-[10px]"
            >
              <Dices className="w-3 h-3" />
              <span>ROLL</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1 rounded-full bg-white/10 text-white/80 hover:text-white active:scale-95 transition-all border border-white/10 cursor-pointer"
              title="Reset Form"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. DUAL-PANEL 100vh STUDIO WORKSPACE (Zero Page Scroll)                   */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto p-2 sm:p-3 md:p-4 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-stretch overflow-hidden">

        {/* ----------------------------------------------------------------------- */}
        {/* PANEL A: PINNED LIVE CARD STAGE (Always in View!)                       */}
        {/* ----------------------------------------------------------------------- */}
        <section className="shrink-0 h-[28vh] sm:h-[32vh] md:h-full md:col-span-6 lg:col-span-6 flex flex-col justify-between bg-[#0B3E21]/95 backdrop-blur-md border-2 border-white/15 rounded-2xl sm:rounded-3xl p-2 sm:p-3 md:p-4 shadow-xl overflow-hidden relative">
          
          {/* Top Stage Status */}
          <div className="shrink-0 flex items-center justify-between gap-2 font-mono text-xs mb-1">
            <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFE600]/15 border border-[#FFE600]/40 text-[#FFE600] truncate max-w-[160px]">
              {photoSettings.cardTheme || 'TROPICAL'} · {photoSettings.cardBackground || 'NIGHT'}
            </span>
            <button
              type="button"
              onClick={() => setFullscreenOpen(true)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-[#FF007A] text-white/80 hover:text-white active:scale-95 transition-all border border-white/10 cursor-pointer shrink-0"
              title="View Fullscreen"
            >
              <Expand className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Centered Scaled Live Canvas */}
          <div className="flex-1 min-h-0 flex items-center justify-center relative overflow-hidden py-0.5">
            <div className="h-full max-h-full aspect-[3/4] max-w-full rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-[#041A0E] flex items-center justify-center">
              <BuilderCardCanvas builder={liveIdentity} className="w-full h-full object-contain" />
            </div>
          </div>

        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* PANEL B: INTERACTIVE STUDIO INSPECTOR DECK                              */}
        {/* ----------------------------------------------------------------------- */}
        <section className="flex-1 min-h-0 md:h-full md:col-span-6 lg:col-span-6 flex flex-col bg-[#FBF6E9] text-[#1A2E22] rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-[#FFE600]/30 shadow-2xl overflow-hidden relative">
          
          {/* Top Segmented Navigation Tabs */}
          <div className="shrink-0 bg-[#0B6B3A] p-1 sm:p-1.5 border-b border-[#1A2E22]/10 flex items-center justify-between gap-1 overflow-x-auto">
            {STUDIO_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1.5 px-2 rounded-xl font-mono text-[10px] sm:text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#FF007A] text-white shadow-sm ring-1 ring-white/30 scale-102'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Active Tab Form Sheet (Internal Scroll Only!) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 font-mono">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: PHOTO & AVATAR */}
              {activeTab === 'photo' && (
                <motion.div
                  key="photo"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.12 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#1A2E22]/10 pb-1.5">
                    <span className="font-bold text-[11px] text-[#FF007A] uppercase flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" /> 01 / AVATAR DOCK
                    </span>
                    <span className="text-[9px] text-[#1A2E22]/50 font-bold">DRAG INSIDE TO REPOSITION</span>
                  </div>

                  <PhotoUploader
                    photoUrl={photoUrl}
                    settings={photoSettings}
                    onPhotoChange={(url) => setPhotoUrl(url)}
                    onSettingsChange={(st) => setPhotoSettings(st)}
                  />

                  {!photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(createSampleAvatarSvg(name || 'Builder', '#0B6B3A'))}
                      className="w-full py-2 px-3 rounded-xl border border-dashed border-[#1A2E22]/30 text-[11px] font-bold text-[#1A2E22]/70 hover:bg-[#1A2E22]/5 active:scale-98 transition-all cursor-pointer"
                    >
                      🎲 Roll Sample Avatar
                    </button>
                  )}
                </motion.div>
              )}

              {/* TAB 2: BUILDER INTEL & STACK */}
              {activeTab === 'intel' && (
                <motion.div
                  key="intel"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.12 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#1A2E22]/10 pb-1.5">
                    <span className="font-bold text-[11px] text-[#0B6B3A] uppercase flex items-center gap-1">
                      <Code className="w-3.5 h-3.5" /> 02 / BUILDER INTEL
                    </span>
                    <span className="text-[9px] text-[#1A2E22]/50 font-bold">NAME & TRACKS</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-[#0B6B3A] uppercase tracking-wider block">
                        BUILDER NAME <span className="text-[#FF007A]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hameed Afsar KM"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border-2 border-[#1A2E22]/20 focus:border-[#FF007A] text-[#1A2E22] px-3.5 py-2 font-mono text-sm font-bold rounded-xl outline-none transition-all placeholder:text-[#1A2E22]/40 shadow-xs"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-[#0B6B3A] uppercase tracking-wider block">
                          BUILDER TITLE <span className="text-[#1A2E22]/40">(SELECT OR TYPE)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setTitle(rollBuilderTitle())}
                          className="inline-flex items-center gap-1 text-[9px] font-black text-[#FF007A] hover:text-[#1A2E22] bg-[#FF007A]/10 hover:bg-[#FF007A]/20 px-2 py-1 rounded-full transition-colors cursor-pointer"
                        >
                          <Dices className="w-3 h-3" /> ROLL
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. PIXEL WIZARD"
                        value={title}
                        onChange={(e) => setTitle(e.target.value.toUpperCase())}
                        className="w-full bg-white border-2 border-[#1A2E22]/20 focus:border-[#FF007A] text-[#1A2E22] px-3.5 py-2 font-mono text-sm font-bold rounded-xl outline-none transition-all placeholder:text-[#1A2E22]/40 shadow-xs"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {BUILDER_TITLES.map((t) => {
                          const isSelected = title.trim().toUpperCase() === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTitle(t)}
                              className={`px-2 py-1 rounded-full text-[9px] font-black border-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#FF007A] text-white border-[#FF007A] shadow-sm'
                                  : 'bg-white/60 text-[#1A2E22] border-[#1A2E22]/15 hover:border-[#FF007A]/50 hover:bg-white'
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="text-[11px] font-black text-[#0B6B3A] uppercase tracking-wider block mb-1">
                        SKILL TRACKS
                      </label>
                      <StackSelector selected={stack} onChange={(s) => setStack(s)} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: CUSTOMIZE (PALETTES · BACKGROUND · FRAMES) */}
              {activeTab === 'customize' && (
                <motion.div
                  key="customize"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.12 }}
                  className="space-y-3"
                >
                  {/* 03 / COLOR PRESETS */}
                  <div>
                    <div className="flex items-center justify-between border-b border-[#1A2E22]/10 pb-1.5">
                      <span className="font-bold text-[11px] text-[#FF007A] uppercase flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> 03 / COLOR PRESETS
                      </span>
                      <span className="text-[9px] text-[#1A2E22]/50 font-bold">4 GRADES</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {(['RAW', 'VIVID', 'DARK', 'WARM'] as const).map((p) => {
                        const isSelected = (photoSettings.preset || 'RAW') === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPhotoSettings({ ...photoSettings, preset: p })}
                            className={`py-2 px-2 rounded-xl text-center transition-all cursor-pointer border-2 font-black text-[10px] font-mono ${
                              isSelected
                                ? 'bg-white border-[#FF007A] shadow-sm ring-2 ring-[#FF007A] text-[#FF007A]'
                                : 'bg-white/60 hover:bg-white border-[#1A2E22]/15 text-[#1A2E22]/70'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 04 / CARD PALETTES */}
                  <div>
                    <div className="flex items-center justify-between border-b border-[#1A2E22]/10 pb-1.5">
                      <span className="font-bold text-[11px] text-[#0B6B3A] uppercase flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5" /> 04 / CARD PALETTES
                      </span>
                      <span className="text-[9px] text-[#1A2E22]/50 font-bold">4 THEMES</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {THEME_OPTIONS.map((t) => {
                        const isSelected = (photoSettings.cardTheme || 'TROPICAL') === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setPhotoSettings({ ...photoSettings, cardTheme: t.id })}
                            className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border-2 relative ${
                              isSelected
                                ? 'bg-white border-[#0B6B3A] shadow-sm ring-2 ring-[#0B6B3A]'
                                : 'bg-white/60 hover:bg-white border-[#1A2E22]/15'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-black text-[#1A2E22]">{t.label}</span>
                              <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded-full font-black ${
                                isSelected ? 'bg-[#0B6B3A] text-white' : 'bg-[#1A2E22]/10 text-[#1A2E22]/70'
                              }`}>
                                {t.tag}
                              </span>
                            </div>
                            <div className={`h-1.5 rounded-full bg-gradient-to-r ${t.gradient} mb-1 shadow-2xs`} />
                            <p className="text-[9px] text-[#1A2E22]/70 leading-tight font-bold">{t.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 05 / CARD BACKGROUND */}
                  <div>
                    <div className="flex items-center justify-between border-b border-[#1A2E22]/10 pb-1.5">
                      <span className="font-bold text-[11px] text-[#2EC4B6] uppercase flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" /> 05 / CARD BACKGROUND
                      </span>
                      <span className="text-[9px] text-[#1A2E22]/50 font-bold">4 BACKDROPS</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {BACKGROUND_OPTIONS.map((b) => {
                        const isSelected = (photoSettings.cardBackground || 'NIGHT') === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setPhotoSettings({ ...photoSettings, cardBackground: b.id });
                            }}
                            className={`p-2 rounded-xl text-left transition-all cursor-pointer border-2 flex flex-col items-center gap-1 ${
                              isSelected
                                ? 'bg-white border-[#2EC4B6] shadow-sm ring-2 ring-[#2EC4B6]'
                                : 'bg-white/60 hover:bg-white border-[#1A2E22]/15'
                            }`}
                          >
                            <span className="text-lg shrink-0">{b.icon}</span>
                            <span className="text-[9px] font-black text-[#1A2E22] text-center leading-tight">{b.label}</span>
                            <span className="text-[8px] text-[#1A2E22]/60 font-bold text-center leading-tight">{b.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 06 / PROFILE FRAMES */}
                  <div>
                    <div className="flex items-center justify-between border-b border-[#1A2E22]/10 pb-1.5">
                      <span className="font-bold text-[11px] text-[#FF007A] uppercase flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" /> 06 / PROFILE FRAMES
                      </span>
                      <span className="text-[9px] text-[#1A2E22]/50 font-bold">4 OVERLAYS</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {FRAME_OPTIONS.map((f) => {
                        const isSelected = (photoSettings.frameStyle || 'WREATH') === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              setPhotoSettings({ ...photoSettings, frameStyle: f.id });
                            }}
                            className={`p-2 rounded-xl text-left transition-all cursor-pointer border-2 flex items-center gap-2 ${
                              isSelected
                                ? 'bg-white border-[#FF007A] shadow-sm ring-2 ring-[#FF007A]'
                                : 'bg-white/60 hover:bg-white border-[#1A2E22]/15'
                            }`}
                          >
                            <span className="text-lg shrink-0">{f.icon}</span>
                            <div className="min-w-0">
                              <div className="text-[10px] font-black text-[#1A2E22] truncate">{f.label}</div>
                              <div className="text-[8px] text-[#1A2E22]/60 font-bold truncate">{f.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: MINT & CLAIM */}
              {activeTab === 'mint' && (
                <motion.div
                  key="mint"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.12 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#1A2E22]/10 pb-1.5">
                    <span className="font-bold text-[11px] text-[#FF007A] uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> 07 / MINT & CLAIM
                    </span>
                    <span className="text-[9px] text-[#1A2E22]/50 font-bold">VERIFIED BADGE</span>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-white rounded-xl p-3 border-2 border-[#1A2E22]/15 space-y-1.5 text-[11px] text-[#1A2E22]">
                    <div className="flex justify-between border-b border-[#1A2E22]/10 pb-1">
                      <span className="font-bold text-[#1A2E22]/50">BUILDER NAME</span>
                      <span className="font-black">{name.trim() || 'BUILDER'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1A2E22]/10 pb-1">
                      <span className="font-bold text-[#1A2E22]/50">BUILDER TITLE</span>
                      <span className="font-black text-[#FF007A]">{title.trim().toUpperCase() || liveIdentity.title}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1A2E22]/10 pb-1">
                      <span className="font-bold text-[#1A2E22]/50">ACCESS CODE</span>
                      <span className="font-black text-[#0B6B3A]">{formatClaimCode(liveIdentity.claimCode)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-[#1A2E22]/50">THEME · FRAME · BG</span>
                      <span className="font-black text-[#FF007A]">
                        {photoSettings.cardTheme || 'TROPICAL'} · {photoSettings.frameStyle || 'WREATH'} · {photoSettings.cardBackground || 'NIGHT'}
                      </span>
                    </div>
                  </div>

                  {/* Auth Panel / User Status */}
                  {!user ? (
                    <AuthPanel
                      onAuthed={(u) => {
                        setUser(u);
                        setMintError(null);
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border-2 border-[#1A2E22]/15 text-xs shadow-2xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#1A2E22] truncate max-w-[70%]">
                        <ShieldCheck className="w-4 h-4 text-[#0B6B3A] shrink-0" />
                        <div className="truncate">
                          <div className="text-[8px] text-[#1A2E22]/50 font-bold uppercase">SIGNED IN AS</div>
                          <div className="font-black text-[#FF007A] text-[10px] truncate">{user.email || user.displayName || 'AUTHENTICATED'}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await signOut(getClientAuth());
                            setUser(null);
                          } catch (e) {
                            console.error('Logout error', e);
                          }
                        }}
                        className="flex items-center gap-1 font-bold text-[9px] text-[#FF007A] hover:text-[#1A2E22] transition-colors shrink-0 bg-[#FF007A]/10 px-2 py-1 rounded-lg cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" /> LOG OUT
                      </button>
                    </div>
                  )}

                  {user && hasExisting && (
                    <div className="bg-[#0B6B3A]/10 border-2 border-[#0B6B3A] rounded-xl p-2.5 flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold text-[#0B6B3A] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0B6B3A] shrink-0" /> ID already minted!
                      </p>
                      <Button variant="primary" size="sm" onClick={() => router.push(`/result?id=${user.uid}`)} className="pink-pill-btn shrink-0 text-[10px] py-1 px-2.5">
                        VIEW ID →
                      </Button>
                    </div>
                  )}

                  {mintError && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-[#FF007A] bg-[#FF007A]/10 border border-[#FF007A]/30 rounded-xl p-2">
                        {mintError}
                      </p>
                      <Button variant="primary" size="sm" onClick={handleGenerate} className="w-full pink-pill-btn text-[10px]">
                        <RefreshCw className="w-3 h-3" /> RETRY MINT
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Pinned Bottom Action Dock in the Inspector Deck */}
          <div className="shrink-0 bg-[#FAF4E5] border-t border-[#1A2E22]/10 p-2.5 sm:p-3 flex items-center justify-between gap-2 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0B6B3A]" />
              <span className="text-[10px] font-black text-[#0B6B3A]">{readiness}% READY</span>
            </div>

            <div className="flex items-center gap-1.5">
              {activeTab !== 'mint' ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNextTab}
                  className="pink-pill-btn px-4 py-2 text-xs font-black shadow-md cursor-pointer flex items-center gap-1"
                >
                  <span>NEXT</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              ) : !user ? (
                <Button variant="primary" size="md" disabled className="pink-pill-btn px-4 py-2 text-xs opacity-70 cursor-not-allowed">
                  <span>SIGN IN TO MINT →</span>
                </Button>
              ) : hasExisting ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push(`/result?id=${user.uid}`)}
                  className="pink-pill-btn px-4 py-2 text-xs cursor-pointer shadow-md"
                >
                  <span>VIEW ID →</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleGenerate}
                  disabled={minting || !name.trim()}
                  className="pink-pill-btn px-4 py-2 text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>MINT PASS →</span>
                </Button>
              )}
            </div>
          </div>

        </section>

      </div>

    </div>
  );
}
