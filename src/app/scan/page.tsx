'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, KeyRound, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const CODE_LENGTH = 12;

function formatInput(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
  return clean.match(/.{1,4}/g)?.join(' ') ?? clean;
}

function normalize(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export default function FindBuilderPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = useCallback(async () => {
    const code = normalize(query);
    if (code.length !== CODE_LENGTH) {
      setError('Enter the full 12-character code printed on the card.');
      return;
    }
    setError(null);
    setSearching(true);
    try {
      const res = await fetch(`/api/builders/code/${encodeURIComponent(code)}`);
      if (res.ok) {
        router.push(`/result?code=${encodeURIComponent(code)}`);
        return;
      }
      if (res.status === 404) {
        setError('No builder found with that code. Double-check the code on the card.');
      } else {
        setError('Something went wrong while searching. Try again.');
      }
    } catch {
      setError('Could not reach the registry. Check your connection and try again.');
    } finally {
      setSearching(false);
    }
  }, [query, router]);

  return (
    <div className="relative min-h-screen bg-[#0B6B3A] text-[#FBF6E9] py-10 px-4 sm:px-6 lg:px-8 font-mono">
      <main className="max-w-xl mx-auto w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#FFE600] text-[#1A2E22] px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
            <Search className="w-4 h-4 text-[#FF007A]" />
            SEARCH A BUILDER BY CODE
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-white tracking-tight">
            FIND A BUILDER<span className="text-[#FF007A]">.</span>
          </h1>
          <p className="font-mono text-xs font-bold text-[#FBF6E9]/70">
            Every Builder Pass carries a unique 12-character code. Enter it to open the builder&apos;s
            public HH Goa 2026 profile.
          </p>
        </div>

        {/* Search input */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#FBF6E9]/70 uppercase tracking-wider block">
            UNIQUE 12-CHARACTER CODE
          </label>
          <div className="relative">
            <KeyRound className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#FF007A]" />
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="XXXX XXXX XXXX"
              value={query}
              onChange={(e) => {
                setQuery(formatInput(e.target.value));
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="w-full bg-[#FBF6E9] border-2 border-[#1A2E22]/20 focus:border-[#FF007A] text-[#1A2E22] px-12 py-5 font-mono text-xl font-black tracking-[0.25em] rounded-2xl outline-none transition-all placeholder:text-[#1A2E22]/30 uppercase"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleSearch}
            disabled={searching}
            className="w-full pink-pill-btn"
          >
            {searching ? (
              <>
                SEARCHING... <span className="animate-pulse">●</span>
              </>
            ) : (
              <>
                SEARCH REGISTRY <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {error && (
            <div className="flex items-start gap-3 bg-[#FF007A]/10 border border-[#FF007A]/30 rounded-2xl p-4">
              <AlertTriangle className="w-5 h-5 text-[#FF007A] shrink-0" />
              <p className="text-xs font-bold text-[#FFE600]">{error}</p>
            </div>
          )}
        </div>

        {/* Where to find the code */}
        <div className="pinned-card pin-top-pink p-6 space-y-3 shadow-2xl text-[#1A2E22]">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#FF007A]" />
            WHERE IS THE CODE?
          </div>
          <ul className="font-mono text-xs font-bold text-[#1A2E22]/70 space-y-2 list-disc list-inside">
            <li>Printed big on the footer of every Builder Pass.</li>
            <li>Also shown inside the title chip on the Profile Frame.</li>
            <li>Look for 3 groups of 4 characters, e.g. <span className="text-[#FF007A] font-black">7F3A 9X2C KQ4M</span>.</li>
          </ul>
        </div>

        <div className="text-center font-mono text-xs font-bold text-[#FBF6E9]/60">
          Search runs against the public builder registry — no account needed.
        </div>
      </main>
    </div>
  );
}
