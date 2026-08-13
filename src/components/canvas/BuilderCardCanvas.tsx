'use client';

import React, { useEffect, useRef } from 'react';
import { BuilderIdentity } from '@/types/builder';
import { drawBuilderCard, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/canvas-helpers';

interface BuilderCardCanvasProps {
  builder: BuilderIdentity;
  className?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const BuilderCardCanvas: React.FC<BuilderCardCanvasProps> = ({
  builder,
  className,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawBuilderCard(canvas, builder).then(() => {
      if (onCanvasReady) {
        onCanvasReady(canvas);
      }
    });
  }, [builder, onCanvasReady]);

  return (
    <div className={`relative max-w-full overflow-hidden rounded-2xl ${className || ''}`}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-auto block rounded-2xl"
      />
    </div>
  );
};
