import type { SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_MAX_DIMENSION = 1024;
const DEFAULT_QUALITY = 0.8;

export function compressImage(
  file: File,
  maxDimension = DEFAULT_MAX_DIMENSION,
  quality = DEFAULT_QUALITY
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Gagal memproses gambar'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Gagal kompresi gambar'));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Gagal memuat gambar'));
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) img.src = e.target.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    if (!file.type.startsWith('image/')) {
      reject(new Error('Hanya file gambar yang diizinkan'));
      return;
    }
    reader.readAsDataURL(file);
  });
}

export async function deleteFolderContents(
  supabase: SupabaseClient,
  bucket: string,
  folderPath: string
): Promise<void> {
  const { data: files, error } = await supabase.storage
    .from(bucket)
    .list(folderPath);
  if (error || !files?.length) return;
  const paths = files.map((f) => `${folderPath}/${f.name}`);
  await supabase.storage.from(bucket).remove(paths);
}

