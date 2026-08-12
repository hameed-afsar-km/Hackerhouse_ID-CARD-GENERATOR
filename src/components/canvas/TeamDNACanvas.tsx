'use client';

import React, { useEffect, useRef } from 'react';
import { BuilderIdentity } from '@/types/dna';
import { fnv1aHash, generateDNAHash } from '@/lib/dna-engine';

interface TeamDNACanvasProps {
  teamName: string;
  members: BuilderIdentity[];
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const TeamDNACanvas: React.FC<TeamDNACanvasProps> = ({
  teamName,
  members,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || members.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200;
    const H = 1600;
    canvas.width = W;
    canvas.height = H;

    const combinedSeedStr = teamName + members.map((m) => m.dnaHash).join('-');
    const teamSeed = fnv1aHash(combinedSeedStr);
    const teamDnaHash = generateDNAHash(teamSeed);

    // 1. Background
    ctx.fillStyle = '#050506';
    ctx.fillRect(0, 0, W, H);

    // Tactical Grid
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // 2. Header
    ctx.fillStyle = '#00E5FF';
    ctx.fillRect(80, 70, 16, 48);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px monospace';
    ctx.fillText('HACKER HOUSE GOA 2026', 112, 105);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '500 22px monospace';
    ctx.fillText('TEAM DNA COLLECTIVE', 112, 138);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#00E5FF';
    ctx.font = '700 22px monospace';
    ctx.fillText('#FrameInGoa', W - 80, 105);

    ctx.fillStyle = '#71717A';
    ctx.font = '500 20px monospace';
    ctx.fillText('COMBINED SIGNAL IDENTITY', W - 80, 138);

    ctx.strokeStyle = '#27272A';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(80, 165); ctx.lineTo(W - 80, 165); ctx.stroke();

    // 3. Team Title & DNA Hash
    let curY = 230;

    ctx.fillStyle = '#18181B';
    ctx.fillRect(80, curY, 360, 48);
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1;
    ctx.strokeRect(80, curY, 360, 48);

    ctx.fillStyle = '#00E5FF';
    ctx.font = '700 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(teamDnaHash, 260, curY + 32);

    curY += 100;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(teamName.toUpperCase(), W / 2, curY);

    curY += 60;

    ctx.fillStyle = '#00FF66';
    ctx.fillRect(W / 2 - 250, curY, 500, 50);

    ctx.fillStyle = '#050506';
    ctx.font = '800 28px monospace';
    ctx.fillText('THE FULL-STACK COLLECTIVE', W / 2, curY + 35);

    curY += 120;

    // 4. Members Photos & Badges (Grid of 2 or 3)
    const count = members.length;
    const colW = (W - 160) / count;

    members.forEach((m, idx) => {
      const cx = 80 + idx * colW + colW / 2;
      const photoSize = 220;

      // Draw photo reticle
      ctx.strokeStyle = '#00FF66';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, curY + 110, photoSize / 2 + 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.arc(cx, curY + 110, photoSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Member Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.name.toUpperCase(), cx, curY + 270);

      // Member Title
      ctx.fillStyle = '#00E5FF';
      ctx.font = '700 18px monospace';
      ctx.fillText(m.title, cx, curY + 302);

      // Member DNA
      ctx.fillStyle = '#71717A';
      ctx.font = '500 16px monospace';
      ctx.fillText(m.dnaHash, cx, curY + 330);
    });

    // Connecting signal beam line between members
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(80 + colW / 2, curY + 110);
    ctx.lineTo(80 + (count - 1) * colW + colW / 2, curY + 110);
    ctx.stroke();
    ctx.setLineDash([]);

    curY += 400;

    // 5. Combined Stack Badges
    ctx.strokeStyle = '#27272A';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(80, curY); ctx.lineTo(W - 80, curY); ctx.stroke();

    curY += 50;

    const allStacks = Array.from(new Set(members.flatMap((m) => m.stack)));
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '700 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('COMBINED TEAM MATRIX STACK', 80, curY);

    curY += 40;

    ctx.font = '700 22px monospace';
    let startX = 80;
    allStacks.forEach((st) => {
      const tagW = ctx.measureText(st).width + 40;
      if (startX + tagW > W - 80) {
        startX = 80;
        curY += 60;
      }
      ctx.fillStyle = '#18181B';
      ctx.fillRect(startX, curY, tagW, 46);
      ctx.strokeStyle = '#00FF66';
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, curY, tagW, 46);

      ctx.fillStyle = '#00FF66';
      ctx.textAlign = 'center';
      ctx.fillText(st, startX + tagW / 2, curY + 31);
      startX += tagW + 16;
    });

    // 6. Footer
    ctx.fillStyle = '#0F0F12';
    ctx.fillRect(80, H - 220, W - 160, 140);
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, H - 220, W - 160, 140);

    ctx.fillStyle = '#00E5FF';
    ctx.font = '900 48px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('#FrameInGoa', 120, H - 135);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 22px monospace';
    ctx.fillText('OFFICIAL HH GOA TEAM ID', W - 120, H - 150);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '500 18px monospace';
    ctx.fillText('GOA, INDIA · 28—31 OCT 2026', W - 120, H - 118);

    if (onCanvasReady) {
      onCanvasReady(canvas);
    }
  }, [teamName, members, onCanvasReady]);

  return (
    <div className="relative max-w-full overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-auto block border border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
      />
    </div>
  );
};
