'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Upload,
  ZoomIn,
  Move,
  MoveHorizontal,
  MoveVertical,
  Sparkles,
  RefreshCw,
  Hand,
} from 'lucide-react';
import { PhotoFilterSettings, PhotoPreset, CardTheme, FrameStyle } from '@/types/builder';
import { computeSmartAlign } from '@/lib/smart-crop';
import { Button } from '@/components/ui/Button';

interface PhotoUploaderProps {
  photoUrl: string;
  settings: PhotoFilterSettings;
  onPhotoChange: (url: string) => void;
  onSettingsChange: (settings: PhotoFilterSettings) => void;
}

const PRESET_FILTERS: Record<PhotoFilterSettings['preset'], string> = {
  RAW: 'none',
  VIVID: 'saturate(150%) contrast(110%)',
  DARK: 'brightness(0.85) contrast(130%)',
  WARM: 'sepia(0.35) saturate(130%) contrast(105%)',
};

const PAN_MIN = -50;
const PAN_MAX = 50;

// Inner circle clip size in px (w-56 = 224px minus 5px ring padding each side).
const FRAME_SIZE = 214;

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photoUrl,
  settings,
  onPhotoChange,
  onSettingsChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [smartAlignEnabled, setSmartAlignEnabled] = useState(true);
  const [imgRatio, setImgRatio] = useState(1);

  useEffect(() => {
    if (!photoUrl) return;
    const img = new Image();
    img.onload = () => setImgRatio(img.width / img.height || 1);
    img.onerror = () => setImgRatio(1);
    img.src = photoUrl;
  }, [photoUrl]);

  const applySmartAlign = (url: string) => {
    const img = new Image();
    img.onload = () => {
      const align = computeSmartAlign(img);
      onSettingsChange({
        ...settings,
        zoom: align.zoom,
        panX: clamp(align.panX, PAN_MIN, PAN_MAX),
        panY: clamp(align.panY, PAN_MIN, PAN_MAX),
      });
    };
    img.src = url;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Please select an image under 10MB.');
      return;
    }

    const isHeic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);

    try {
      let url: string;
      if (isHeic) {
        const heic2any = (await import('heic2any')).default;
        const output = (await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.92,
        })) as Blob | Blob[];
        const jpeg = Array.isArray(output) ? output[0] : output;
        url = await blobToDataUrl(jpeg);
      } else {
        url = await fileToDataUrl(file);
      }
      onPhotoChange(url);
      if (smartAlignEnabled) applySmartAlign(url);
    } catch (err) {
      console.error('Failed to read photo', err);
      alert('Could not read this image. Try a JPG or PNG instead.');
    }
  };

  const handlePresetSelect = (preset: PhotoPreset) => {
    onSettingsChange({ ...settings, preset });
  };

  const handleAutoAlign = () => {
    if (photoUrl) applySmartAlign(photoUrl);
  };

  const toggleSmartAlign = () => {
    if (smartAlignEnabled) {
      setSmartAlignEnabled(false);
      onSettingsChange({ ...settings, zoom: 1, panX: 0, panY: 0 });
    } else {
      setSmartAlignEnabled(true);
      if (photoUrl) applySmartAlign(photoUrl);
    }
  };

  // ---- Drag to reposition the photo inside the circle frame ----
  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!photoUrl) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const needsZoom = settings.zoom <= 1.05;
    if (needsZoom) {
      onSettingsChange({ ...settings, zoom: 1.4 });
    }
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: settings.panX,
      panY: settings.panY,
    };
    setIsDragging(true);
  };

  const handleDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const pxPerUnit = rect.width / 100;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    onSettingsChange({
      ...settings,
      panX: clamp(dragRef.current.panX + dx / pxPerUnit, PAN_MIN, PAN_MAX),
      panY: clamp(dragRef.current.panY + dy / pxPerUnit, PAN_MIN, PAN_MAX),
    });
  };

  const endDrag = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="hh-card p-6 text-center relative border-2 border-dashed border-primary-green/20 hover:border-primary-green/40 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload-input"
        />

        {photoUrl ? (
          <div className="space-y-4">
            <div
              ref={frameRef}
              onPointerDown={startDrag}
              onPointerMove={handleDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className="relative w-56 h-56 mx-auto select-none"
              style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {/* decorative dashed accent ring */}
              <div className="absolute -inset-2.5 rounded-full border-2 border-dashed border-yellow/70 pointer-events-none" />

              {/* main gradient ring frame */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink via-yellow to-primary-green p-[5px] shadow-xl pointer-events-none">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-cream">
                  {(() => {
                    const zoom = settings.zoom;
                    let imgW = FRAME_SIZE * zoom;
                    let imgH = FRAME_SIZE * zoom;
                    if (imgRatio > 1) {
                      imgW = FRAME_SIZE * imgRatio * zoom;
                    } else if (imgRatio < 1) {
                      imgH = (FRAME_SIZE / imgRatio) * zoom;
                    }
                    const left = FRAME_SIZE / 2 - imgW / 2 + (settings.panX / 100) * FRAME_SIZE;
                    const top = FRAME_SIZE / 2 - imgH / 2 + (settings.panY / 100) * FRAME_SIZE;
                    return (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={photoUrl}
                        alt="Builder Photo Preview"
                        draggable={false}
                        className="absolute"
                        style={{
                          width: imgW,
                          height: imgH,
                          left,
                          top,
                          maxWidth: 'none',
                          filter: PRESET_FILTERS[settings.preset],
                          userSelect: 'none',
                        } as React.CSSProperties}
                      />
                    );
                  })()}
                  {/* inner vignette ring */}
                  <div className="absolute inset-0 rounded-full ring-2 ring-white/70 shadow-[inset_0_0_18px_rgba(0,0,0,0.35)] pointer-events-none" />
                </div>
              </div>

              {/* top pin */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-yellow border-2 border-white shadow-md z-10 pointer-events-none" />

              {/* corners */}
              <div className="absolute -left-1 -top-1 w-3 h-3 rounded-full bg-pink border border-white shadow z-10 pointer-events-none" />
              <div className="absolute -right-1 -bottom-1 w-3 h-3 rounded-full bg-primary-green border border-white shadow z-10 pointer-events-none" />

              {/* tropical leaf accents */}
              <PalmSprig className="absolute -left-4 -top-2 w-9 h-9 pointer-events-none z-10" rotate="0deg" />
              <PalmSprig className="absolute -right-4 -bottom-2 w-9 h-9 pointer-events-none z-10" rotate="180deg" />
            </div>

            <p className="flex items-center justify-center gap-1.5 font-mono text-[10px] font-bold text-ink/50 uppercase tracking-wider">
              <Hand className="w-3.5 h-3.5 text-pink" />
              Drag the photo inside the circle to reposition
            </p>

            <div className="flex items-center justify-center gap-3">
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <RefreshCw className="w-3.5 h-3.5" /> CHANGE PHOTO
              </Button>
              {smartAlignEnabled && (
                <Button size="sm" variant="outline" onClick={handleAutoAlign}>
                  <Sparkles className="w-3.5 h-3.5" /> AUTO-ALIGN
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer py-10 flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-16 h-16 bg-pink/10 text-pink rounded-full flex items-center justify-center shadow-xs">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="font-sans text-sm font-bold text-ink uppercase tracking-wider">
                CLICK TO UPLOAD YOUR PHOTO
              </p>
              <p className="font-sans text-xs text-ink/60 mt-1">
                JPG, PNG, HEIC, WEBP · Auto-framed for pass & profile frame
              </p>
            </div>
            <div className="pt-2">
              <Button size="sm" variant="secondary">
                SELECT IMAGE FROM DEVICE
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Adjustments panel */}
      {photoUrl && (
        <div className="hh-card p-5 space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between gap-3 border-b border-primary-green/10 pb-3">
            <span className="flex items-center gap-2 font-bold text-ink">
              <Move className="w-4 h-4 text-pink" />
              PHOTO ADJUSTMENTS
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={smartAlignEnabled}
              onClick={toggleSmartAlign}
              className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink/70"
            >
              <span className={smartAlignEnabled ? 'text-pink' : 'text-ink/40'}>SMART ALIGN</span>
              <span
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  smartAlignEnabled ? 'bg-pink' : 'bg-ink/25'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    smartAlignEnabled ? 'translate-x-5' : ''
                  }`}
                />
              </span>
            </button>
          </div>

          {!smartAlignEnabled && (
            <p className="font-mono text-[10px] font-bold text-ink/50 uppercase tracking-wider bg-cream/60 border border-primary-green/10 rounded-xl px-3 py-2">
              Auto-align off — use the sliders or drag the photo to frame it manually.
            </p>
          )}

          {/* Zoom */}
          <RangeSlider
            label="ZOOM"
            icon={<ZoomIn className="w-3.5 h-3.5 text-pink" />}
            value={settings.zoom}
            min={1}
            max={2}
            step={0.05}
            accent="#FF007A"
            onChange={(v) => onSettingsChange({ ...settings, zoom: v })}
          />

          {/* Position — stacked one under the other for mobile */}
          <div className="space-y-4">
            <RangeSlider
              label="POSITION X"
              icon={<MoveHorizontal className="w-3.5 h-3.5 text-pink" />}
              value={settings.panX}
              min={PAN_MIN}
              max={PAN_MAX}
              step={1}
              accent="#0B6B3A"
              onChange={(v) => onSettingsChange({ ...settings, panX: v })}
            />
            <RangeSlider
              label="POSITION Y"
              icon={<MoveVertical className="w-3.5 h-3.5 text-pink" />}
              value={settings.panY}
              min={PAN_MIN}
              max={PAN_MAX}
              step={1}
              accent="#0B6B3A"
              onChange={(v) => onSettingsChange({ ...settings, panY: v })}
            />
          </div>

          {/* Presets */}
          <div className="pt-2">
            <label className="font-bold block mb-2 flex items-center gap-1.5 text-ink/80">
              <Sparkles className="w-3.5 h-3.5 text-pink" /> COLOR PRESETS
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['RAW', 'VIVID', 'DARK', 'WARM'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className={`py-2 px-1 text-center font-sans text-xs font-bold rounded-xl transition-all ${
                    settings.preset === p
                      ? 'bg-pink text-white shadow-xs'
                      : 'bg-cream text-ink/70 hover:bg-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* ID Card Theme Selection */}
          <div className="pt-2 border-t border-primary-green/10">
            <label className="font-bold block mb-2 flex items-center gap-1.5 text-ink/80 font-mono text-[11px] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#0B6B3A]" /> CARD THEME PALETTE
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px] font-bold">
              {[
                { id: 'TROPICAL', label: '🌴 TROPICAL' },
                { id: 'SUNSET', label: '🌅 SUNSET' },
                { id: 'CYBER', label: '⚡ CYBER' },
                { id: 'MINIMAL', label: '🍃 MINIMAL' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSettingsChange({ ...settings, cardTheme: t.id as CardTheme })}
                  className={`py-2 px-2 text-center rounded-xl transition-all ${
                    (settings.cardTheme || 'TROPICAL') === t.id
                      ? 'bg-[#0B6B3A] text-white shadow-xs font-extrabold'
                      : 'bg-cream text-ink/70 hover:bg-white border border-primary-green/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Frame Style Selection */}
          <div className="pt-2 border-t border-primary-green/10">
            <label className="font-bold block mb-2 flex items-center gap-1.5 text-ink/80 font-mono text-[11px] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#FF007A]" /> PROFILE FRAME OVERLAY
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] font-bold">
              {[
                { id: 'WREATH', label: '🌺 WREATH' },
                { id: 'SUNBURST', label: '☀️ SUNBURST' },
                { id: 'NEON', label: '💖 NEON GLOW' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onSettingsChange({ ...settings, frameStyle: f.id as FrameStyle })}
                  className={`py-2 px-2 text-center rounded-xl transition-all ${
                    (settings.frameStyle || 'WREATH') === f.id
                      ? 'bg-[#FF007A] text-white shadow-xs font-extrabold'
                      : 'bg-cream text-ink/70 hover:bg-white border border-primary-green/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface RangeSliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  accent: string;
  onChange: (value: number) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  icon,
  value,
  min,
  max,
  step,
  accent,
  onChange,
}) => {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center font-bold text-ink">
        <span className="flex items-center gap-1.5">{icon} {label}</span>
        <span
          className="font-mono text-[11px] font-extrabold px-2.5 py-0.5 rounded-full text-white shadow-xs"
          style={{ backgroundColor: accent }}
        >
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-line"
        style={
          {
            background: `linear-gradient(to right, ${accent} 0%, ${accent} ${fill}%, #E4DAC5 ${fill}%, #E4DAC5 100%)`,
            ['--accent']: accent,
          } as React.CSSProperties
        }
      />
    </div>
  );
};

interface PalmSprigProps {
  className?: string;
  rotate?: string;
}

const PalmSprig: React.FC<PalmSprigProps> = ({ className, rotate = '0deg' }) => (
  <svg
    viewBox="0 0 40 40"
    className={className}
    style={{ transform: `rotate(${rotate})` }}
    fill="none"
    aria-hidden="true"
  >
    <g stroke="#064E29" strokeWidth="3.5" strokeLinecap="round">
      <path d="M2 38 Q 8 18 2 4" />
      <path d="M2 38 Q 20 20 38 6" />
      <path d="M2 38 Q 18 26 26 4" />
    </g>
  </svg>
);

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
