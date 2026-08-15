import React from 'react';

export const GoaBadge = ({
  size = 'sm',
  tilt = false,
  className = '',
}: {
  size?: 'sm' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  tilt?: boolean;
  className?: string;
}) => {
  const sizes = {
    sm:   { goa: 'text-lg',              stroke: '2px' },
    lg:   { goa: 'text-4xl',             stroke: '3px' },
    xl:   { goa: 'text-6xl',             stroke: '4px' },
    '2xl':{ goa: 'text-7xl',             stroke: '5px' },
    '3xl':{ goa: 'text-9xl',             stroke: '7px' },
    '4xl':{ goa: 'text-[10rem]',         stroke: '8px' },
  } as const;
  const s = sizes[size];

  return (
    <span
      className={`inline-flex items-center justify-center text-center leading-none ${
        tilt ? 'rotate-3' : ''
      } ${className}`}
    >
      <span
        className="text-[#FF007A] font-devanagari font-black leading-none"
        style={{ WebkitTextStroke: `${s.stroke} #FFE600`, paintOrder: 'stroke fill' }}
      >
        गोवा
      </span>
    </span>
  );
};
