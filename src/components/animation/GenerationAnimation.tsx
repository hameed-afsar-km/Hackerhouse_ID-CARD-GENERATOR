'use client';

import React, { useEffect, useState } from 'react';
import { Terminal, ShieldCheck } from 'lucide-react';

interface GenerationAnimationProps {
  onComplete: () => void;
}

const MESSAGES = [
  'DECODING BUILDER...',
  'READING STACK...',
  'READING BUILD MODE...',
  'GENERATING DNA SEED...',
  'ASSIGNING CLASS...',
  'ESTABLISHING SIGNAL...',
  'SIGNAL LOCKED.',
];

export const GenerationAnimation: React.FC<GenerationAnimationProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (currentStep < MESSAGES.length) {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, MESSAGES[currentStep]]);
        setCurrentStep((prev) => prev + 1);
      }, 240);

      return () => clearTimeout(timer);
    } else {
      const finalTimer = setTimeout(() => {
        onComplete();
      }, 400);
      return () => clearTimeout(finalTimer);
    }
  }, [currentStep, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#050506] flex items-center justify-center p-4">
      {/* Background scanline effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#00FF66_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-lg bg-zinc-950 border-2 border-[#00FF66] p-6 shadow-[8px_8px_0px_0px_#00FF66] relative space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 font-mono text-xs text-zinc-400">
          <span className="flex items-center gap-2 text-[#00FF66] font-bold">
            <Terminal className="w-4 h-4" />
            BUILD DNA ENGINE // HASHING
          </span>
          <span className="animate-pulse text-zinc-500">28—31 OCT 2026</span>
        </div>

        {/* Console Log Lines */}
        <div className="bg-black border border-zinc-900 p-4 font-mono text-sm space-y-2 h-56 overflow-y-auto">
          {logs.map((log, idx) => {
            const isLast = idx === logs.length - 1;
            const isDone = log === 'SIGNAL LOCKED.';
            return (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-zinc-600 text-xs">[{idx + 1}]</span>
                <span className={isDone ? 'text-[#00FF66] font-extrabold text-base' : 'text-zinc-300'}>
                  {log}
                </span>
                {isLast && !isDone && (
                  <span className="inline-block w-2 h-4 bg-[#00FF66] animate-ping ml-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>SYNTHESIZING MATRIX</span>
            <span className="text-[#00FF66] font-bold">
              {Math.min(100, Math.round((currentStep / MESSAGES.length) * 100))}%
            </span>
          </div>
          <div className="w-full h-3 bg-zinc-900 border border-zinc-800 p-0.5">
            <div
              className="h-full bg-[#00FF66] transition-all duration-200"
              style={{ width: `${(currentStep / MESSAGES.length) * 100}%` }}
            />
          </div>
        </div>

        {currentStep >= MESSAGES.length && (
          <div className="flex items-center justify-center gap-2 text-[#00FF66] font-mono text-xs font-bold uppercase tracking-widest pt-2">
            <ShieldCheck className="w-4 h-4" />
            BUILDER IDENTITY GENERATED
          </div>
        )}
      </div>
    </div>
  );
};
