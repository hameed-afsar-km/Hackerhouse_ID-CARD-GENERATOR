'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dna, Radio, Users, Sparkles, Menu, X } from 'lucide-react';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: 'BUILD DNA', href: '/create', icon: Dna },
    { name: 'BUILDER RADAR', href: '/radar', icon: Radio },
    { name: 'TEAM DNA', href: '/team', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#050506]/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-[#00FF66] text-black font-mono font-extrabold flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_#FFFFFF] group-hover:scale-105 transition-transform">
            DNA
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-extrabold text-base tracking-widest text-white flex items-center gap-2">
              BUILD DNA
              <span className="inline-block w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
            </span>
            <span className="font-mono text-[10px] text-zinc-400 tracking-wider">
              HH GOA 2026
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors py-1 border-b-2 ${
                  active
                    ? 'text-[#00FF66] border-[#00FF66]'
                    : 'text-zinc-400 border-transparent hover:text-white hover:border-zinc-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Event badge */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="font-mono text-[11px] text-zinc-400 border border-zinc-800 px-3 py-1 bg-zinc-950/80">
            <span className="text-white font-semibold">GOA, INDIA</span> · 28—31 OCT
          </div>
          <Link href="/create">
            <Button size="sm" variant="primary">
              <Sparkles className="w-3.5 h-3.5" />
              BUILD ID
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-zinc-400 hover:text-white p-2 focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-4 pb-6 flex flex-col gap-4">
          <div className="font-mono text-xs text-zinc-400 border-b border-zinc-800 pb-3 flex items-center justify-between">
            <span>HACKER HOUSE GOA 2026</span>
            <span className="text-[#00FF66] font-bold">28—31 OCT 2026</span>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`font-mono text-sm font-bold uppercase tracking-widest flex items-center gap-3 p-2.5 rounded border ${
                  active
                    ? 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/40'
                    : 'text-zinc-300 border-zinc-900 hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-5 h-5 text-[#00FF66]" />
                {link.name}
              </Link>
            );
          })}

          <div className="pt-2">
            <Link href="/create" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="lg" className="w-full">
                START BUILDING →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
