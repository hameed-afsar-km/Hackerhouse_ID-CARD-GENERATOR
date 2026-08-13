'use client';

import React from 'react';
import { StackCategory } from '@/types/builder';
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
      if (selected.length === 1) return;
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
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-[#1A2E22]/70 uppercase tracking-wider">SELECT YOUR PRIMARY STACK (1 TO 4)</span>
        <span className="bg-[#FF007A] text-white px-3 py-1 rounded-full text-xs font-bold">
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
              className={`p-4 text-left rounded-2xl transition-all border flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#FF007A] text-white border-[#FF007A] shadow-md'
                  : 'bg-white text-[#1A2E22] border-[#1A2E22]/15 hover:border-[#FF007A]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-extrabold tracking-tight">{item.category}</span>
                {isSelected && (
                  <div className="w-5 h-5 bg-[#FFE600] text-[#1A2E22] flex items-center justify-center rounded-full">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-bold line-clamp-1 ${isSelected ? 'text-white/80' : 'text-[#1A2E22]/60'}`}>
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
