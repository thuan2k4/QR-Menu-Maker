import { getDownloadURL, ref, type FirebaseStorage, uploadBytes } from 'firebase/storage';
import { storage, storageDebugInfo, storageFallback } from '../firebase';

type MediaProvider = 'auto' | 'firebase' | 'cloudinary';

const configuredProvider = (import.meta.env.VITE_MEDIA_PROVIDER || 'auto').toLowerCase() as MediaProvider;
const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();

const isCloudinaryConfigured = Boolean(cloudinaryCloudName && cloudinaryUploadPreset);

async function uploadToCloudinary(path: string, file: File): Promise<string> {
  if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
    throw new Error('Cloudinary is not configured.');
  }

  const folder = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : 'uploads';
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryUploadPreset);
  formData.append('folder', folder);

  const response = await fetch(cloudinaryUrl, {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message || 'Cloudinary upload failed.';
    throw new Error(message);
  }

  if (!payload?.secure_url) {
    throw new Error('Cloudinary did not return secure_url.');
  }

  return payload.secure_url as string;
}

export async function uploadImageWithBucketFallback(path: string, file: File): Promise<string> {
  if (configuredProvider === 'cloudinary' && !isCloudinaryConfigured) {
    throw new Error('Cloudinary provider is selected but VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET is missing.');
  }

  const shouldTryCloudinaryFirst = (configuredProvider === 'cloudinary' || configuredProvider === 'auto') && isCloudinaryConfigured;

  if (shouldTryCloudinaryFirst) {
    try {
      return await uploadToCloudinary(path, file);
    } catch (cloudinaryError) {
      if (configuredProvider === 'cloudinary') {
        throw cloudinaryError;
      }
    }
  }

  const storageTargets: FirebaseStorage[] = [storage];
  if (storageFallback) {
    storageTargets.push(storageFallback);
  }

  let lastError: unknown;

  for (const targetStorage of storageTargets) {
    try {
      const storageRef = ref(targetStorage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export function getStorageSetupHint(): string {
  if (configuredProvider === 'cloudinary') {
    return isCloudinaryConfigured
      ? 'Dang dung Cloudinary provider.'
      : 'Cloudinary chua duoc cau hinh day du (can VITE_CLOUDINARY_CLOUD_NAME va VITE_CLOUDINARY_UPLOAD_PRESET).';
  }

  if (configuredProvider === 'auto' && isCloudinaryConfigured) {
    return 'Dang uu tien upload qua Cloudinary (neu that bai moi fallback Firebase Storage).';
  }

  const primary = storageDebugInfo.primaryBucket || 'unknown';
  const fallback = storageDebugInfo.fallbackBucket;

  if (fallback) {
    return `Storage bucket dang dung: ${primary}. He thong se thu fallback: ${fallback}.`;
  }

  return `Storage bucket dang dung: ${primary}.`;
}
