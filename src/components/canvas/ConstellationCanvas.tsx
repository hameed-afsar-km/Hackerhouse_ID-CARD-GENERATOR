'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BuilderIdentity } from '@/types/dna';

interface ConstellationCanvasProps {
  builders: BuilderIdentity[];
  onSelectBuilder: (builder: BuilderIdentity) => void;
}

export const ConstellationCanvas: React.FC<ConstellationCanvasProps> = ({
  builders,
  onSelectBuilder,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredBuilder, setHoveredBuilder] = useState<BuilderIdentity | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = 650);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 900;
      height = canvas.height = 650;
    };

    window.addEventListener('resize', handleResize);

    const centerX = width / 2;
    const centerY = height / 2;

    // Convert relative cluster positions to screen coordinates
    const nodes = builders.map((b) => {
      const px = centerX + (b.clusterPos?.x || 0);
      const py = centerY + (b.clusterPos?.y || 0);
      return {
        builder: b,
        x: px,
        y: py,
        baseX: px,
        baseY: py,
        radius: 4,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    });

    let hoverNode: typeof nodes[0] | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found: typeof nodes[0] | null = null;
      for (const node of nodes) {
        const dx = node.x - mx;
        const dy = node.y - my;
        if (Math.sqrt(dx * dx + dy * dy) < 14) {
          found = node;
          break;
        }
      }

      hoverNode = found;
      setHoveredBuilder(found ? found.builder : null);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (const node of nodes) {
        const dx = node.x - mx;
        const dy = node.y - my;
        if (Math.sqrt(dx * dx + dy * dy) < 14) {
          onSelectBuilder(node.builder);
          break;
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.fillStyle = '#050506';
      ctx.fillRect(0, 0, width, height);

      // Radar rings
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 1;
      for (let r = 100; r < 450; r += 100) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshair
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height);
      ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw connections between builders in similar stack
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j += 6) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const hasCommonStack = n1.builder.stack.some((s) => n2.builder.stack.includes(s));
          if (hasCommonStack) {
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
              const alpha = (1 - dist / 160) * 0.15;
              ctx.strokeStyle = `rgba(0, 255, 102, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();
            }
          }
        }
      }

      // Render Nodes
      nodes.forEach((node) => {
        const isHovered = hoverNode === node;
        const pulse = Math.sin(time * 2 + node.pulseOffset) * 1.5;
        const r = isHovered ? 8 : node.radius + pulse * 0.3;

        // Color based on primary stack
        let nodeColor = '#00FF66';
        if (node.builder.stack.includes('AI')) nodeColor = '#00E5FF';
        else if (node.builder.stack.includes('HARDWARE')) nodeColor = '#FFD600';
        else if (node.builder.stack.includes('CRYPTO')) nodeColor = '#A855F7';
        else if (node.builder.stack.includes('DESIGN')) nodeColor = '#FF2E63';

        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();

        if (isHovered) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 4, 0, Math.PI * 2);
          ctx.stroke();

          // Label tooltip
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(node.builder.name.toUpperCase(), node.x, node.y - 14);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animId);
    };
  }, [builders, onSelectBuilder]);

  return (
    <div className="relative w-full border border-zinc-800 bg-zinc-950 overflow-hidden">
      <canvas ref={canvasRef} className="w-full cursor-pointer block" />
      {hoveredBuilder && (
        <div className="absolute top-4 left-4 bg-black/90 border border-[#00FF66] p-3 font-mono text-xs text-white pointer-events-none space-y-1">
          <div className="text-[#00FF66] font-bold">{hoveredBuilder.name}</div>
          <div className="text-zinc-300">{hoveredBuilder.title}</div>
          <div className="text-[10px] text-zinc-500">{hoveredBuilder.dnaHash}</div>
        </div>
      )}
    </div>
  );
};
