'use client';

import React from 'react';
import { BuildEnergy } from '@/types/dna';

interface EnergySelectorProps {
  selected: BuildEnergy;
  onChange: (energy: BuildEnergy) => void;
}

const ENERGIES: Array<{ energy: BuildEnergy; label: string; desc: string; color: string }> = [
  { energy: 'FAST', label: 'FAST', desc: 'High cadence, rapid iteration & quick feedback loops.', color: '#00FF66' },
  { energy: 'DEEP', label: 'DEEP', desc: 'High focus, deep research, and elegant architecture.', color: '#00E5FF' },
  { energy: 'WEIRD', label: 'WEIRD', desc: 'Unconventional hacks, wild ideas, and unexpected tech.', color: '#FFD600' },
  { energy: 'RELENTLESS', label: 'RELENTLESS', desc: 'Unstoppable drive, late nights, zero compromise.', color: '#FF2E63' },
  { energy: 'EXPERIMENTAL', label: 'EXPERIMENTAL', desc: 'Bleeding edge tools, constant risk-taking & trial.', color: '#A855F7' },
];

export const EnergySelector: React.FC<EnergySelectorProps> = ({ selected, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
        WHAT'S YOUR BUILD ENERGY? (SELECT ONE)
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {ENERGIES.map((item) => {
          const isSelected = selected === item.energy;
          return (
            <button
              key={item.energy}
              type="button"
              onClick={() => onChange(item.energy)}
              className={`p-4 text-center font-mono border transition-all flex flex-col justify-between items-center cursor-pointer ${
                isSelected
                  ? 'bg-zinc-900 border-[#00FF66] text-white shadow-[2px_2px_0px_0px_#00FF66]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full mb-3"
                style={{ backgroundColor: item.color }}
              />
              <span className={`text-sm font-extrabold tracking-widest ${isSelected ? 'text-[#00FF66]' : 'text-white'}`}>
                {item.label}
              </span>
              <p className="text-[10px] text-zinc-500 mt-2 line-clamp-2">
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
