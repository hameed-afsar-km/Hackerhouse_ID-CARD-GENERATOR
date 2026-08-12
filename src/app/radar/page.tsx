'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Radio, Search, Filter, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConstellationCanvas } from '@/components/canvas/ConstellationCanvas';
import { BuilderProfileModal } from '@/components/radar/BuilderProfileModal';
import { BuilderIdentity } from '@/types/dna';
import { generateDemoBuilders } from '@/lib/demo-builders';

export default function RadarPage() {
  const [builders, setBuilders] = useState<BuilderIdentity[]>([]);
  const [selectedBuilder, setSelectedBuilder] = useState<BuilderIdentity | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    // Load pre-seeded 247 builders + custom generated builders from local storage
    const demoList = generateDemoBuilders(247);
    const customJson = localStorage.getItem('custom_builders');
    let customList: BuilderIdentity[] = [];
    if (customJson) {
      try {
        customList = JSON.parse(customJson);
      } catch (e) {
        console.warn(e);
      }
    }

    setBuilders([...customList, ...demoList]);
  }, []);

  const filteredBuilders = useMemo(() => {
    return builders.filter((b) => {
      const matchSearch =
        !searchQuery.trim() ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.dnaHash.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' ||
        b.stack.some((s) => s.toUpperCase().includes(selectedCategory.toUpperCase()));

      return matchSearch && matchCategory;
    });
  }, [builders, searchQuery, selectedCategory]);

  return (
    <div className="relative min-h-screen bg-[#050506] text-white flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {selectedBuilder && (
        <BuilderProfileModal
          builder={selectedBuilder}
          onClose={() => setSelectedBuilder(null)}
        />
      )}

      <main className="max-w-7xl mx-auto w-full space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#00FF66]/10 border border-[#00FF66] px-3 py-1 font-mono text-xs text-[#00FF66] font-bold uppercase tracking-widest">
              <Radio className="w-4 h-4 animate-pulse" />
              LIVE CONSTELLATION RADAR
            </div>

            <h1 className="font-mono text-4xl sm:text-6xl font-extrabold uppercase text-white tracking-tight">
              BUILDER RADAR
            </h1>

            <p className="font-mono text-base text-zinc-400">
              <span className="text-[#00FF66] font-bold">{builders.length} builders.</span> One signal. Clustered by stack vectors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="font-mono text-xs text-zinc-400 border border-zinc-800 px-4 py-3 bg-zinc-950">
              CLICK ANY NODE TO INSPECT DNA
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="SEARCH BY NAME, TITLE, OR DNA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-zinc-800 focus:border-[#00FF66] text-white pl-10 pr-4 py-2.5 outline-none font-bold placeholder-zinc-600"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {['ALL', 'AI', 'ROBOTICS', 'HARDWARE', 'FRONTEND', 'BACKEND', 'CRYPTO', 'DESIGN'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`py-2 px-3 font-mono text-xs font-bold border transition-all uppercase ${
                  selectedCategory === cat
                    ? 'bg-[#00FF66] text-black border-[#00FF66]'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Constellation Map */}
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
            <span>RADAR VIEWPORT // 2D CLUSTER MAP</span>
            <span>SHOWING {filteredBuilders.length} NODES</span>
          </div>

          <ConstellationCanvas
            builders={filteredBuilders}
            onSelectBuilder={(b) => setSelectedBuilder(b)}
          />
        </div>

        {/* Builder Grid Cards */}
        <div className="space-y-4 pt-8 border-t border-zinc-900">
          <h2 className="font-mono text-xl font-extrabold text-white uppercase tracking-wider">
            BUILDER DIRECTORY ({filteredBuilders.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredBuilders.slice(0, 24).map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBuilder(b)}
                className="bg-zinc-950 border border-zinc-800 p-5 space-y-3 hover:border-[#00FF66] transition-colors cursor-pointer group shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-zinc-500 font-bold">
                    {b.dnaHash}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#00FF66]" />
                </div>

                <div>
                  <h3 className="font-mono text-base font-extrabold text-white group-hover:text-[#00FF66] transition-colors">
                    {b.name}
                  </h3>
                  <p className="font-mono text-xs text-[#00E5FF] font-bold mt-0.5">
                    {b.title}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {b.stack.slice(0, 3).map((st) => (
                    <Badge key={st} variant="dark" className="text-[9px]">
                      {st}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
