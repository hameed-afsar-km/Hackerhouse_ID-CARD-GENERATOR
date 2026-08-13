import { PhotoFilterSettings } from '@/types/builder';

// Heuristic skin-tone detection so the uploader can auto-align faces.
// This is ALIGNMENT, never cropping: zoom is always kept at 1 so the full
// photo stays visible. We only nudge the image so the detected face sits in
// the center of the circular frame. Panning is applied along the axis where
// the photo is wider/taller than the frame, so no empty space is revealed.
export function computeSmartAlign(
  img: HTMLImageElement
): Pick<PhotoFilterSettings, 'zoom' | 'panX' | 'panY'> {
  const MAX_DIM = 200;
  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { zoom: 1, panX: 0, panY: 0 };

  ctx.drawImage(img, 0, 0, w, h);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return { zoom: 1, panX: 0, panY: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isSkinTone(r, g, b)) {
        sumX += x;
        sumY += y;
        count++;
      }
    }
  }

  const area = w * h;
  if (count < Math.max(80, area * 0.01)) {
    return { zoom: 1, panX: 0, panY: 0 };
  }

  const fx = sumX / count / w; // normalized face center (0..1)
  const fy = sumY / count / h;

  const imgRatio = img.width / img.height;
  const MAX_PAN = 50;

  let panX = 0;
  let panY = 0;
  if (imgRatio > 1) {
    // Landscape: the image is wider than the frame, so align horizontally.
    panX = clamp(imgRatio * (0.5 - fx) * 100, -MAX_PAN, MAX_PAN);
  } else if (imgRatio < 1) {
    // Portrait: the image is taller than the frame, so align vertically.
    panY = clamp((1 / imgRatio) * (0.5 - fy) * 100, -MAX_PAN, MAX_PAN);
  }

  return { zoom: 1, panX, panY };
}

function isSkinTone(r: number, g: number, b: number): boolean {
  const Y = 0.299 * r + 0.587 * g + 0.114 * b;
  const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

  const ycbcr =
    Y > 60 && Cb >= 77 && Cb <= 127 && Cr >= 133 && Cr <= 173;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const rgb =
    r > 95 && g > 40 && b > 20 && max - min > 15 && Math.abs(r - g) > 15 && r > g && r > b;

  return ycbcr || rgb;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
