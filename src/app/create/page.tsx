'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { ArrowRight, ArrowLeft, Check, User, Code, Eye, Sparkles, AtSign, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PhotoUploader } from '@/components/creation/PhotoUploader';
import { StackSelector } from '@/components/creation/StackSelector';
import { GenerationAnimation } from '@/components/animation/GenerationAnimation';
import { AuthPanel } from '@/components/auth/AuthPanel';
import { BuilderInput, StackCategory, PhotoFilterSettings, BuilderIdentity } from '@/types/builder';
import { createBuilderIdentity, formatClaimCode } from '@/lib/builder-engine';
import { createSampleAvatarSvg } from '@/lib/demo-builders';
import { uploadBuilderPhoto } from '@/lib/photo-upload';
import { getClientAuth } from '@/lib/firebase/client';
import { BuilderCardCanvas } from '@/components/canvas/BuilderCardCanvas';

const STEP_LABELS = ['PHOTO', 'DETAILS', 'GENERATE'];

export default function CreatePage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [minting, setMinting] = useState<boolean>(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [hasExisting, setHasExisting] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [xUsername, setXUsername] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [stack, setStack] = useState<StackCategory[]>(['AI', 'FULL STACK']);
  const [photoSettings, setPhotoSettings] = useState<PhotoFilterSettings>({
    zoom: 1,
    panX: 0,
    panY: 0,
    preset: 'RAW',
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
    };
    return createBuilderIdentity(input);
  }, [name, photoUrl, stack, xUsername, photoSettings]);

  const nextStep = () => {
    if (step === 1 && !photoUrl) {
      setPhotoUrl(createSampleAvatarSvg(name || 'Anonymous Builder', '#0B6B3A'));
    }
    if (step === 2 && !name.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep > 2 && !name.trim()) {
      alert('Please enter your name first.');
      setStep(2);
      return;
    }
    setStep(targetStep);
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
      alert('Please enter your name.');
      setStep(2);
      return;
    }
    if (!user) {
      alert('Sign in to mint your Builder ID.');
      return;
    }
    setMintError(null);
    setIsGenerating(true);
  };

  // Promise helper that fails loudly instead of hanging forever, so the
  // generation overlay never stays stuck on "IDENTITY READY".
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
      };
      const identity = createBuilderIdentity(input);
      identity.id = user.uid;

      // 4. Claim it server-side in an atomic transaction (409 = already claimed)
      const controller = new AbortController();
      const claimTimer = setTimeout(() => controller.abort(), 20000);
      const res = await withTimeout(
        fetch('/api/builders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, identity }),
          signal: controller.signal,
        }),
        20000,
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
  }, [user, name, photoUrl, stack, xUsername, photoSettings, router]);

  return (
    <div className="relative min-h-screen bg-[#0B6B3A] text-[#FBF6E9] py-10 px-4 sm:px-6 lg:px-8">
      {isGenerating && <GenerationAnimation onComplete={handleAnimationComplete} />}

      <main className="max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="font-mono text-xs font-bold text-[#FFE600] uppercase tracking-wider mb-1">
              HH GOA 2026 · BUILDER ID & FRAME GENERATOR
            </div>
            <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-white uppercase">
              BUILD YOUR ID<span className="text-[#FF007A]">.</span>
            </h1>
          </div>
          <div className="bg-[#FF007A] text-white font-mono text-xs font-bold px-4 py-2 rounded-full shadow-md">
            STEP 0{step} OF 03
          </div>
        </div>

        {/* Progress Pins */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {STEP_LABELS.map((label, idx) => {
            const n = idx + 1;
            const done = n < step;
            const active = n === step;
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleStepClick(n)}
                className={`p-3 rounded-2xl text-center font-mono transition-all border cursor-pointer ${
                  active
                    ? 'bg-[#FF007A] text-white border-white shadow-md'
                    : done
                    ? 'bg-[#FFE600] text-[#1A2E22] border-transparent font-bold'
                    : 'bg-[#FBF6E9]/10 text-white/60 border-white/10 hover:bg-[#FBF6E9]/20'
                }`}
              >
                <div className="text-xs font-bold">
                  {done ? <Check className="w-4 h-4 mx-auto stroke-[3]" /> : `0${n}`}
                </div>
                <div className="text-xs font-extrabold tracking-wider truncate mt-0.5">{label}</div>
              </button>
            );
          })}
        </div>

        {/* Main Grid: Form + Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Paper Notice Card (7 cols) */}
          <div className="lg:col-span-6 pinned-card pin-top-pink p-6 sm:p-10 space-y-8 shadow-2xl">
            {/* STEP 1 — PHOTO */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="font-mono text-xs font-bold text-[#FF007A] uppercase tracking-wider">STEP 01</div>
                  <h2 className="font-display font-extrabold text-3xl text-[#1A2E22] tracking-tight flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#FF007A] text-white flex items-center justify-center shadow-md">
                      <User className="w-5 h-5" />
                    </span>
                    Upload Your Photo
                  </h2>
                  <p className="font-mono text-xs text-[#1A2E22]/70 font-bold">
                    Upload a photo of yourself. Landscape, portrait, square or smartphone photos work automatically.
                  </p>
                </div>

                <PhotoUploader
                  photoUrl={photoUrl}
                  settings={photoSettings}
                  onPhotoChange={(url) => setPhotoUrl(url)}
                  onSettingsChange={(st) => setPhotoSettings(st)}
                />
              </div>
            )}

            {/* STEP 2 — DETAILS */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="font-mono text-xs font-bold text-[#FF007A] uppercase tracking-wider">STEP 02</div>
                  <h2 className="font-display font-extrabold text-3xl text-[#1A2E22] tracking-tight flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#0B6B3A] text-white flex items-center justify-center shadow-md">
                      <Code className="w-5 h-5" />
                    </span>
                    Your Details
                  </h2>
                  <p className="font-mono text-xs text-[#1A2E22]/70 font-bold">
                    The name that gets printed big and bold on your official card, plus your stack.
                  </p>
                </div>

                <div className="space-y-2 font-mono">
                  <label className="text-xs font-bold text-[#0B6B3A] uppercase tracking-wider block">
                    BUILDER NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mohammed Aadil"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FBF6E9] border-2 border-[#1A2E22]/20 focus:border-[#FF007A] text-[#1A2E22] px-5 py-4 font-mono text-lg font-bold rounded-2xl outline-none transition-all placeholder:text-[#1A2E22]/40"
                    autoFocus
                  />
                </div>

                <div className="space-y-2 font-mono">
                  <label className="text-xs font-bold text-[#0B6B3A] uppercase tracking-wider block">
                    X USERNAME <span className="text-[#1A2E22]/40">(OPTIONAL)</span>
                  </label>
                  <div className="relative">
                    <AtSign className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#1A2E22]/40" />
                    <input
                      type="text"
                      placeholder="e.g. aadil"
                      value={xUsername}
                      onChange={(e) => setXUsername(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && name.trim()) nextStep();
                      }}
                      className="w-full bg-[#FBF6E9] border-2 border-[#1A2E22]/20 focus:border-[#FF007A] text-[#1A2E22] px-12 py-4 font-mono text-lg font-bold rounded-2xl outline-none transition-all placeholder:text-[#1A2E22]/40"
                    />
                  </div>
                </div>

                <StackSelector selected={stack} onChange={(s) => setStack(s)} />
              </div>
            )}

            {/* STEP 3 — GENERATE */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="font-mono text-xs font-bold text-[#FF007A] uppercase tracking-wider">STEP 03</div>
                  <h2 className="font-display font-extrabold text-3xl text-[#1A2E22] tracking-tight flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#FFE600] text-[#1A2E22] flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    Ready To Generate?
                  </h2>
                  <p className="font-mono text-xs text-[#1A2E22]/70 font-bold">
                    Your Builder ID card, profile frame, title and stats are rolled in seconds.
                  </p>
                </div>

                <div className="hh-card p-5 font-mono text-sm text-[#1A2E22] space-y-3">
                  <div className="flex justify-between border-b border-[#1A2E22]/10 pb-2">
                    <span className="font-bold text-[#1A2E22]/50">NAME</span>
                    <span className="font-extrabold">{name.trim()}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1A2E22]/10 pb-2">
                    <span className="font-bold text-[#1A2E22]/50">X</span>
                    <span className="font-extrabold">{xUsername.trim() ? `@${xUsername.trim().replace(/^@/, '')}` : '—'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1A2E22]/10 pb-2">
                    <span className="font-bold text-[#1A2E22]/50">STACK</span>
                    <span className="font-extrabold text-right">{stack.join(' · ')}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1A2E22]/10 pb-2">
                    <span className="font-bold text-[#1A2E22]/50">ACCESS CODE</span>
                    <span className="font-extrabold tracking-wider">{formatClaimCode(liveIdentity.claimCode)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-[#1A2E22]/50">PHOTO</span>
                    <span className="font-extrabold">{photoUrl ? 'UPLOADED' : 'AUTO AVATAR'}</span>
                  </div>
                </div>

                {!user && (
                  <AuthPanel
                    onAuthed={(u) => {
                      setUser(u);
                      setMintError(null);
                    }}
                  />
                )}

                {user && hasExisting && (
                  <div className="bg-[#0B6B3A]/10 border-2 border-[#0B6B3A] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="font-mono text-sm font-bold text-[#0B6B3A] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#FF007A]" /> YOU ALREADY MINTED YOUR ID
                    </p>
                    <Button variant="primary" size="md" onClick={() => router.push(`/result?id=${user.uid}`)} className="pink-pill-btn shrink-0">
                      VIEW MY ID →
                    </Button>
                  </div>
                )}

                {mintError && (
                  <div className="space-y-3">
                    <p className="font-mono text-sm font-bold text-[#FF007A] bg-[#FF007A]/10 border border-[#FF007A]/30 rounded-2xl p-4">
                      {mintError}
                    </p>
                    <Button variant="primary" size="lg" onClick={handleGenerate} className="w-full pink-pill-btn">
                      <RefreshCw className="w-4 h-4" /> RETRY GENERATION
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step Nav controls */}
            <div className="pt-6 border-t border-[#1A2E22]/10 flex items-center justify-between gap-4 mt-6 font-mono">
              {step > 1 ? (
                <Button variant="outline" size="lg" onClick={prevStep} className="border-2 border-[#1A2E22] text-[#1A2E22] rounded-full">
                  <ArrowLeft className="w-4 h-4" /> BACK
                </Button>
              ) : (
                <div className="hidden sm:block" />
              )}

              {step < 3 ? (
                <Button variant="primary" size="lg" onClick={nextStep} className="pink-pill-btn">
                  NEXT STEP <ArrowRight className="w-4 h-4" />
                </Button>
              ) : !user ? (
                <Button variant="primary" size="xl" disabled className="pink-pill-btn px-8">
                  <Sparkles className="w-5 h-5" /> SIGN IN TO GENERATE →
                </Button>
              ) : hasExisting ? (
                <Button variant="primary" size="xl" onClick={() => router.push(`/result?id=${user.uid}`)} className="pink-pill-btn px-8">
                  <ShieldCheck className="w-5 h-5" /> VIEW MY ID →
                </Button>
              ) : (
                <Button variant="primary" size="xl" onClick={handleGenerate} className="pink-pill-btn px-8" disabled={minting}>
                  <Sparkles className="w-5 h-5" /> GENERATE MY ID →
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: Live Preview Card (5 cols) */}
          <div className="lg:col-span-6 pinned-card pin-top-yellow p-4 sm:p-5 space-y-3 shadow-2xl sticky top-16 -mt-2">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#1A2E22] border-b border-[#1A2E22]/10 pb-2.5">
              <span className="flex items-center gap-2 text-[#FF007A]">
                <Eye className="w-4 h-4" /> LIVE CARD PREVIEW
              </span>
              <span className="bg-[#FF007A] text-white px-2.5 py-0.5 rounded-full text-[10px]">
                UPDATES LIVE
              </span>
            </div>

            {/* Real-time updating Card Canvas */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-[#1A2E22]/20 max-w-[420px] mx-auto">
              <BuilderCardCanvas builder={liveIdentity} />
            </div>

            <div className="font-mono text-[10px] text-[#1A2E22]/70 text-center font-bold">
              Pass & Profile Frame generated automatically.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
