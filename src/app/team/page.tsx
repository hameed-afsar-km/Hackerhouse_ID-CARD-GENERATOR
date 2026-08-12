'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Trash2, Download, Share2, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BuilderIdentity } from '@/types/dna';
import { SAMPLE_BUILDERS, generateDemoBuilders } from '@/lib/demo-builders';
import { TeamDNACanvas } from '@/components/canvas/TeamDNACanvas';

export default function TeamPage() {
  const [availableBuilders, setAvailableBuilders] = useState<BuilderIdentity[]>([]);
  const [teamName, setTeamName] = useState<string>('ALPHA COLLECTIVE');
  const [selectedMembers, setSelectedMembers] = useState<BuilderIdentity[]>([]);
  const [downloading, setDownloading] = useState<boolean>(false);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Populate sample and local builders
    const demo = generateDemoBuilders(20);
    setAvailableBuilders(demo);
    // Pre-select first 2 builders for instant demonstration
    setSelectedMembers([SAMPLE_BUILDERS[0], SAMPLE_BUILDERS[1]]);
  }, []);

  const addMember = (builder: BuilderIdentity) => {
    if (selectedMembers.length >= 3) {
      alert('You can select up to 3 team members.');
      return;
    }
    if (selectedMembers.some((m) => m.id === builder.id)) return;
    setSelectedMembers([...selectedMembers, builder]);
  };

  const removeMember = (id: string) => {
    if (selectedMembers.length <= 1) {
      alert('A team must have at least 1 member.');
      return;
    }
    setSelectedMembers(selectedMembers.filter((m) => m.id !== id));
  };

  const handleDownload = () => {
    if (!canvasElementRef.current) return;
    setDownloading(true);

    canvasElementRef.current.toBlob((blob) => {
      if (!blob) {
        setDownloading(false);
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `team-dna-${teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, 'image/png');
  };

  const handleShareToX = () => {
    const text = `Just generated our TEAM DNA for Hacker House Goa 2026!

Team: ${teamName}
Members: ${selectedMembers.map((m) => m.name).join(' × ')}

#FrameInGoa @HackerHouseGoa`;

    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative min-h-screen bg-[#050506] text-white flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <main className="max-w-6xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#00E5FF]/10 border border-[#00E5FF] px-3 py-1 font-mono text-xs text-[#00E5FF] font-bold uppercase tracking-widest">
            <Users className="w-4 h-4" />
            TEAM DNA COMBINER
          </div>

          <h1 className="font-mono text-4xl sm:text-6xl font-extrabold uppercase text-white tracking-tight">
            COMBINE TEAM DNA
          </h1>

          <p className="font-mono text-base text-zinc-400">
            Merge 2–3 builders into one combined HH Goa 2026 Team Identity poster.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Team Configuration Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Team Name Input */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 space-y-3 font-mono">
              <label className="text-xs text-zinc-400 font-bold block uppercase">
                TEAM / COLLECTIVE NAME
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. ALPHA COLLECTIVE"
                className="w-full bg-black border border-zinc-700 focus:border-[#00E5FF] text-white px-4 py-3 font-bold outline-none"
              />
            </div>

            {/* Selected Team Members */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 space-y-4 font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-bold">TEAM MEMBERS ({selectedMembers.length}/3)</span>
                <span className="text-[#00E5FF]">{selectedMembers.length >= 2 ? 'READY TO GENERATE' : 'ADD AT LEAST 2'}</span>
              </div>

              <div className="space-y-2">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-black border border-zinc-800 p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-extrabold text-white">{member.name}</div>
                      <div className="text-xs text-[#00FF66]">{member.title}</div>
                    </div>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Member Selector */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 space-y-3 font-mono">
              <label className="text-xs text-zinc-400 font-bold block uppercase">
                ADD BUILDER TO TEAM
              </label>
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {availableBuilders.map((builder) => {
                  const isAdded = selectedMembers.some((m) => m.id === builder.id);
                  return (
                    <button
                      key={builder.id}
                      onClick={() => addMember(builder)}
                      disabled={isAdded}
                      className={`w-full p-2.5 text-left border flex items-center justify-between text-xs transition-colors ${
                        isAdded
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                          : 'bg-black border-zinc-800 hover:border-[#00E5FF] text-white'
                      }`}
                    >
                      <div>
                        <span className="font-bold block">{builder.name}</span>
                        <span className="text-[10px] text-zinc-500">{builder.title}</span>
                      </div>
                      {!isAdded && <Plus className="w-4 h-4 text-[#00E5FF]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="accent"
                size="lg"
                onClick={handleDownload}
                disabled={downloading || selectedMembers.length === 0}
                className="w-full"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'GENERATING...' : 'DOWNLOAD TEAM POSTER'}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleShareToX}
                className="w-full"
              >
                <Share2 className="w-4 h-4" />
                SHARE TEAM DNA (#FrameInGoa)
              </Button>
            </div>
          </div>

          {/* Right Column: Combined Team Canvas Preview */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
              <span className="text-[#00E5FF] font-bold">LIVE TEAM POSTER PREVIEW</span>
              <span>1200 × 1600 PORTRAIT FORMAT</span>
            </div>

            <div className="border-2 border-zinc-800 bg-black">
              <TeamDNACanvas
                teamName={teamName}
                members={selectedMembers}
                onCanvasReady={(cv) => {
                  canvasElementRef.current = cv;
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
