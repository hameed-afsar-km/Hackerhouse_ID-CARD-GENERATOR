'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Radio, Search, Users, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GalleryMapCanvas } from '@/components/canvas/GalleryMapCanvas';
import { BuilderProfileModal } from '@/components/gallery/BuilderProfileModal';
import { BuilderIdentity } from '@/types/builder';
import { generateDemoBuilders } from '@/lib/demo-builders';
import { resolveClaimCode } from '@/lib/builder-engine';

export default function GalleryPage() {
  const [builders] = useState<BuilderIdentity[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const demoList = generateDemoBuilders(247);
      const customJson = localStorage.getItem('custom_builders');
      let customList: BuilderIdentity[] = [];
      if (customJson) {
        customList = JSON.parse(customJson);
      }
      return [...customList, ...demoList];
    } catch (e) {
      console.warn(e);
      return [];
    }
  });
  const [selectedBuilder, setSelectedBuilder] = useState<BuilderIdentity | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [codeQuery, setCodeQuery] = useState<string>('');
  const [codeStatus, setCodeStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const router = useRouter();

  const handleCodeSearch = () => {
    const clean = codeQuery.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length !== 12) {
      setCodeStatus(`CODE MUST BE 12 CHARS (GOT ${clean.length})`);
      return;
    }

    const local = builders.find((b) => resolveClaimCode(b.claimCode, b.builderNumber) === clean);
    if (local) {
      setCodeStatus('FOUND LOCALLY — OPENING...');
      router.push(`/result?id=${local.id}`);
      return;
    }

    setCodeStatus('QUERYING HH GOA REGISTRY...');
    fetch(`/api/builders/code/${encodeURIComponent(clean)}`)
      .then((res) => {
        if (res.status === 404) {
          setCodeStatus('CODE NOT FOUND IN REGISTRY');
          return null;
        }
        if (res.status === 503) {
          setCodeStatus('REGISTRY UNAVAILABLE — CHECK BACK SOON');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.builder) {
          setCodeStatus('FOUND — OPENING BUILDER...');
          router.push(`/result?code=${encodeURIComponent(clean)}`);
        }
      })
      .catch(() => setCodeStatus('REGISTRY ERROR — TRY AGAIN'));
  };

  const filteredBuilders = useMemo(() => {
    return builders.filter((b) => {
      const matchSearch =
        !searchQuery.trim() ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.builderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.claimCode?.toLowerCase().includes(searchQuery.toLowerCase().replace(/[^a-z0-9]/g, ''));

      const matchCategory =
        selectedCategory === 'ALL' ||
        b.stack.some((s) => s.toUpperCase().includes(selectedCategory.toUpperCase()));

      return matchSearch && matchCategory;
    });
  }, [builders, searchQuery, selectedCategory]);

  return (
    <div className="relative min-h-screen bg-[#0B6B3A] text-[#FBF6E9] py-10 px-4 sm:px-6 lg:px-8 font-mono">
      {selectedBuilder && (
        <BuilderProfileModal
          builder={selectedBuilder}
          onClose={() => setSelectedBuilder(null)}
        />
      )}

      <main className="max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#FF007A] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
              <Radio className="w-4 h-4" />
              HH GOA BUILDER MAP
            </div>

            <h1 className="font-display font-black uppercase text-5xl sm:text-7xl tracking-tight leading-none text-white">
              BUILDER GALLERY<span className="text-[#FFE600]">.</span>
            </h1>

            <p className="font-mono text-sm font-bold text-[#FBF6E9]/80">
              <span className="text-[#FFE600] font-bold">{builders.length} builders.</span> One map. Clustered by stack. Click a dot to inspect.
            </p>
          </div>

          <div className="font-mono text-xs font-bold bg-[#FFE600] text-[#1A2E22] px-4 py-3 rounded-full shadow-md">
            CLICK ANY DOT TO INSPECT BUILDER
          </div>
        </div>

        {/* Filter bar */}
        <div className="pinned-card p-4 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center font-mono text-xs shadow-xl">
          <div className="relative flex-[2]">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#1A2E22]/40" />
            <input
              type="text"
              placeholder="SEARCH BY NAME, TITLE, BUILDER #, OR CODE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FBF6E9] border-2 border-[#1A2E22]/20 focus:border-[#FF007A] text-[#1A2E22] pl-11 pr-4 py-3 font-bold rounded-xl outline-none placeholder:text-[#1A2E22]/40"
            />
          </div>

          <div className="relative flex-1">
            <Fingerprint className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#FF007A]" />
            <input
              type="text"
              placeholder="UNIQUE CODE LOOKUP (12 CHARS)"
              value={codeQuery}
              maxLength={14}
              onChange={(e) => setCodeQuery(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCodeSearch();
              }}
              className="w-full bg-[#FBF6E9] border-2 border-[#FF007A]/50 focus:border-[#FF007A] text-[#1A2E22] pl-11 pr-4 py-3 font-bold rounded-xl outline-none placeholder:text-[#1A2E22]/40"
            />
          </div>

          <Button variant="primary" size="md" onClick={handleCodeSearch} className="pink-pill-btn shrink-0">
            FIND BY CODE
          </Button>

          {codeStatus && (
            <div className="w-full lg:w-auto text-[10px] font-bold bg-[#FFE600] text-[#1A2E22] px-3 py-2 rounded-full text-center">
              {codeStatus}
            </div>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 justify-end -mt-2">
          {['ALL', 'AI', 'ROBOTICS', 'HARDWARE', 'FRONTEND', 'BACKEND', 'CRYPTO', 'DESIGN'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`py-2 px-4 text-xs font-bold rounded-full transition-all ${
                selectedCategory === cat
                  ? 'bg-[#FF007A] text-white shadow-md'
                  : 'bg-[#FBF6E9]/15 text-[#FBF6E9] hover:bg-[#FF007A]/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono text-xs font-bold text-[#FFE600]">
            <span>{'// 2D CLUSTER MAP'}</span>
            <span>SHOWING {filteredBuilders.length} NODES</span>
          </div>

          <GalleryMapCanvas
            builders={filteredBuilders}
            onSelectBuilder={(b) => setSelectedBuilder(b)}
          />
        </div>

        {/* Directory */}
        <div className="space-y-6 pt-8 border-t border-white/10 font-mono">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black uppercase text-3xl sm:text-4xl tracking-tight text-white">
              DIRECTORY<span className="text-[#FF007A]">.</span> ({filteredBuilders.length})
            </h2>
            <Users className="w-6 h-6 text-[#FFE600]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredBuilders.slice(0, 24).map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBuilder(b)}
                className="pinned-card p-5 space-y-3 cursor-pointer hover:-translate-y-1 transition-transform shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#1A2E22]/50 font-bold">BUILDER #{b.builderNumber}</span>
                  <span className="w-3 h-3 rounded-full bg-[#FF007A] inline-block" />
                </div>

                <div className="border-l-2 border-[#0B6B3A] pl-3">
                  <h3 className="font-display font-bold uppercase text-lg text-[#1A2E22] tracking-tight">{b.name}</h3>
                  <p className="font-mono text-xs text-[#FF007A] font-bold mt-0.5">{b.title}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {b.stack.slice(0, 3).map((st) => (
                    <Badge key={st} variant="green" className="text-[10px]">
                      {st}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="pinned-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <div className="font-display font-black uppercase text-3xl text-[#1A2E22]">Not on the map?</div>
            <div className="font-mono text-sm font-bold text-[#1A2E22]/80 mt-1">
              Build your own card and it lands here automatically.
            </div>
          </div>
          <a href="/create">
            <Button variant="primary" size="lg" className="pink-pill-btn px-8">
              BUILD YOUR ID CARD
            </Button>
          </a>
        </div>
      </main>
    </div>
  );
}
