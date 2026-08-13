import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer
      className="relative border-t border-white/10 text-[#FBF6E9] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        backgroundImage: "url('/footer.jpeg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Palm Trees vector decoration */}
      <svg className="absolute bottom-0 -left-10 w-96 h-96 opacity-25 text-white pointer-events-none animate-hh-sway" viewBox="0 0 100 100" fill="currentColor">
        <path d="M45 100 Q50 60 40 20 L45 20 Q55 60 55 100 Z" />
        <path d="M42 25 Q20 30 10 50 Q25 45 42 25 Z" />
        <path d="M45 20 Q30 10 20 0 Q35 15 45 20 Z" />
        <path d="M48 22 Q60 5 80 10 Q65 20 48 22 Z" />
        <path d="M45 25 Q70 40 90 60 Q70 50 45 25 Z" />
      </svg>

      <svg className="absolute bottom-0 -right-10 w-96 h-96 opacity-25 text-white pointer-events-none animate-hh-sway" style={{ animationDelay: '1.5s' }} viewBox="0 0 100 100" fill="currentColor">
        <path d="M55 100 Q50 60 60 20 L55 20 Q45 60 45 100 Z" />
        <path d="M58 25 Q80 30 90 50 Q75 45 58 25 Z" />
        <path d="M55 20 Q70 10 80 0 Q65 15 55 20 Z" />
        <path d="M52 22 Q40 5 20 10 Q35 20 52 22 Z" />
      </svg>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Footer heading area — the HACKER HOUSE GOA branding lives in the footer.jpeg background */}
        <div className="text-center space-y-3">
          <div className="h-[150px] sm:h-[230px]" aria-hidden="true" />

          <div className="font-mono text-sm sm:text-base text-[#FFE600] font-bold tracking-widest pt-2">
            GOA, INDIA · 28 – 31 OCT 2026
          </div>
        </div>

        {/* Links & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto font-mono text-xs font-bold pt-6 border-t border-white/10">
          <div className="space-y-3 text-center md:text-left">
            <div className="text-[#FFE600] uppercase tracking-wider text-sm">Navigation</div>
            <ul className="space-y-2 text-[#FBF6E9]/90">
              <li>
                <Link href="/create" className="hover:text-[#FF007A] transition-colors">
                  CREATE YOUR ID →
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#FF007A] transition-colors">
                  BUILDER GALLERY
                </Link>
              </li>
              <li>
                <Link href="/team-frame" className="hover:text-[#FF007A] transition-colors">
                  TEAM FRAME COMBINER
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#FF007A] transition-colors">
                  ABOUT HH GOA
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3 text-center">
            <div className="text-[#FFE600] uppercase tracking-wider text-sm">Official Socials</div>
            <div className="space-y-2 text-[#FBF6E9]/90">
              <p>@247PMSTUDIO</p>
              <p>@TWOFOURTYSEVENPM</p>
              <p className="text-[#FFE600]">#FrameInGoa</p>
            </div>
          </div>

          <div className="space-y-3 text-center md:text-right">
            <div className="text-[#FFE600] uppercase tracking-wider text-sm">Event Info</div>
            <div className="space-y-2 text-[#FBF6E9]/90">
              <p>HACKER HOUSE GOA 2026</p>
              <p>FREE ACCOMMODATION & MEALS</p>
              <a href="https://hhgoa.com" target="_blank" rel="noreferrer" className="text-[#FF007A] hover:underline block">
                VISIT HHGOA.COM ↗
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#FBF6E9]/70 text-center">
          <div>© 2026 HH-GOA. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-4 text-[#FFE600]">
            <span>BRAND KIT</span>
            <span>·</span>
            <span>TERM & CONDITIONS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
