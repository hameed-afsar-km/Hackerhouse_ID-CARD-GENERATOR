'use client';

import React from 'react';
import { StackCategory } from '@/types/dna';
import { Check } from 'lucide-react';

interface StackSelectorProps {
  selected: StackCategory[];
  onChange: (selected: StackCategory[]) => void;
}

const STACK_OPTIONS: Array<{ category: StackCategory; desc: string }> = [
  { category: 'AI', desc: 'LLMs, Neural Networks, PyTorch' },
  { category: 'FULL STACK', desc: 'Next.js, Node, PostgreSQL' },
  { category: 'FRONTEND', desc: 'React, Canvas, WebGL, CSS' },
  { category: 'BACKEND', desc: 'Go, Rust, Microservices' },
  { category: 'ROBOTICS', desc: 'ROS, Embedded Systems, Mechatronics' },
  { category: 'HARDWARE', desc: 'ESP32, PCB Design, Arduino' },
  { category: 'DESIGN', desc: 'UI/UX, Visual Art, Typography' },
  { category: 'DATA', desc: 'Spark, Pipelines, Analytics' },
  { category: 'CYBERSECURITY', desc: 'Reverse Engineering, Auth, Security' },
  { category: 'CLOUD', desc: 'Kubernetes, AWS, Infrastructure' },
  { category: 'CRYPTO', desc: 'Solidity, ZK, Web3 Protocols' },
  { category: 'PRODUCT', desc: 'PM, Growth, Systems Design' },
  { category: 'OTHER', desc: 'Polymath / Niche Technologies' },
];

export const StackSelector: React.FC<StackSelectorProps> = ({ selected, onChange }) => {
  const toggleCategory = (category: StackCategory) => {
    if (selected.includes(category)) {
      if (selected.length === 1) return; // Require at least 1 stack selection
      onChange(selected.filter((s) => s !== category));
    } else {
      if (selected.length >= 4) {
        alert('You can select up to 4 primary stack categories.');
        return;
      }
      onChange([...selected, category]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
        <span>SELECT YOUR PRIMARY STACK (1 TO 4)</span>
        <span className="text-[#00FF66] font-bold">
          {selected.length} / 4 SELECTED
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STACK_OPTIONS.map((item) => {
          const isSelected = selected.includes(item.category);
          return (
            <button
              key={item.category}
              type="button"
              onClick={() => toggleCategory(item.category)}
              className={`p-4 text-left font-mono transition-all border relative flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'bg-[#00FF66]/10 border-[#00FF66] text-white shadow-[2px_2px_0px_0px_#00FF66]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-sm font-extrabold tracking-wider ${isSelected ? 'text-[#00FF66]' : 'text-white'}`}>
                  {item.category}
                </span>
                {isSelected && (
                  <div className="w-5 h-5 bg-[#00FF66] text-black flex items-center justify-center rounded-none">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 line-clamp-1 group-hover:text-zinc-400">
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
