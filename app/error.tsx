'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real deployment this would go to an error-reporting service.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-brand-100 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-slate-600">
        An unexpected error occurred. Your saved data is safe — try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-brand-700 px-6 py-3 font-semibold text-white hover:bg-brand-800"
      >
        Try again
      </button>
    </div>
  );
}
