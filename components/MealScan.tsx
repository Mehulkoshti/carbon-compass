'use client';

import { useId, useState } from 'react';

import { useToast } from '@/components/Toast';

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

interface MealItem {
  name: string;
  kg: number;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsDataURL(file);
  });
}

export function MealScan() {
  const inputId = useId();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MealItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [note, setNote] = useState('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      toast('Please upload a PNG, JPEG or WebP image.', 'error');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast('Image is too large (max 5MB).', 'error');
      return;
    }

    setLoading(true);
    setItems(null);
    try {
      const dataUrl = await readAsDataUrl(file);
      const res = await fetch('/api/scan-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl, mimeType: file.type }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.items)) {
        setItems(data.items);
        setTotal(data.totalKg ?? 0);
        setNote(data.note ?? '');
        toast(data.items.length ? 'Meal analyzed' : 'No food detected', data.items.length ? 'success' : 'info');
      } else {
        toast(data?.error || 'Could not analyze the photo.', 'error');
      }
    } catch {
      toast('Something went wrong — please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="meal-heading"
      className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft"
    >
      <h2 id="meal-heading" className="text-xl font-bold text-slate-900">
        🍽️ Estimate a meal
      </h2>
      <p className="mt-1 text-slate-600">
        Snap a photo of your plate or grocery receipt — AI estimates its food footprint.
      </p>

      <label htmlFor={inputId} className="sr-only">
        Upload a meal photo
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={loading}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="mt-4 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-4 file:py-2 file:text-white hover:file:bg-brand-700"
      />

      {loading ? (
        <p className="mt-4 animate-pulse text-sm text-slate-500" role="status">
          Analyzing your meal…
        </p>
      ) : null}

      {items && items.length > 0 ? (
        <div className="mt-5">
          <div className="rounded-xl bg-brand-50 p-4">
            <p className="text-sm text-brand-700">
              Estimated footprint: <strong>{total} kg CO₂e</strong>
            </p>
          </div>
          <ul className="mt-3 divide-y divide-slate-100">
            {items.map((it, i) => (
              <li key={i} className="flex justify-between py-2 text-sm">
                <span className="text-slate-700">{it.name}</span>
                <span className="font-medium text-slate-900">{it.kg} kg</span>
              </li>
            ))}
          </ul>
          {note ? <p className="mt-2 text-xs text-slate-400">{note}</p> : null}
        </div>
      ) : null}

      {items && items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No food items detected — try a clearer photo.</p>
      ) : null}
    </section>
  );
}
