import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { getClientStorage } from '@/lib/firebase/client';

function compressDataUrl(dataUrl: string, maxDim = 800, quality = 0.85): Promise<string> {
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

export async function uploadBuilderPhoto(uid: string, dataUrl: string): Promise<string> {
  const compressed = await compressDataUrl(dataUrl);
  const photoRef = ref(getClientStorage(), `builders/${uid}/photo`);
  await uploadString(photoRef, compressed, 'data_url', { contentType: 'image/jpeg' });
  return getDownloadURL(photoRef);
}
