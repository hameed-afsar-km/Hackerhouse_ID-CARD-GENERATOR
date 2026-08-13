'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, LayoutGrid, Users, Info, Sparkles, Menu, X, Search } from 'lucide-react';
import { Button } from './Button';
import { GoaBadge } from './GoaBadge';

const NAV_LINKS = [
  { name: 'CREATE ID', href: '/create', icon: Layers },
  { name: 'FIND', href: '/scan', icon: Search },
  { name: 'GALLERY', href: '/gallery', icon: LayoutGrid },
  { name: 'TEAM FRAME', href: '/team-frame', icon: Users },
  { name: 'ABOUT', href: '/about', icon: Info },
];

const TICKER = ['28 – 31 OCT 2026', 'GOA, INDIA', '#FRAMEINGOA', 'BUILD YOUR ID', 'HH GOA 2026'];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement ticker */}
      <div className="bg-[#FFE600] text-[#1A2E22] overflow-hidden py-1.5 border-b border-black/10">
        <div className="animate-hh-marquee flex whitespace-nowrap w-max font-mono text-[10px] font-extrabold tracking-[0.2em]">
          {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="px-6 inline-flex items-center gap-6">
              <span>{t}</span>
              <span className="text-[#FF007A]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main bar */}
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-[#0B6B3A]/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] border-b border-white/10'
            : 'bg-[#0B6B3A]/40 backdrop-blur-md border-b border-white/5'
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-16' : 'h-20'
          }`}
        >
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-2.5">
              <span className="font-display font-black text-xl sm:text-2xl tracking-tighter leading-none text-[#FFE600]">
                HACKER HOUSE
              </span>
              <GoaBadge size="sm" className="group-hover:scale-105 transition-transform" />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-center gap-1.5 px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider rounded-full transition-colors duration-200 ${
                    active ? 'text-[#FFE600]' : 'text-[#FBF6E9]/75 hover:text-[#FBF6E9]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? 'text-[#FF007A]' : 'text-[#FBF6E9]/60 group-hover:text-[#FFE600]'
                    }`}
                  />
                  {link.name}
                  <span
                    className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 rounded-full bg-[#FF007A] transition-all duration-300 ${
                      active ? 'w-5 opacity-100' : 'w-0 opacity-0 group-hover:w-3 group-hover:opacity-60'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right CTA */}
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/create" className="group">
              <Button size="sm" variant="primary" className="pink-pill-btn">
                <Sparkles className="w-3.5 h-3.5" />
                BUILD ID
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[#FBF6E9] hover:text-[#FF007A] p-2 focus:outline-none rounded-xl"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-[#0B6B3A]/95 backdrop-blur-xl flex flex-col transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between h-20 px-5">
          <span className="font-display font-black text-xl tracking-tighter text-[#FFE600] flex items-center gap-2.5">
            HACKER HOUSE
            <GoaBadge size="sm" />
          </span>
          <button onClick={() => setMobileOpen(false)} className="text-[#FBF6E9] hover:text-[#FF007A] p-2 rounded-xl" aria-label="Close menu">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-2 px-5 pt-4">
          {NAV_LINKS.map((link, idx) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{ transitionDelay: mobileOpen ? `${100 + idx * 50}ms` : '0ms' }}
                className={`font-mono text-sm font-bold uppercase tracking-wider flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
                  mobileOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
                } ${active ? 'bg-[#FF007A] text-white' : 'text-[#FBF6E9] hover:bg-white/10'}`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#FFE600]' : 'text-[#FFE600]/80'}`} />
                {link.name}
              </Link>
            );
          })}

          <div className="pt-6 px-1" style={{ transitionDelay: mobileOpen ? '400ms' : '0ms' }}>
            <Link href="/create" onClick={() => setMobileOpen(false)} className={`block transition-all duration-300 ${mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Button variant="primary" size="lg" className="w-full pink-pill-btn">
                START BUILDING →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
