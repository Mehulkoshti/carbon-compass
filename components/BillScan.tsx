'use client';

import { useId, useState } from 'react';

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsDataURL(file);
  });
}

export function BillScan({ onExtract }: { onExtract: (kwh: number) => void }) {
  const inputId = useId();
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setStatus('error');
      setMessage('Please upload a PNG, JPEG or WebP image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus('error');
      setMessage('Image is too large (max 5MB).');
      return;
    }

    setStatus('loading');
    setMessage('Reading your bill…');
    try {
      const dataUrl = await readAsDataUrl(file);
      const res = await fetch('/api/scan-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl, mimeType: file.type }),
      });
      const data = await res.json();
      if (res.ok && typeof data?.kwh === 'number') {
        onExtract(data.kwh);
        setStatus('ok');
        setMessage(
          `Detected ${data.kwh} kWh/month (${data.confidence} confidence). Adjust below if needed.`,
        );
      } else {
        setStatus('error');
        setMessage(data?.error || "Couldn't read the value — please type it below.");
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong — please type your usage below.');
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
        disabled={status === 'loading'}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-4 file:py-2 file:text-white hover:file:bg-brand-700"
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
