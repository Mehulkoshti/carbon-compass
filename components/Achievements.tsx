'use client';

import { Badge, earnedCount } from '@/lib/achievements';

export function Achievements({ badges }: { badges: Badge[] }) {
  const earned = earnedCount(badges);

  return (
    <section
      aria-labelledby="badges-heading"
      className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="badges-heading" className="text-xl font-bold text-slate-900">
          🏅 Achievements
        </h2>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
          {earned} / {badges.length} unlocked
        </span>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((b) => (
          <li
            key={b.id}
            className={`flex items-start gap-3 rounded-xl border p-3 transition ${
              b.earned
                ? 'border-brand-200 bg-brand-50'
                : 'border-slate-100 bg-slate-50 opacity-60'
            }`}
            title={b.description}
          >
            <span
              aria-hidden="true"
              className={`text-2xl ${b.earned ? '' : 'grayscale'}`}
            >
              {b.earned ? b.icon : '🔒'}
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-900">{b.title}</span>
              <span className="block text-xs text-slate-500">{b.description}</span>
              <span className="sr-only">{b.earned ? 'Unlocked' : 'Locked'}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
