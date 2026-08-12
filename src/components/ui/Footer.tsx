import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050506] border-t border-zinc-800 text-zinc-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Col */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00FF66] text-black font-mono font-extrabold flex items-center justify-center text-lg">
              DNA
            </div>
            <span className="font-mono font-extrabold text-lg text-white tracking-wider">
              BUILD DNA
            </span>
          </div>
          <p className="font-mono text-xs text-zinc-400 max-w-md leading-relaxed">
            A generative identity engine that turns a builder's photo, stack, and build personality into a unique Hacker House Goa 2026 Builder Identity.
          </p>
          <div className="font-mono text-xs font-bold text-[#00FF66] tracking-widest pt-2">
            LESS NOISE. MORE SIGNAL.
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            NAVIGATION
          </h4>
          <ul className="space-y-2 font-mono text-xs">
            <li>
              <Link href="/create" className="hover:text-[#00FF66] transition-colors">
                BUILD IDENTITY →
              </Link>
            </li>
            <li>
              <Link href="/radar" className="hover:text-[#00FF66] transition-colors">
                BUILDER RADAR
              </Link>
            </li>
            <li>
              <Link href="/team" className="hover:text-[#00FF66] transition-colors">
                TEAM DNA COMBINER
              </Link>
            </li>
            <li>
              <a href="https://hhgoa.com" target="_blank" rel="noreferrer" className="hover:text-[#00FF66] transition-colors">
                HHGOA.COM ↗
              </a>
            </li>
          </ul>
        </div>

        {/* Event Details */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            EVENT DETAILS
          </h4>
          <div className="font-mono text-xs space-y-1 text-zinc-300">
            <p className="font-bold text-white">HACKER HOUSE GOA 2026</p>
            <p>GOA, INDIA</p>
            <p className="text-[#00FF66] font-bold">28—31 OCT 2026</p>
            <p className="pt-2 text-zinc-500">HASHTAG: #FrameInGoa</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-zinc-500">
        <div>
          © 2026 HACKER HOUSE GOA · SHIP OR SHIP.
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <span>#FrameInGoa</span>
          <span>·</span>
          <span>GOA, INDIA</span>
        </div>
      </div>
    </footer>
  );
};
