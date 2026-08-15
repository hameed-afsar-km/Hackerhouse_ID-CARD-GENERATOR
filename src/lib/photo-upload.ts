import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { getClientStorage } from '@/lib/firebase/client';

function compressDataUrl(dataUrl: string, maxDim = 640, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Failed to load photo for upload'));
    img.src = dataUrl;
  });
}

function ensureBase64DataUrl(dataUrl: string): string {
  if (dataUrl.includes(';base64,')) {
    return dataUrl;
  }
  try {
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx !== -1) {
      const meta = dataUrl.substring(0, commaIdx);
      const rawContent = dataUrl.substring(commaIdx + 1);
      const decoded = decodeURIComponent(rawContent);
      // Safe base64 encoding for UTF-8 string content (e.g. SVGs)
      const b64 = typeof window !== 'undefined'
        ? btoa(unescape(encodeURIComponent(decoded)))
        : Buffer.from(decoded).toString('base64');
      const mime = meta.split(':')[1]?.split(';')[0] || 'image/svg+xml';
      return `data:${mime};base64,${b64}`;
    }
  } catch (err) {
    console.warn('Could not convert dataUrl to base64, using raw', err);
  }
  return dataUrl;
}

export async function uploadBuilderPhoto(uid: string, dataUrl: string): Promise<string> {
  if (!dataUrl) return '';

  const MAX_STORABLE = 900000; // Firestore document limit is ~1MiB
  let compressedFallback = dataUrl;

  const doUpload = async (): Promise<string> => {
    let finalDataUrl = dataUrl;
    let contentType = 'image/jpeg';

    if (dataUrl.startsWith('data:image/svg')) {
      contentType = 'image/svg+xml';
      finalDataUrl = ensureBase64DataUrl(dataUrl);
    } else if (dataUrl.startsWith('data:image/')) {
      try {
        finalDataUrl = await Promise.race([
          compressDataUrl(dataUrl),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Compression timeout')), 3000)
          ),
        ]);
        // Aggressively re-compress if the photo is still too large to store.
        if (finalDataUrl.length > MAX_STORABLE) {
          finalDataUrl = await Promise.race([
            compressDataUrl(dataUrl, 480, 0.7),
            new Promise<string>((_, reject) =>
              setTimeout(() => reject(new Error('Recompression timeout')), 3000)
            ),
          ]);
        }
      } catch (e) {
        console.warn('Image compression bypassed:', e);
      }
    }

    finalDataUrl = ensureBase64DataUrl(finalDataUrl);
    compressedFallback = finalDataUrl;

    if (!finalDataUrl.includes(';base64,')) {
      return finalDataUrl;
    }

    const storage = getClientStorage();
    const photoRef = ref(storage, `builders/${uid}/photo`);
    await uploadString(photoRef, finalDataUrl, 'data_url', { contentType });
    return await getDownloadURL(photoRef);
  };

  try {
    return await Promise.race([
      doUpload(),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout')), 5000)
      ),
    ]);
  } catch (err) {
    // If the upload fails, keep the compressed local photo so the card still
    // renders — but never return a payload too large for Firestore.
    console.warn('uploadBuilderPhoto fallback used:', err);
    return compressedFallback.length <= MAX_STORABLE ? compressedFallback : '';
  }
}
