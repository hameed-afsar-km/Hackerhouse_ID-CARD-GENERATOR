'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ArrowLeft, Check, Terminal, User, Code, Flame, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PhotoUploader } from '@/components/creation/PhotoUploader';
import { StackSelector } from '@/components/creation/StackSelector';
import { BuildModeSelector } from '@/components/creation/BuildModeSelector';
import { EnergySelector } from '@/components/creation/EnergySelector';
import { GenerationAnimation } from '@/components/animation/GenerationAnimation';
import { BuilderInput, StackCategory, BuildMode, BuildEnergy, PhotoFilterSettings } from '@/types/dna';
import { createBuilderIdentity } from '@/lib/dna-engine';
import { createSampleAvatarSvg } from '@/lib/demo-builders';

export default function CreatePage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [stack, setStack] = useState<StackCategory[]>(['AI', 'FULL STACK']);
  const [buildMode, setBuildMode] = useState<BuildMode>('SHIP');
  const [buildEnergy, setBuildEnergy] = useState<BuildEnergy>('EXPERIMENTAL');
  const [photoSettings, setPhotoSettings] = useState<PhotoFilterSettings>({
    zoom: 1,
    panX: 0,
    panY: 0,
    preset: 'RAW',
  });

  const nextStep = () => {
    if (step === 1 && !photoUrl) {
      // Auto-fallback default avatar if user skips uploading photo
      setPhotoUrl(createSampleAvatarSvg(name || 'Anonymous Builder', '#00FF66'));
    }
    if (step === 2 && !name.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGenerate = () => {
    if (!name.trim()) {
      alert('Please enter your name.');
      setStep(2);
      return;
    }
    setIsGenerating(true);
  };

  const handleAnimationComplete = () => {
    const input: BuilderInput = {
      name: name.trim(),
      photoUrl: photoUrl || createSampleAvatarSvg(name || 'Builder', '#00FF66'),
      stack,
      buildMode,
      buildEnergy,
      photoSettings,
    };

    const identity = createBuilderIdentity(input);

    // Save to localStorage for local persistence
    try {
      localStorage.setItem(`builder_${identity.id}`, JSON.stringify(identity));
      localStorage.setItem('latest_builder', JSON.stringify(identity));

      // Append to local custom radar list
      const savedRadar = localStorage.getItem('custom_builders');
      const customList = savedRadar ? JSON.parse(savedRadar) : [];
      customList.unshift(identity);
      localStorage.setItem('custom_builders', JSON.stringify(customList));
    } catch (e) {
      console.warn('LocalStorage unavailable', e);
    }

    router.push(`/result?id=${identity.id}`);
  };

  return (
    <div className="relative min-h-screen bg-[#050506] text-white flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {isGenerating && <GenerationAnimation onComplete={handleAnimationComplete} />}

      <main className="max-w-3xl mx-auto w-full space-y-8">
        {/* Step Indicator Header */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 flex items-center justify-between font-mono text-xs shadow-[4px_4px_0px_0px_#00FF66]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-[#00FF66] inline-block" />
            <span className="font-extrabold text-white">STEP 0{step} OF 05</span>
          </div>
          <span className="text-zinc-400 font-bold uppercase">
            {step === 1 && 'STEP 01 — YOUR PHOTO'}
            {step === 2 && 'STEP 02 — YOUR NAME'}
            {step === 3 && 'STEP 03 — YOUR STACK'}
            {step === 4 && 'STEP 04 — YOUR BUILD MODE'}
            {step === 5 && 'STEP 05 — YOUR ENERGY'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-900 overflow-hidden">
          <div
            className="h-full bg-[#00FF66] transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Step Contents Card */}
        <div className="bg-zinc-950 border-2 border-zinc-800 p-6 sm:p-10 space-y-8">
          {/* STEP 1: YOU (PHOTO) */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-mono text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider flex items-center gap-3">
                  <User className="w-7 h-7 text-[#00FF66]" />
                  STEP 01 — UPLOAD YOUR PHOTO
                </h2>
                <p className="font-mono text-xs text-zinc-400">
                  Upload a photo of yourself. Landscape, portrait, square, or smartphone photos work automatically.
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

          {/* STEP 2: YOUR NAME */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-mono text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider flex items-center gap-3">
                  <Terminal className="w-7 h-7 text-[#00FF66]" />
                  STEP 02 — ENTER YOUR NAME
                </h2>
                <p className="font-mono text-xs text-zinc-400">
                  What name should appear on your official Hacker House Goa 2026 identity card?
                </p>
              </div>

              <div className="space-y-2 font-mono">
                <label className="text-xs text-zinc-400 font-bold block uppercase">
                  BUILDER NAME / HANDLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mohammed Aadil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && name.trim()) nextStep();
                  }}
                  className="w-full bg-black border-2 border-zinc-700 focus:border-[#00FF66] text-white px-5 py-4 font-mono text-lg font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,255,102,0.2)]"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* STEP 3: YOUR STACK */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-mono text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider flex items-center gap-3">
                  <Code className="w-7 h-7 text-[#00FF66]" />
                  STEP 03 — DEFINE YOUR STACK
                </h2>
                <p className="font-mono text-xs text-zinc-400">
                  Select your primary technical stacks. You can select 1 to 4 categories.
                </p>
              </div>

              <StackSelector selected={stack} onChange={(s) => setStack(s)} />
            </div>
          )}

          {/* STEP 4: YOUR BUILD MODE */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-mono text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider flex items-center gap-3">
                  <Zap className="w-7 h-7 text-[#00FF66]" />
                  STEP 04 — WHAT'S YOUR BUILD MODE?
                </h2>
                <p className="font-mono text-xs text-zinc-400">
                  Select your core builder instinct.
                </p>
              </div>

              <BuildModeSelector selected={buildMode} onChange={(m) => setBuildMode(m)} />
            </div>
          )}

          {/* STEP 5: YOUR ENERGY */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-mono text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider flex items-center gap-3">
                  <Flame className="w-7 h-7 text-[#00FF66]" />
                  STEP 05 — WHAT'S YOUR BUILD ENERGY?
                </h2>
                <p className="font-mono text-xs text-zinc-400">
                  Select your builder frequency.
                </p>
              </div>

              <EnergySelector selected={buildEnergy} onChange={(e) => setBuildEnergy(e)} />
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-zinc-900 flex items-center justify-between gap-4">
            {step > 1 ? (
              <Button variant="outline" size="lg" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4" /> BACK
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button variant="primary" size="lg" onClick={nextStep}>
                NEXT STEP <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="primary" size="xl" onClick={handleGenerate}>
                <Sparkles className="w-5 h-5" /> GENERATE DNA →
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
