'use client';

import React, { useEffect, useRef } from 'react';
import { BuilderIdentity } from '@/types/dna';
import { drawBuilderDNAIdentity, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/canvas-helpers';

interface DNAIdentityCanvasProps {
  builder: BuilderIdentity;
  className?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const DNAIdentityCanvas: React.FC<DNAIdentityCanvasProps> = ({
  builder,
  className,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawBuilderDNAIdentity(canvas, builder).then(() => {
      if (onCanvasReady) {
        onCanvasReady(canvas);
      }
    });
  }, [builder, onCanvasReady]);

  return (
    <div className={`relative max-w-full overflow-hidden bg-black ${className || ''}`}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-auto block border border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
      />
    </div>
  );
};
