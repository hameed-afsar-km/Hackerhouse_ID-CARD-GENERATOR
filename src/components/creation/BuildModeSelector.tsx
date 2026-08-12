'use client';

import React from 'react';
import { BuildMode } from '@/types/dna';
import { Rocket, Zap, Compass, Palette, Bot, Gauge } from 'lucide-react';

interface BuildModeSelectorProps {
  selected: BuildMode;
  onChange: (mode: BuildMode) => void;
}

const MODES: Array<{ mode: BuildMode; label: string; desc: string; icon: React.ElementType }> = [
  { mode: 'SHIP', label: 'SHIP', desc: 'Focus on shipping working code and launching products fast.', icon: Rocket },
  { mode: 'BREAK', label: 'BREAK', desc: 'Push systems to their limits and dissect how things work.', icon: Zap },
  { mode: 'EXPLORE', label: 'EXPLORE', desc: 'Experiment with novel tech, research, and deep rabbit holes.', icon: Compass },
  { mode: 'DESIGN', label: 'DESIGN', desc: 'Craft sleek, intuitive user experiences and aesthetic systems.', icon: Palette },
  { mode: 'AUTOMATE', label: 'AUTOMATE', desc: 'Build self-operating agents, pipelines, and workflows.', icon: Bot },
  { mode: 'SCALE', label: 'SCALE', desc: 'Engineer robust infrastructure for high concurrency.', icon: Gauge },
];

export const BuildModeSelector: React.FC<BuildModeSelectorProps> = ({ selected, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
        HOW DO YOU BUILD? (CHOOSE ONE PRIMARY INSTINCT)
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODES.map((item) => {
          const Icon = item.icon;
          const isSelected = selected === item.mode;
          return (
            <button
              key={item.mode}
              type="button"
              onClick={() => onChange(item.mode)}
              className={`p-5 text-left font-mono border transition-all flex items-start gap-4 cursor-pointer ${
                isSelected
                  ? 'bg-[#00FF66]/10 border-[#00FF66] text-white shadow-[3px_3px_0px_0px_#00FF66]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center border font-bold ${
                  isSelected
                    ? 'bg-[#00FF66] text-black border-[#00FF66]'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-base font-extrabold tracking-widest ${isSelected ? 'text-[#00FF66]' : 'text-white'}`}>
                    {item.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
