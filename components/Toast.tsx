'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<(message: string, type?: ToastType) => void>(() => {});

/** Call this from any client component to show a transient toast. */
export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

const STYLES: Record<ToastType, string> = {
  success: 'bg-brand-700 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-slate-800 text-white',
};

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '!',
  info: 'ℹ',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId;
    setItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-fade-up flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium shadow-lift ${STYLES[t.type]}`}
          >
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-xs"
            >
              {ICONS[t.type]}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
