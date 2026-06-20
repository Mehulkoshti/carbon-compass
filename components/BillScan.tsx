'use client';

import { useId, useState } from 'react';

import { useImageUpload } from '@/lib/useImageUpload';

type Status = 'idle' | 'loading' | 'ok' | 'error';

/**
 * Uploads an electricity-bill photo to the Vision endpoint and reports the
 * detected monthly kWh back to the parent via `onExtract`. Validation and
 * upload are handled by the shared {@link useImageUpload} hook.
 */
export function BillScan({ onExtract }: { onExtract: (kwh: number) => void }) {
  const inputId = useId();
  const { loading, validate, upload } = useImageUpload('/api/scan-bill');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const invalid = validate(file);
    if (invalid) {
      setStatus('error');
      setMessage(invalid);
      return;
    }

    setStatus('loading');
    setMessage('Reading your bill…');
    const { ok, data } = await upload(file);
    const result = data as { kwh?: number; confidence?: string; error?: string } | null;

    if (ok && typeof result?.kwh === 'number') {
      onExtract(result.kwh);
      setStatus('ok');
      setMessage(
        `Detected ${result.kwh} kWh/month (${result.confidence} confidence). Adjust below if needed.`,
      );
    } else {
      setStatus('error');
      setMessage(result?.error || "Couldn't read the value — please type it below.");
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-brand-300 bg-brand-50/50 p-4">
      <label htmlFor={inputId} className="block text-sm font-medium text-brand-700">
        📸 Scan your electricity bill (optional)
      </label>
      <p className="mt-1 text-xs text-slate-500">
        Upload a photo and AI will fill in your usage automatically.
      </p>
      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={loading}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-4 file:py-2 file:text-white hover:file:bg-brand-800"
      />
      {message ? (
        <p
          role={status === 'error' ? 'alert' : 'status'}
          className={`mt-2 text-xs ${
            status === 'error'
              ? 'text-red-600'
              : status === 'ok'
                ? 'text-brand-700'
                : 'text-slate-500'
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
