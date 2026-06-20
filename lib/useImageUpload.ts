'use client';

import { useState } from 'react';

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface UploadResult {
  ok: boolean;
  /** Parsed JSON body from the endpoint (shape depends on the route). */
  data: unknown;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * Shared client logic for the bill/meal image-scan features: validates an image
 * file, reads it as a data URL and POSTs it to the given Vision endpoint. Keeps
 * the upload/validation boilerplate in one place so the UI components stay thin.
 */
export function useImageUpload(endpoint: string) {
  const [loading, setLoading] = useState(false);

  /** Returns a user-facing error message, or null if the file is acceptable. */
  function validate(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Please upload a PNG, JPEG or WebP image.';
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return 'Image is too large (max 5MB).';
    }
    return null;
  }

  async function upload(file: File): Promise<UploadResult> {
    setLoading(true);
    try {
      const imageBase64 = await readAsDataUrl(file);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType: file.type }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch {
      return { ok: false, data: null };
    } finally {
      setLoading(false);
    }
  }

  return { loading, validate, upload };
}
