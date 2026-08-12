'use client';

import React from 'react';
import { X, Share2, Sparkles, ExternalLink } from 'lucide-react';
import { BuilderIdentity } from '@/types/dna';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DNAIdentityCanvas } from '@/components/canvas/DNAIdentityCanvas';
import Link from 'next/link';

interface BuilderProfileModalProps {
  builder: BuilderIdentity;
  onClose: () => void;
}

export const BuilderProfileModal: React.FC<BuilderProfileModalProps> = ({ builder, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border-2 border-[#00FF66] w-full max-w-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_#00FF66]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2 font-mono text-xs text-[#00FF66] font-bold uppercase">
            <span>CONSTELLATION SIGNAL</span>
            <span>·</span>
            <span>{builder.dnaHash}</span>
          </div>

          <h2 className="font-mono text-3xl font-extrabold text-white uppercase tracking-tight">
            {builder.name}
          </h2>

          <div className="inline-block bg-[#00FF66] text-black font-mono font-extrabold px-3 py-1 text-sm uppercase">
            {builder.title}
          </div>
        </div>

        {/* Stack Tags */}
        <div className="space-y-2 font-mono">
          <span className="text-xs text-zinc-500 font-bold block">TECHNICAL STACK</span>
          <div className="flex flex-wrap gap-2">
            {builder.stack.map((st) => (
              <Badge key={st} variant="cyan">
                {st}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats Matrix Preview */}
        <div className="bg-black border border-zinc-900 p-4 grid grid-cols-5 gap-2 font-mono text-center">
          <div>
            <div className="text-[10px] text-zinc-500 font-bold">SHIP</div>
            <div className="text-base font-extrabold text-[#00FF66]">{builder.stats.ship}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-bold">CREATE</div>
            <div className="text-base font-extrabold text-[#00E5FF]">{builder.stats.create}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-bold">BREAK</div>
            <div className="text-base font-extrabold text-[#FFD600]">{builder.stats.breakScore}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-bold">EXPLORE</div>
            <div className="text-base font-extrabold text-[#FF2E63]">{builder.stats.explore}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-bold">SIGNAL</div>
            <div className="text-base font-extrabold text-white">{builder.stats.signal}</div>
          </div>
        </div>

        {/* Poster Canvas Preview */}
        <div className="max-w-md mx-auto border border-zinc-800">
          <DNAIdentityCanvas builder={builder} />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href={`/result?id=${builder.id}`} className="flex-1">
            <Button variant="primary" size="md" className="w-full">
              <ExternalLink className="w-4 h-4" /> VIEW FULL RESULT
            </Button>
          </Link>

          <Button variant="outline" size="md" onClick={onClose} className="flex-1">
            CLOSE INSPECTION
          </Button>
        </div>
      </div>
    </div>
  );
};
