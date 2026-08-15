'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { BuilderIdentity } from '@/types/builder';
import { BuilderCardCanvas } from './BuilderCardCanvas';
import { ProfileFrameCanvas } from './ProfileFrameCanvas';

interface FullscreenCardOverlayProps {
  builder: BuilderIdentity;
  mode: 'card' | 'frame';
  open: boolean;
  onClose: () => void;
}

export const FullscreenCardOverlay: React.FC<FullscreenCardOverlayProps> = ({
  builder,
  mode,
  open,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const isCard = mode === 'card';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-5 sm:p-8"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#FF007A] text-white flex items-center justify-center shadow-lg hover:bg-[#E0006C] active:scale-95 transition-all cursor-pointer"
            title="Close Fullscreen"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center justify-center"
            style={{
              width: isCard
                ? 'min(100%, calc((100dvh - 6rem) * 0.75))'
                : 'min(100%, calc(100dvh - 6rem))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isCard ? (
              <BuilderCardCanvas builder={builder} className="w-full" />
            ) : (
              <ProfileFrameCanvas builder={builder} className="w-full" />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
