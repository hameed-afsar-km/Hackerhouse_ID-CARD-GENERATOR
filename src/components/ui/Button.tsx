import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'danger' | 'ink';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider cursor-pointer rounded-full transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-[#FF007A] text-white hover:bg-[#E0006C] shadow-md hover:shadow-lg',
      secondary: 'bg-[#FFE600] text-[#1A2E22] hover:bg-[#E5CD00] shadow-md hover:shadow-lg',
      outline: 'bg-white/90 text-[#1A2E22] border border-[#1A2E22]/20 hover:bg-white shadow-xs',
      accent: 'bg-[#FFE600] text-[#1A2E22] hover:bg-[#E5CD00] shadow-md',
      danger: 'bg-[#FF007A] text-white hover:bg-[#E0006C] shadow-md',
      ink: 'bg-[#1A2E22] text-[#FFE600] hover:bg-black shadow-md',
    };

    const sizes = {
      sm: 'text-xs px-4 py-2 gap-1.5',
      md: 'text-xs px-6 py-2.5 gap-2',
      lg: 'text-xs px-8 py-3.5 gap-2.5 font-bold',
      xl: 'text-sm px-10 py-4 gap-3 font-bold',
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
