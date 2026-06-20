'use client';

import { useId, useState } from 'react';

import { useToast } from '@/components/Toast';
import { useImageUpload } from '@/lib/useImageUpload';

interface MealItem {
  name: string;
  kg: number;
}

interface MealResponse {
  items?: MealItem[];
  totalKg?: number;
  note?: string;
  error?: string;
}

/**
 * Uploads a meal/grocery photo to the Vision endpoint and shows an itemized
 * food-carbon estimate. Validation and upload are handled by the shared
 * {@link useImageUpload} hook; results are surfaced via toasts.
 */
export function MealScan() {
  const inputId = useId();
  const toast = useToast();
  const { loading, validate, upload } = useImageUpload('/api/scan-meal');
  const [items, setItems] = useState<MealItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [note, setNote] = useState('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const invalid = validate(file);
    if (invalid) {
      toast(invalid, 'error');
      return;
    }

    setItems(null);
    const { ok, data } = await upload(file);
    const result = data as MealResponse | null;

    if (ok && Array.isArray(result?.items)) {
      setItems(result.items);
      setTotal(result.totalKg ?? 0);
      setNote(result.note ?? '');
      toast(
        result.items.length ? 'Meal analyzed' : 'No food detected',
        result.items.length ? 'success' : 'info',
      );
    } else {
      toast(result?.error || 'Could not analyze the photo.', 'error');
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
        className="mt-4 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-4 file:py-2 file:text-white hover:file:bg-brand-800"
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
          {note ? <p className="mt-2 text-xs text-slate-500">{note}</p> : null}
        </div>
      ) : null}

      {items && items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No food items detected — try a clearer photo.</p>
      ) : null}
    </section>
  );
}
