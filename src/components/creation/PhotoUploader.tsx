'use client';

import React, { useRef } from 'react';
import { Upload, ZoomIn, Move, Sparkles, RefreshCw } from 'lucide-react';
import { PhotoFilterSettings } from '@/types/dna';
import { Button } from '@/components/ui/Button';

interface PhotoUploaderProps {
  photoUrl: string;
  settings: PhotoFilterSettings;
  onPhotoChange: (url: string) => void;
  onSettingsChange: (settings: PhotoFilterSettings) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photoUrl,
  settings,
  onPhotoChange,
  onSettingsChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (10MB max client side preview)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Please select an image under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        onPhotoChange(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (preset: PhotoFilterSettings['preset']) => {
    onSettingsChange({ ...settings, preset });
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-zinc-700 bg-zinc-950 p-6 text-center rounded-none relative group hover:border-[#00FF66] transition-colors">
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
            {/* Live Crop / Pan Preview Frame */}
            <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-2 border-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.3)] bg-black">
              {/* eslint-disable-next-html-element */}
              <img
                src={photoUrl}
                alt="Builder Photo Preview"
                className="w-full h-full object-cover transition-all"
                style={{
                  transform: `scale(${settings.zoom}) translate(${settings.panX}%, ${settings.panY}%)`,
                  filter:
                    settings.preset === 'MATRIX'
                      ? 'hue-rotate(90deg) contrast(150%) brightness(90%)'
                      : settings.preset === 'DUOTONE'
                      ? 'contrast(180%) grayscale(100%) sepia(100%) hue-rotate(140deg)'
                      : settings.preset === 'SIGNAL'
                      ? 'contrast(160%) saturate(200%)'
                      : 'none',
                }}
              />
              {/* Reticle grid overlay */}
              <div className="absolute inset-0 pointer-events-none border border-white/10 flex items-center justify-center">
                <div className="w-full h-[1px] bg-white/20" />
                <div className="h-full w-[1px] bg-white/20 absolute" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                CHANGE PHOTO
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer py-12 flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#00FF66] group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                DRAG & DROP OR CLICK TO UPLOAD
              </p>
              <p className="font-mono text-xs text-zinc-500 mt-1">
                JPG, PNG, HEIC, WEBP · Auto-cropped intelligently
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

      {/* Adjustments Panel */}
      {photoUrl && (
        <div className="bg-zinc-950 border border-zinc-800 p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 font-bold border-b border-zinc-800 pb-2">
            <span className="flex items-center gap-2 text-white">
              <Move className="w-4 h-4 text-[#00FF66]" />
              PHOTO ADJUSTMENTS (OPTIONAL)
            </span>
            <span className="text-[10px] text-zinc-500">AUTO-FITTED</span>
          </div>

          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-zinc-300">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-[#00FF66]" /> ZOOM
              </span>
              <span>{Math.round(settings.zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="2"
              step="0.05"
              value={settings.zoom}
              onChange={(e) =>
                onSettingsChange({ ...settings, zoom: parseFloat(e.target.value) })
              }
              className="w-full accent-[#00FF66] bg-zinc-800 h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Pan X / Pan Y Grid Sliders */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-zinc-300">
                <span>POSITION X</span>
                <span>{settings.panX}%</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={settings.panX}
                onChange={(e) =>
                  onSettingsChange({ ...settings, panX: parseInt(e.target.value) })
                }
                className="w-full accent-[#00FF66] bg-zinc-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-zinc-300">
                <span>POSITION Y</span>
                <span>{settings.panY}%</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={settings.panY}
                onChange={(e) =>
                  onSettingsChange({ ...settings, panY: parseInt(e.target.value) })
                }
                className="w-full accent-[#00FF66] bg-zinc-800 h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Preset Filters */}
          <div className="pt-2">
            <label className="text-zinc-400 font-bold block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" /> HACKER FILTER PRESETS
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['RAW', 'DUOTONE', 'MATRIX', 'SIGNAL'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className={`py-2 px-1 text-center font-mono text-[11px] font-bold border transition-all ${
                    settings.preset === p
                      ? 'bg-[#00FF66] text-black border-[#00FF66]'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
