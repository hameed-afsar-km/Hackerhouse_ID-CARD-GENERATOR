import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  variant?: 'green' | 'cyan' | 'yellow' | 'pink' | 'outline' | 'dark';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'green', children, className }) => {
  const base = 'inline-flex items-center font-mono text-xs font-bold px-2.5 py-1 tracking-widest uppercase border';

  const variants = {
    green: 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/40',
    cyan: 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/40',
    yellow: 'bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/40',
    pink: 'bg-[#FF2E63]/10 text-[#FF2E63] border-[#FF2E63]/40',
    outline: 'bg-transparent text-zinc-300 border-zinc-700',
    dark: 'bg-zinc-900 text-zinc-400 border-zinc-800',
  };

  return <span className={twMerge(clsx(base, variants[variant], className))}>{children}</span>;
};
