'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BuilderIdentity } from '@/types/builder';

interface GalleryMapCanvasProps {
  builders: BuilderIdentity[];
  onSelectBuilder: (builder: BuilderIdentity) => void;
}

const NODE_COLORS: Array<{ match: (b: BuilderIdentity) => boolean; color: string }> = [
  { match: (b) => b.stack.includes('AI'), color: '#FF007A' },
  { match: (b) => b.stack.includes('HARDWARE') || b.stack.includes('ROBOTICS'), color: '#FFE600' },
  { match: (b) => b.stack.includes('CRYPTO'), color: '#FF007A' },
  { match: (b) => b.stack.includes('DESIGN'), color: '#2EC4B6' },
  { match: (b) => b.stack.includes('BACKEND') || b.stack.includes('CLOUD'), color: '#FFFFFF' },
];

function nodeColor(b: BuilderIdentity): string {
  for (const rule of NODE_COLORS) {
    if (rule.match(b)) return rule.color;
  }
  return '#FFE600';
}

export const GalleryMapCanvas: React.FC<GalleryMapCanvasProps> = ({
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

    const nodes = builders.map((b) => {
      const px = centerX + (b.clusterPos?.x || 0);
      const py = centerY + (b.clusterPos?.y || 0);
      return {
        builder: b,
        x: px,
        y: py,
        baseX: px,
        baseY: py,
        radius: 7,
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
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
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
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
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
      // Deep Forest Green background matching Screenshot 4 & 5
      ctx.fillStyle = '#064E29';
      ctx.fillRect(0, 0, width, height);

      // White outline wave rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      for (let r = 110; r < 460; r += 110) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshair
      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = 'rgba(255, 230, 0, 0.2)';
      ctx.beginPath();
      ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height);
      ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Connection lines
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j += 5) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const hasCommonStack = n1.builder.stack.some((s) => n2.builder.stack.includes(s));
          if (hasCommonStack) {
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
              const alpha = (1 - dist / 160) * 0.25;
              ctx.strokeStyle = `rgba(255, 230, 0, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();
            }
          }
        }
      }

      // Render island nodes
      nodes.forEach((node) => {
        const isHovered = hoverNode === node;
        const pulse = Math.sin(time * 2.5 + node.pulseOffset) * 1.5;
        const r = isHovered ? 12 : node.radius + pulse * 0.4;
        const color = nodeColor(node.builder);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 4, 0, Math.PI * 2);
        ctx.globalAlpha = 0.25;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        if (isHovered) {
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'left';
          const label = node.builder.name.toUpperCase();
          const tw = ctx.measureText(label).width;

          // Tooltip card
          ctx.fillStyle = '#FBF6E9';
          ctx.beginPath();
          ctx.roundRect(node.x + 18, node.y - 14, tw + 20, 28, 14);
          ctx.fill();

          ctx.fillStyle = '#1A2E22';
          ctx.fillText(label, node.x + 28, node.y + 4);
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
    <div className="relative w-full rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl">
      <canvas ref={canvasRef} className="w-full cursor-pointer block" />
      {hoveredBuilder && (
        <div className="absolute top-4 left-4 pinned-card pin-top-pink p-4 font-mono text-xs font-bold pointer-events-none space-y-1.5 max-w-[260px] shadow-2xl">
          <div className="text-[#1A2E22] font-extrabold text-sm">{hoveredBuilder.name}</div>
          <div className="text-[#FF007A] font-bold">{hoveredBuilder.title}</div>
          <div className="text-[11px] text-[#1A2E22]/60 font-mono">BUILDER #{hoveredBuilder.builderNumber}</div>
          <div className="flex flex-wrap gap-1 pt-1">
            {hoveredBuilder.stack.map((st) => (
              <span key={st} className="bg-[#FF007A] text-white px-2 py-0.5 rounded-full text-[10px]">
                {st}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
