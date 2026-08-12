import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00FF66] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
      primary:
        'bg-[#00FF66] text-black hover:bg-[#00E5FF] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[6px_6px_0px_0px_#00FF66]',
      secondary:
        'bg-white text-black hover:bg-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,255,102,0.4)]',
      outline:
        'bg-transparent text-white border-2 border-zinc-700 hover:border-[#00FF66] hover:text-[#00FF66] shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]',
      accent:
        'bg-[#00E5FF] text-black hover:bg-[#00FF66] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]',
      danger:
        'bg-[#FF2E63] text-white hover:bg-red-600 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-5 py-2.5 gap-2',
      lg: 'text-base px-7 py-3.5 gap-3',
      xl: 'text-lg px-9 py-4 gap-4 text-base font-extrabold',
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
