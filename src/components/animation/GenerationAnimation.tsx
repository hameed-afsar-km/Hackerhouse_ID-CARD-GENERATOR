'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface GenerationAnimationProps {
  onComplete: () => void;
}

const MESSAGES = [
  'SETTING FRAME BOUNDS',
  'PROCESSING PHOTO',
  'ROLLING BUILDER TITLE',
  'CALCULATING BUILD STATS',
  'STAMPING BUILDER NUMBER',
  'PASS & FRAME READY!',
];

export const GenerationAnimation: React.FC<GenerationAnimationProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (currentStep < MESSAGES.length) {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, MESSAGES[currentStep]]);
        setCurrentStep((prev) => prev + 1);
      }, 260);

      return () => clearTimeout(timer);
    } else {
      const finalTimer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(finalTimer);
    }
  }, [currentStep, onComplete]);

  const done = currentStep >= MESSAGES.length;

  return (
    <div className="fixed inset-0 z-50 bg-cream/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg hh-card p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-pink/10 text-pink px-4 py-1.5 font-sans text-xs font-bold uppercase tracking-wider rounded-full">
            <Sparkles className="w-4 h-4" /> GENERATING BUILDER IDENTITY
          </div>
          <h2 className="font-display font-extrabold text-4xl text-ink tracking-tight uppercase">
            {done ? (
              <span>IDENTITY <span className="text-sea-green">READY</span></span>
            ) : (
              <span>STAMPING <span className="text-pink">PASS</span></span>
            )}
          </h2>
        </div>

        {/* Step list */}
        <div className="space-y-2">
          {MESSAGES.map((msg, idx) => {
            const shown = idx < logs.length;
            const isDoneLine = shown && msg === 'PASS & FRAME READY!';
            return (
              <div
                key={idx}
                className={`px-4 py-3 font-sans text-xs font-bold rounded-2xl transition-all flex items-center justify-between ${
                  isDoneLine
                    ? 'bg-sea-green text-white shadow-xs'
                    : shown
                    ? 'bg-primary-green/10 text-primary-green'
                    : 'bg-cream/40 text-ink/30'
                }`}
              >
                <span>{msg}</span>
                {shown && <CheckCircle2 className="w-4 h-4 text-sea-green inline" />}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="space-y-2 font-sans text-xs font-bold">
          <div className="flex justify-between text-ink/60">
            <span>COMPLETION</span>
            <span>{Math.min(100, Math.round((currentStep / MESSAGES.length) * 100))}%</span>
          </div>
          <div className="w-full h-3 bg-cream rounded-full overflow-hidden">
            <div
              className="h-full bg-pink transition-all duration-200"
              style={{ width: `${(currentStep / MESSAGES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
