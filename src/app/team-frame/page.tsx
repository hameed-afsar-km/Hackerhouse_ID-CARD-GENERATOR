'use client';

import React, { useState, useRef } from 'react';
import { Users, Plus, Trash2, Download, Share2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BuilderIdentity } from '@/types/builder';
import { SAMPLE_BUILDERS, generateDemoBuilders } from '@/lib/demo-builders';
import { TeamFrameCanvas } from '@/components/canvas/TeamFrameCanvas';

export default function TeamFramePage() {
  const [availableBuilders] = useState<BuilderIdentity[]>(() => generateDemoBuilders(20));
  const [teamName, setTeamName] = useState<string>('ALPHA COLLECTIVE');
  const [selectedMembers, setSelectedMembers] = useState<BuilderIdentity[]>(() => [
    SAMPLE_BUILDERS[0],
    SAMPLE_BUILDERS[1],
  ]);
  const [downloading, setDownloading] = useState<boolean>(false);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

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
      const filename = `team-pass-${teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
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
    const text = `Just generated our TEAM PASS for Hacker House Goa 2026! 🌴☀️

Team: ${teamName}
Members: ${selectedMembers.map((m) => m.name).join(' × ')}

#FrameInGoa #HHGoa2026 @HackerHouseGoa`;

    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative min-h-screen bg-[#0B6B3A] text-[#FBF6E9] py-10 px-4 sm:px-6 lg:px-8 font-mono">
      <main className="max-w-6xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#FF007A] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
            <Users className="w-4 h-4" />
            TEAM CARD COMBINER
          </div>

          <h1 className="font-display font-black uppercase text-5xl sm:text-7xl tracking-tight leading-none text-white">
            COMBINE TEAM PASS<span className="text-[#FFE600]">.</span>
          </h1>

          <p className="font-mono text-sm font-bold text-[#FBF6E9]/80">
            Merge 2–3 builders into one unified Hacker House Goa 2026 team pass.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: config */}
          <div className="lg:col-span-5 space-y-6">
            {/* Team name */}
            <div className="pinned-card pin-top-pink p-6 space-y-3 font-mono shadow-xl">
              <label className="text-xs font-bold text-[#0B6B3A] uppercase tracking-wider block">
                TEAM / COLLECTIVE NAME
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. ALPHA COLLECTIVE"
                className="w-full bg-[#FBF6E9] border-2 border-[#1A2E22]/20 focus:border-[#FF007A] text-[#1A2E22] px-4 py-3 font-bold rounded-2xl outline-none transition-all"
              />
            </div>

            {/* Selected members */}
            <div className="pinned-card pin-top-yellow p-6 space-y-4 font-mono shadow-xl">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#1A2E22]">TEAM MEMBERS ({selectedMembers.length}/3)</span>
                <span className="bg-[#FF007A] text-white px-3 py-1 rounded-full">
                  {selectedMembers.length >= 2 ? 'READY TO GENERATE' : 'ADD AT LEAST 2'}
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white p-3.5 rounded-2xl border border-[#1A2E22]/15 flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#1A2E22]">{member.name}</div>
                      <div className="text-xs text-[#FF007A] font-bold">{member.title}</div>
                    </div>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-[#1A2E22]/50 hover:text-[#FF007A] p-2 rounded-xl hover:bg-[#FF007A]/10 transition-colors"
                      aria-label={`Remove ${member.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add member */}
            <div className="pinned-card p-6 space-y-3 font-mono shadow-xl">
              <label className="text-xs font-bold text-[#0B6B3A] uppercase tracking-wider block">
                ADD BUILDERS FROM GALLERY
              </label>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {availableBuilders.map((builder) => {
                  const isAdded = selectedMembers.some((m) => m.id === builder.id);
                  return (
                    <button
                      key={builder.id}
                      onClick={() => addMember(builder)}
                      disabled={isAdded}
                      className={`w-full p-3 text-left rounded-2xl border flex items-center justify-between text-xs transition-all ${
                        isAdded
                          ? 'bg-[#FBF6E9]/40 border-[#1A2E22]/10 text-[#1A2E22]/40 cursor-not-allowed'
                          : 'bg-white border-[#1A2E22]/15 hover:border-[#0B6B3A] text-[#1A2E22]'
                      }`}
                    >
                      <div>
                        <span className="font-bold block">{builder.name}</span>
                        <span className="text-[11px] text-[#FF007A] font-bold">{builder.title}</span>
                      </div>
                      {!isAdded && <Plus className="w-4 h-4 text-[#0B6B3A]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 font-mono">
              <Button
                variant="primary"
                size="lg"
                onClick={handleDownload}
                disabled={downloading || selectedMembers.length === 0}
                className="w-full pink-pill-btn"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'GENERATING...' : 'DOWNLOAD TEAM POSTER'}
              </Button>

              <Button variant="secondary" size="lg" onClick={handleShareToX} className="w-full yellow-pill-btn">
                <Share2 className="w-4 h-4" />
                SHARE TEAM PASS (#FRAMEINGOA)
              </Button>
            </div>
          </div>

          {/* Right: preview */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#FFE600]">
              <span className="flex items-center gap-2 text-white">
                <ShieldCheck className="w-4 h-4 text-[#FF007A]" /> LIVE TEAM PREVIEW
              </span>
              <span>1200 × 1600 PORTRAIT FORMAT</span>
            </div>

            <div className="pinned-card p-3 shadow-2xl">
              <TeamFrameCanvas
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
