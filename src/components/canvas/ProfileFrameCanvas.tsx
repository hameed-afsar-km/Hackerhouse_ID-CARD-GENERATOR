'use client';

import React, { useEffect, useRef } from 'react';
import { BuilderIdentity } from '@/types/builder';
import { drawProfileFrame, PROFILE_FRAME_SIZE } from '@/lib/canvas-helpers';

interface ProfileFrameCanvasProps {
  builder: BuilderIdentity;
  className?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const ProfileFrameCanvas: React.FC<ProfileFrameCanvasProps> = ({
  builder,
  className,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawProfileFrame(canvas, builder).then(() => {
      if (onCanvasReady) {
        onCanvasReady(canvas);
      }
    });
  }, [builder, onCanvasReady]);

  return (
    <div className={`relative max-w-full overflow-hidden rounded-2xl ${className || ''}`}>
      <canvas
        ref={canvasRef}
        width={PROFILE_FRAME_SIZE}
        height={PROFILE_FRAME_SIZE}
        className="w-full h-auto block rounded-2xl"
      />
    </div>
  );
};
