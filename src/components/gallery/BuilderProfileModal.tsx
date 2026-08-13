'use client';

import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { BuilderIdentity } from '@/types/builder';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BuilderCardCanvas } from '@/components/canvas/BuilderCardCanvas';
import Link from 'next/link';

interface BuilderProfileModalProps {
  builder: BuilderIdentity;
  onClose: () => void;
}

export const BuilderProfileModal: React.FC<BuilderProfileModalProps> = ({ builder, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-cream rounded-3xl border border-primary-green/20 shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Window chrome */}
        <div className="sticky top-0 z-10 bg-primary-green text-white px-6 py-4 font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-between rounded-t-3xl shadow-xs">
          <span>CARD INSPECTION — BUILDER #{builder.builderNumber}</span>
          <button
            onClick={onClose}
            className="text-white hover:bg-pink p-1.5 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2 border-b border-primary-green/15 pb-5">
            <div className="font-mono text-xs font-bold text-ink/60">
              BUILDER #{builder.builderNumber} · HACK MODE: {builder.stats.hackMode}
            </div>
            <h2 className="font-display font-extrabold uppercase text-4xl sm:text-5xl tracking-tight text-ink leading-none">
              {builder.name}
            </h2>
            <div className="inline-block bg-pink text-white font-sans font-bold px-3.5 py-1 text-xs uppercase rounded-full shadow-xs">
              {builder.title}
            </div>
          </div>

          {/* Stack tags */}
          <div className="space-y-2 font-sans">
            <span className="text-xs font-bold text-ink/60 block uppercase">TECHNICAL STACK</span>
            <div className="flex flex-wrap gap-2">
              {builder.stack.map((st) => (
                <Badge key={st} variant="green">
                  {st}
                </Badge>
              ))}
            </div>
          </div>

          {/* Poster preview */}
          <div className="max-w-md mx-auto hh-card p-2 shadow-md">
            <BuilderCardCanvas builder={builder} />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href={`/result?id=${builder.id}`} className="flex-1">
              <Button variant="primary" size="md" className="w-full">
                <ExternalLink className="w-4 h-4" /> VIEW FULL RESULT & FRAME
              </Button>
            </Link>
            <Button variant="outline" size="md" onClick={onClose} className="flex-1">
              CLOSE INSPECTION
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
