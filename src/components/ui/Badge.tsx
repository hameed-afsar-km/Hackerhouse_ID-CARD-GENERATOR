import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  variant?: 'green' | 'cyan' | 'yellow' | 'pink' | 'outline' | 'dark';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'green', children, className }) => {
  const base = 'inline-flex items-center font-sans text-xs font-bold px-3 py-1 tracking-wider uppercase rounded-full shadow-xs border border-transparent';

  const variants = {
    green: 'bg-primary-green/10 text-primary-green border-primary-green/20',
    cyan: 'bg-sea-green/10 text-primary-green border-sea-green/20',
    yellow: 'bg-yellow text-ink border-yellow/40',
    pink: 'bg-pink/10 text-pink border-pink/20',
    outline: 'bg-white/80 text-ink border-primary-green/20',
    dark: 'bg-ink text-cream',
  };

  return <span className={twMerge(clsx(base, variants[variant], className))}>{children}</span>;
};
